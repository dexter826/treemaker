import * as z from 'zod';

export const treeSchema = z.object({
  name: z.string({ error: 'Tên gia phả là bắt buộc' })
    .min(2, 'Tên gia phả phải có ít nhất 2 ký tự')
    .max(50, 'Tên gia phả không được quá 50 ký tự'),
});

export type TreeFormValues = z.infer<typeof treeSchema>;
