<div align="center">
  <img src="public/og-image.png" alt="TreeMaker Banner" width="100%" />

**Nền tảng xây dựng gia phả trực quan, tương tác và bảo mật.**

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![React Flow](https://img.shields.io/badge/React_Flow-Visualization-FF0072?style=for-the-badge&logo=react)](https://reactflow.dev/)

[Giới thiệu](#giới-thiệu) • [Tính năng](#tính-năng-chính) • [Công nghệ](#công-nghệ-sử-dụng) • [Cài đặt](#cài-đặt-và-chạy-thử) • [Cấu trúc](#cấu-trúc-thư-mục)

</div>

---

## Giới thiệu

**TreeMaker** là ứng dụng web mã nguồn mở dùng để ghi chép, lập sơ đồ và lưu trữ gia phả dòng họ. Ứng dụng hỗ trợ dựng cây phả hệ tương tác trực tiếp trên nền canvas 2D, tích hợp AI hỗ trợ tìm hiểu thông tin thành viên và cho phép xuất toàn bộ dữ liệu ra sách kỷ yếu (PDF).

## Tính năng chính

- **Canvas tương tác 2D**: Kéo thả, phóng to thu nhỏ và tự động sắp xếp sơ đồ gia phả bằng React Flow (`@xyflow/react`) kết hợp thuật toán Dagre.
- **Trợ lý AI**: Tích hợp OpenRouter để tóm tắt thông tin thành viên, gợi ý tiểu sử và giải đáp thắc mắc về các thế hệ trong gia đình.
- **Xuất kỷ yếu PDF**: Tạo và xuất dữ liệu gia phả thành sách kỷ yếu dạng PDF (LegacyBook) bằng jsPDF.
- **Bảo mật với Supabase RLS**: Toàn bộ dữ liệu được lưu trữ trên PostgreSQL và phân quyền chặt chẽ theo tài khoản qua Row Level Security.
- **Đồng bộ thời gian thực**: Cập nhật ngay các thay đổi trên sơ đồ giữa các thiết bị.
- **Quản lý hồ sơ thành viên**: Lưu trữ thông tin ngày sinh, ngày mất, quê quán, quốc kỳ và ảnh chân dung (qua Supabase Storage).
- **Giao diện thích ứng**: Hiển thị mượt mà trên cả máy tính lẫn thiết bị di động.

## Công nghệ sử dụng

- **Giao diện**: Next.js 15 (App Router), React 19, Tailwind CSS 4, Motion, Lucide Icons, Shadcn UI base.
- **Canvas & Layout**: React Flow (`@xyflow/react`), Dagre.
- **Cơ sở dữ liệu & Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime).
- **Quản lý trạng thái**: Zustand, Immer.
- **Trí tuệ nhân tạo**: OpenRouter qua Vercel AI SDK.
- **Xuất tài liệu**: jsPDF.

## Cài đặt và chạy thử

### Yêu cầu

- Node.js 20 trở lên
- npm, pnpm hoặc yarn
- Tài khoản [Supabase](https://supabase.com/) và [OpenRouter](https://openrouter.ai/)

### Các bước cài đặt

1. **Tải mã nguồn:**
   ```bash
   git clone https://github.com/dexter826/treemaker.git
   cd treemaker
   ```

2. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường:**
   Tạo file `.env` từ file mẫu:
   ```bash
   cp .env.example .env
   ```
   Cập nhật các thông tin kết nối cần thiết:
   | Biến | Mô tả |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | URL dự án trên Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anon Key từ Supabase |
   | `OPENROUTER_API_KEY` | Khóa API từ [OpenRouter](https://openrouter.ai/keys) |

4. **Khởi tạo cơ sở dữ liệu:**
   Chạy lần lượt các tệp SQL trong thư mục `supabase/migrations/` trên giao diện SQL Editor của Supabase để tạo bảng và chính sách bảo mật RLS.

5. **Khởi chạy ứng dụng:**
   ```bash
   npm run dev       # Khởi chạy môi trường phát triển (mặc định tại http://localhost:3000)
   npm run build     # Đóng gói sản phẩm (production build)
   npm run lint      # Kiểm tra lỗi quy chuẩn code với ESLint
   ```

## Cấu trúc thư mục

```text
treemaker/
├── docs/                 # Tài liệu dự án và các quyết định kiến trúc (ADR)
├── public/               # Tệp tĩnh (ảnh, biểu tượng, animation)
├── src/
│   ├── app/              # Router và các trang của Next.js (App Router)
│   ├── components/       # Component giao diện dùng chung (Shadcn UI)
│   ├── features/         # Các module nghiệp vụ chính (Deep Modules)
│   │   ├── ai/           # Trợ lý AI và tích hợp OpenRouter
│   │   ├── auth/         # Đăng nhập và xác thực người dùng
│   │   ├── person/       # Quản lý thành viên, biểu mẫu và dữ liệu cá nhân
│   │   └── tree/         # Canvas gia phả, thuật toán layout và xuất PDF kỷ yếu
│   ├── hooks/            # Custom React hooks dùng chung
│   ├── lib/              # Tiện ích, store trạng thái và client Supabase
│   └── types/            # Khai báo kiểu TypeScript dùng chung
└── supabase/             # Cấu hình và migration database
```

---

<div align="center">
  Phát triển bởi <a href="https://github.com/dexter826">dexter826</a> dành cho gia đình.
</div>
