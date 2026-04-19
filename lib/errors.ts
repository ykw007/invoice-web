export class UnauthorizedError extends Error {
  constructor() {
    super("인증이 만료되었습니다.");
    this.name = "UnauthorizedError";
  }
}
