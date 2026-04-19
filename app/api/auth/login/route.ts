import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { loginSchema } from "@/lib/schemas/auth.schema";
import { findUserByEmail } from "@/lib/notion/db/users";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  const body: unknown = await request.json();
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return fail(result.error.errors[0]?.message ?? "입력값이 올바르지 않습니다.", 400);
  }

  const { email, password } = result.data;

  const user = await findUserByEmail(email);
  if (!user) {
    return fail("이메일 또는 비밀번호가 올바르지 않습니다.", 401);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return fail("이메일 또는 비밀번호가 올바르지 않습니다.", 401);
  }

  const token = await signToken({ userId: user.pageId, email: user.email });

  return ok({ token, user: { id: user.pageId, name: user.name, email: user.email } });
}
