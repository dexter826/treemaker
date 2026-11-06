# Supabase RLS là ranh giới phân quyền

Quyền đọc/ghi dữ liệu của một FamilyTree do chính sách RLS trong PostgreSQL quyết định; `src/features/*/services` chỉ gửi query và tin vào kết quả trả về, không kiểm tra ownership lần hai. `supabase/migrations/20240507000000_schema.sql:226-264` bật RLS cho ba bảng và khai báo 10 policy.

## Considered Options

- Kiểm tra quyền trong service: rejected — mỗi lệnh gọi Supabase từ client đều bỏ qua lớp đó, nên nó không bao giờ là ranh giới thật.

## Consequences

- Nhánh đọc của mọi policy là `owner_id = auth.uid() OR visibility = 'public'`: cây public thì không cần đăng nhập vẫn xem được.
- Nhánh ghi của `Persons Manage` và `Relations Manage` là `owner_id = auth.uid() OR share_permission = 'edit'`, không kèm điều kiện xác thực nào khác.
- `share_token` và `share_password` không xuất hiện trong bất kỳ policy nào; cả hai chỉ được kiểm tra ở tầng ứng dụng (`treeService.getByShareToken`, `share-tree-client.tsx:51`).
- Hệ quả: FamilyTree để `private` thì link chia sẻ không mở được với người nhận, kể cả khi họ giữ đúng token. Quyền xem cây private chỉ thuộc owner; muốn mở cho khách phải đổi policy, không phải đổi code tầng app.
- Đổi schema bắt buộc kèm migration SQL; sửa tay trên Supabase dashboard sẽ làm mã và thực tế lệch nhau.
