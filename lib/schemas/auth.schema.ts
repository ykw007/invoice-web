import { z } from "zod";
import { emailSchema, passwordSchema, requiredString } from "./common.schema";

/** 로그인 폼 스키마 */
export const loginSchema = z.object({
  email: emailSchema,
  // 로그인 시에는 형식 검증 없이 입력 여부만 확인 (UX 고려, 회원가입은 passwordSchema 사용)
  password: z.string().min(1, "비밀번호를 입력해주세요."),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/** 회원가입 폼 스키마 */
export const registerSchema = z
  .object({
    name: requiredString("이름"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요."),
    agreeToTerms: z
      .boolean()
      .refine((v) => v === true, "이용약관에 동의해주세요."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
