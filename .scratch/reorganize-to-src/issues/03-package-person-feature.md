# 03: Đóng gói Feature Person thành Deep Module

**What to build:** Gom toàn bộ logic quản lý Person (thành viên gia phả) từ các thư mục phân tán về feature Person độc lập. Đóng gói form nhập liệu, upload ảnh đại diện, modal xem chi tiết, thao tác hành động thẻ, validation schema, service gọi dữ liệu, và tiện ích tính toán quan hệ. Toàn bộ logic nội bộ được ẩn kín, chỉ xuất ra các component và hook cần thiết qua public entry point duy nhất.

**Blocked by:** 01: Thiết lập cấu trúc src và di chuyển tầng Shared

**Status:** resolved

- [x] Toàn bộ logic nghiệp vụ, giao diện và dịch vụ của Person được gom về feature Person.
- [x] Tuân thủ thuật ngữ chuẩn `Person` đã định nghĩa trong domain glossary.
- [x] Feature Person xuất ra public interface rõ ràng qua entry point duy nhất (form, modal chi tiết, validation, service).
- [x] Mọi chi tiết nội bộ được giấu kín khỏi các module bên ngoài.

## Answer

Đã hoàn thành đóng gói Feature Person thành Deep Module:
- `src/features/person/` (components, services, validations, utils)
- `src/features/person/index.ts` (public entry point)
- Cập nhật các module tiêu thụ (`person-node`, `sidebar`, `tree-toolbar`, `tree-client`, `tree.service`) import qua `@/features/person`.
- Xác minh `npx tsc --noEmit` và `npm run build` thành công 100%.
