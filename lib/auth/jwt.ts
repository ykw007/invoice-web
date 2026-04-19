import { SignJWT, jwtVerify } from "jose";

interface JwtPayload {
  userId: string;
  email: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("환경변수 NEXTAUTH_SECRET이 설정되지 않았습니다.");
  }
  return new TextEncoder().encode(secret);
}

/** JWT 발급 (만료: 7일) */
export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

/** JWT 검증 — 유효하면 payload, 실패하면 null */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.userId === "string" &&
      typeof payload.email === "string"
    ) {
      return { userId: payload.userId, email: payload.email };
    }
    return null;
  } catch {
    return null;
  }
}
