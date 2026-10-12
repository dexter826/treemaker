# 03: Refactor Tree Feature

**What to build:** Khép kín chu trình Review Chuẩn A và Refactor Chuẩn C cho module lõi `tree`. Chuẩn hoá danh pháp miền theo `GLOSSARY.md` (`FamilyTree`, `Relationship`, `LegacyBook`), tái cấu trúc tương tác đồ thị và custom hooks (`useTreeFlow`, `useTreeConnections`), tách rời logic xuất bản PDF (`LegacyBook`) khỏi canvas UI HUD, và củng cố Deep Module `src/features/tree/index.ts`.

**Blocked by:** 02: Refactor Person Feature

**Status:** ready-for-agent

- [ ] Hoàn thành Báo cáo Review Chuẩn A cho module `tree`.
- [ ] Chuẩn hoá danh pháp miền trong code/types/comments theo `GLOSSARY.md` (`FamilyTree`, `Relationship`, `LegacyBook`).
- [ ] Tái cấu trúc hooks `useTreeFlow` và `useTreeConnections`: giảm thiểu coupling, tối ưu hoá callback và xử lý kết nối quan hệ.
- [ ] Tách biệt `pdf.service.ts` và `legacy-book-template.tsx` khỏi HUD điều khiển canvas, đảm bảo in ấn/tải PDF độc lập.
- [ ] Làm sạch `tree.service.ts` và các modal quản lý sự kiện/chia sẻ gia phả.
- [ ] Cập nhật public API `src/features/tree/index.ts`.
- [ ] Kiểm tra xác thực `npm run lint` và `npm run build` vượt qua thành công với 0 lỗi.
