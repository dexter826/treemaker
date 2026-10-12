# 02: Refactor Person Feature

**What to build:** Khép kín chu trình Review Chuẩn A và Refactor Chuẩn C cho module `person`. Chuẩn hoá danh pháp miền theo `GLOSSARY.md` (thực thể `Person`), tối ưu hóa xử lý lỗi bất đồng bộ trong `person.service.ts`, làm sạch `avatar-upload.tsx` và `person-form.tsx`, loại bỏ các lỗi nuốt exception, và đóng gói Deep Module hoàn chỉnh qua `index.ts`.

**Blocked by:** 01: Refactor Auth Feature

**Status:** resolved

- [x] Hoàn thành Báo cáo Review Chuẩn A cho module `person`.
- [x] Chuẩn hoá danh pháp theo `GLOSSARY.md` (đảm bảo dùng `Person`, không dùng `Member`, `User`, `Individual`).
- [x] Rà soát và nâng cấp `person.service.ts`: xử lý lỗi tường minh, không nuốt exception, chuẩn hóa dữ liệu trả về.
- [x] Tái cấu trúc `avatar-upload.tsx` và `person-form.tsx`: quản lý state crop ảnh và form dữ liệu nhân khẩu học sạch sẽ.
- [x] Cập nhật public API `src/features/person/index.ts`.
- [x] Kiểm tra xác thực `npm run lint` và `npm run build` vượt qua thành công với 0 lỗi.
