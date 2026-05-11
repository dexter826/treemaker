import * as z from 'zod';

export const authSchema = z.object({
  email: z.string({ error: 'Email là bắt buộc' }).email('Email không đúng định dạng'),
  password: z.string({ error: 'Mật khẩu là bắt buộc' }).min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.confirmPassword !== undefined && data.confirmPassword !== data.password) {
    return false;
  }
  return true;
}, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export type AuthFormValues = z.infer<typeof authSchema>;
