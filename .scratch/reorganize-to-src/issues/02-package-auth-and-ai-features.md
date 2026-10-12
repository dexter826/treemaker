# 02: Đóng gói Feature Auth và Feature AI thành Deep Modules

**What to build:** Gom toàn bộ logic xác thực (form xác thực, validation schema, auth hooks) thành feature Auth, và toàn bộ logic trợ lý AI (chatbot widget, cấu hình streaming, provider settings) thành feature AI. Cả hai feature được đóng gói theo mô hình Deep Module, giấu toàn bộ chi tiết triển khai nội bộ và chỉ xuất ra public interface qua tệp entry point duy nhất.

**Blocked by:** 01: Thiết lập cấu trúc src và di chuyển tầng Shared

**Status:** resolved

- [x] Feature Auth được đóng gói hoàn chỉnh với components, validations, và một entry point public duy nhất.
- [x] Feature AI được đóng gói hoàn chỉnh với chatbot component, AI configuration, và một entry point public duy nhất.
- [x] Các trang điều hướng liên quan (như trang đăng nhập và API route chat) chuyển sang import trực tiếp từ public entry point của Auth và AI.
- [x] Không có mã nguồn bên ngoài nào import xuyên thấu vào subfolder nội bộ của hai feature này.

## Answer

Đã hoàn thành đóng gói Feature Auth và Feature AI thành Deep Modules:

- `src/features/auth/` với public entry point `src/features/auth/index.ts`
- `src/features/ai/` với public entry point `src/features/ai/index.ts`
- Cập nhật `app/login/page.tsx` và `app/api/chat/route.ts` sang import từ `@/features/auth` và `@/features/ai`.
- Xác minh `npx tsc --noEmit` thành công 100%.
