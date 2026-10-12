import { z } from 'zod';

export const shareSchema = z.object({
  visibility: z.enum(['private', 'public']),
  share_permission: z.enum(['view', 'edit']),
  share_password: z.string()
    .min(4, "Mật khẩu phải có 4 chữ số")
    .max(4, "Mật khẩu phải có 4 chữ số")
    .regex(/^[0-9]+$/, "Chỉ cho phép nhập số")
    .optional()
    .or(z.literal('')),
});

export type ShareFormValues = z.infer<typeof shareSchema>;
