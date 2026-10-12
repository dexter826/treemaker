# 02: Đóng gói Feature Auth và Feature AI thành Deep Modules

**What to build:** Gom toàn bộ logic xác thực (form xác thực, validation schema, auth hooks) thành feature Auth, và toàn bộ logic trợ lý AI (chatbot widget, cấu hình streaming, provider settings) thành feature AI. Cả hai feature được đóng gói theo mô hình Deep Module, giấu toàn bộ chi tiết triển khai nội bộ và chỉ xuất ra public interface qua tệp entry point duy nhất.

**Blocked by:** 01: Thiết lập cấu trúc src và di chuyển tầng Shared

**Status:** ready-for-agent

- [ ] Feature Auth được đóng gói hoàn chỉnh với components, validations, và một entry point public duy nhất.
- [ ] Feature AI được đóng gói hoàn chỉnh với chatbot component, AI configuration, và một entry point public duy nhất.
- [ ] Các trang điều hướng liên quan (như trang đăng nhập và API route chat) chuyển sang import trực tiếp từ public entry point của Auth và AI.
- [ ] Không có mã nguồn bên ngoài nào import xuyên thấu vào subfolder nội bộ của hai feature này.
