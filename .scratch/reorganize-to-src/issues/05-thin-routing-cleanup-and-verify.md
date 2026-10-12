# 05: Di chuyển App Router sang Thin Routing, Dọn dẹp và Xác minh toàn diện

**What to build:** Di chuyển toàn bộ App Router vào trong `src/app/`, biến các file `page.tsx`, `layout.tsx` và `route.ts` thành các thin wrappers mỏng kết nối tới các public entry points của các feature. Dọn dẹp và xóa bỏ hoàn toàn các thư mục rỗng chưa sử dụng (dashboard) và các file cũ đã được di chuyển. Chạy kiểm tra toàn diện để chứng minh 100% ứng dụng biên dịch sạch và không có bất kỳ hồi quy nào.

**Blocked by:** 02: Đóng gói Feature Auth và Feature AI thành Deep Modules, 04: Đóng gói Feature Tree thành Deep Module

**Status:** resolved

- [x] Toàn bộ App Router nằm trong `src/app/` và chỉ đóng vai trò mỏng kết nối URL với các feature containers.
- [x] Xóa bỏ hoàn toàn các thư mục rỗng và các thư mục cũ không còn sử dụng.
- [x] Toàn bộ đường dẫn import trong ứng dụng đều phân giải chính xác qua path alias mới.
- [x] Lệnh kiểm tra biên dịch production (`npm run build` hoặc `tsc --noEmit`) vượt qua hoàn hảo không có bất kỳ lỗi nào.
- [x] Toàn bộ trải nghiệm người dùng hiện tại (đăng nhập, xem và sửa cây gia phả, trò chuyện AI, chia sẻ) được giữ nguyên 100%.

## Answer

Đã hoàn thành di chuyển toàn bộ App Router vào `src/app/` và dọn dẹp hệ thống:

- `src/app/` (toàn bộ pages, layouts, routing handlers, globals.css)
- `src/middleware.ts`
- Xóa bỏ hoàn toàn các thư mục rỗng `components/`, `app/`, `lib/`, `dashboard/` ở root.
- Cập nhật `components.json` và thu hẹp path alias trong `tsconfig.json` về `@/*: ./src/*`.
- Xác minh `npx tsc --noEmit` và `npm run build` vượt qua 100% không lỗi.
