import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { registerSchema } from "@/lib/schemas/auth.schema";
import { findUserByEmail, createUser } from "@/lib/notion/db/users";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  const body: unknown = await request.json();
  const result = registerSchema.safeParse(body);
  if (!result.success) {
    return fail(result.error.errors[0]?.message ?? "입력값이 올바르지 않습니다.", 400);
  }

  const { name, email, password } = result.data;

  const existing = await findUserByEmail(email);
  if (existing) {
    return fail("이미 사용 중인 이메일입니다.", 400);
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(name, email, passwordHash);
  const token = await signToken({ userId: user.pageId, email: user.email });

  return ok(
    { token, user: { id: user.pageId, name: user.name, email: user.email } },
    201
  );
}
