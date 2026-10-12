# 04: Refactor AI Feature

**What to build:** Khép kín chu trình Review Chuẩn A và Refactor Chuẩn C cho module `ai`. Đảm bảo chatbot AI chỉ tiếp cận dữ liệu cây gia phả và thành viên qua public interface của các feature (`tree`, `person`), tái cấu trúc streaming state, xử lý lỗi API mượt mà và bảo toàn neo-brutalist design tokens.

**Blocked by:** 03: Refactor Tree Feature

**Status:** resolved

- [x] Hoàn thành Báo cáo Review Chuẩn A cho module `ai`.
- [x] Tái cấu trúc `tree-chatbot.tsx` và `config.ts`: cô lập việc nạp dữ liệu gia phả qua API chuẩn của `tree` và `person`.
- [x] Xử lý quản lý lỗi khi gọi OpenRouter / AI SDK, cung cấp fallback UI thân thiện khi stream bị gián đoạn.
- [x] Cập nhật public API `src/features/ai/index.ts`.
- [x] Kiểm tra xác thực `npm run lint` và `npm run build` vượt qua thành công với 0 lỗi.
