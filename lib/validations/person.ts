import * as z from 'zod';

export const basePersonSchema = z.object({
  full_name: z.string({ error: 'Họ tên là bắt buộc' }).min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  gender: z.enum(['male', 'female'], {
    error: 'Vui lòng chọn giới tính',
  }),
  nickname: z.string().nullable().optional(),
  birth_date: z.string().nullable().optional().refine((date) => {
    if (!date) return true;
    return new Date(date) <= new Date();
  }, 'Ngày sinh không thể ở tương lai'),
  death_date: z.string().nullable().optional(),
  sibling_order: z.number().int().min(0, 'Thứ tự sinh phải từ 0 trở lên').nullable().optional(),
  occupation: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  country_code: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  avatar_file: z.any().nullable().optional(),
});

export const personSchema = basePersonSchema.refine((data) => {
  if (data.birth_date && data.death_date) {
    return new Date(data.death_date) >= new Date(data.birth_date);
  }
  return true;
}, {
  message: 'Ngày mất phải sau hoặc bằng ngày sinh',
  path: ['death_date'],
});

export type PersonFormValues = z.infer<typeof personSchema>;
