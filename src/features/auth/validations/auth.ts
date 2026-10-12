import * as z from 'zod';

export type AuthMode = 'login' | 'signup' | 'forgot';

export const authSchema = z
  .object({
    mode: z.enum(['login', 'signup', 'forgot']),
    email: z
      .string()
      .min(1, 'Email là bắt buộc')
      .email('Email không đúng định dạng'),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    rememberMe: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'login' || data.mode === 'signup') {
      if (!data.password || data.password.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Mật khẩu là bắt buộc',
          path: ['password'],
        });
      } else if (data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Mật khẩu phải có ít nhất 6 ký tự',
          path: ['password'],
        });
      }
    }

    if (data.mode === 'signup') {
      if (!data.confirmPassword || data.confirmPassword.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Vui lòng xác nhận mật khẩu',
          path: ['confirmPassword'],
        });
      } else if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Mật khẩu xác nhận không khớp',
          path: ['confirmPassword'],
        });
      }
    }
  });

export type AuthFormValues = z.infer<typeof authSchema>;
