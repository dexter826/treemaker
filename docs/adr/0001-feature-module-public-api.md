# Feature module với public API qua `index.ts`

Toàn bộ nghiệp vụ nằm trong `src/features/<slice>` và chỉ được truy cập từ ngoài qua `index.ts` của slice đó; không import thẳng vào file nội bộ. Lý do: module phải giấu được layout, form và service bên trong để thay đổi mà không chạm tầng khác.

## Considered Options

- Feature-Sliced Design đúng nghĩa (`entities/`, `widgets/`, `pages/`, `shared/`): rejected — ba slice không đủ lớn để trả chi phí tầng.
- Layout mặc định của Next.js (`components/`, `lib/`, `hooks/`): rejected — nghiệp vụ bị rải theo loại file thay vì theo khái niệm.

## Consequences

- `src/components/ui` chỉ chứa primitive từ shadcn/ui; component mang nghiệp vụ phải ở `src/features`.
- Feature được phép import feature khác (`tree` dùng `person` và `auth`), điều FSD cấm. Ranh giới thật sự là `index.ts`, không phải tên thư mục.
- Không có ESLint rule nào ép ranh giới này; nó duy trì bằng thói quen, nên deep import là lỗi phải tự soi khi review.
