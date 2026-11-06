import { z } from 'zod';

export const shareSchema = z.object({
  visibility: z.enum(['private', 'public']),
  share_permission: z.enum(['view', 'edit']),
  // null là "không đặt mật khẩu"; chuỗi rỗng không còn là giá trị hợp lệ,
  // vì cây share_password rỗng bị tầng chia sẻ coi như không có cổng.
  share_password: z
    .string()
    .length(4, 'Mật khẩu phải có 4 chữ số')
    .regex(/^[0-9]+$/, 'Chỉ cho phép nhập số')
    .nullable(),
});

export type ShareFormValues = z.infer<typeof shareSchema>;
