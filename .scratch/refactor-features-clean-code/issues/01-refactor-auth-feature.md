# 01: Refactor Auth Feature

**What to build:** Khép kín chu trình Review Chuẩn A và Refactor Chuẩn C cho module `auth`. Tách rời hoàn toàn giao diện người dùng khỏi SDK Supabase bằng việc bổ sung `AuthService`, tái cấu trúc schema validation Zod theo từng chế độ (đăng nhập, đăng ký, khôi phục) để hiển thị lỗi inline chính xác, loại bỏ hoàn toàn non-null assertions và xử lý triệt để input chết `rememberMe`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Hoàn thành và chốt Báo cáo Review Chuẩn A cho module `auth`.
- [ ] Xây dựng `auth.service.ts` đóng gói các phương thức `signIn`, `signUp`, `resetPassword`, `signOut`, `getSession` kèm chuẩn hóa thông báo lỗi tiếng Việt.
- [ ] Tách Zod validation schema trong `auth.ts` thành các schema chuyên biệt theo từng mode (`loginSchema`, `signupSchema`, `forgotSchema`) loại bỏ hoàn toàn non-null assertion (`!`).
- [ ] Cập nhật `auth-form.tsx` sử dụng `AuthService`, schema mới, reset form đúng lúc khi chuyển mode, và xử lý đúng trạng thái ghi nhớ đăng nhập.
- [ ] Cập nhật public API `src/features/auth/index.ts` xuất khẩu đầy đủ `AuthForm`, `AuthService`, và các kiểu dữ liệu liên quan.
- [ ] Kiểm tra xác thực `npm run lint` và `npm run build` vượt qua thành công với 0 lỗi.
