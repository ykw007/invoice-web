import bcrypt from "bcryptjs";

/** 비밀번호 해시 생성 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

/** 평문 비밀번호와 해시 비교 */
export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
