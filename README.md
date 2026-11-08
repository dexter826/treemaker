# TreeMaker

<p align="center">
  <img src="public/brand/lockup-horizontal.svg" alt="TreeMaker" width="360" />
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" /></a>
  <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" /></a>
</p>

TreeMaker là ứng dụng web xây dựng, trực quan hóa và lưu trữ gia phả dòng họ. Ứng dụng hỗ trợ dựng sơ đồ phả hệ trên canvas 2D, quản lý hồ sơ nhân khẩu học và xuất bản ấn phẩm kỷ yếu gia phả (LegacyBook) dạng PDF.

## Tính năng chính

- **Sơ đồ phả hệ tương tác:** Xây dựng và điều hướng cây phả hệ trên canvas 2D với bố cục tự động bằng Dagre.
- **Hồ sơ nhân khẩu & Quan hệ:** Quản lý thông tin cá nhân đa thế hệ, thiết lập quan hệ hôn phối và phân nhánh trực hệ.
- **Điểm neo phả hệ:** Tự động thiết lập nhân vật khởi tổ (Root Person) khi khởi tạo sơ đồ mới.
- **Kỷ yếu gia phả:** Xuất bản tài liệu phả hệ hoàn chỉnh định dạng PDF chất lượng cao phục vụ in ấn.
- **Đồng bộ thời gian thực**: Cập nhật trạng thái sơ đồ giữa các thiết bị thông qua Supabase Realtime.
- **Phân quyền truy cập**: Bảo mật dữ liệu trên PostgreSQL qua cơ chế Row Level Security (RLS) của Supabase.

## Công nghệ sử dụng

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Motion.
- **Canvas & Bố cục**: @xyflow/react, Dagre.
- **Backend & Lưu trữ**: Supabase (PostgreSQL, Auth, Storage, Realtime).
- **Quản lý trạng thái & Tiện ích**: Zustand, Immer, jsPDF, Zod.

## Cài đặt

### Yêu cầu hệ thống

- Node.js >= 20.0.0
- Trình quản lý gói: npm (hoặc pnpm / yarn)
- Tài khoản Supabase và một dự án đang hoạt động

### Các bước cài đặt

```bash
# 1. Tải mã nguồn về máy
git clone https://github.com/dexter826/treemaker.git
cd treemaker

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Tạo tệp cấu hình môi trường
cp .env.example .env

# 4. Khởi chạy máy chủ phát triển
npm run dev
```

## Cấu hình

Khai báo các biến môi trường trong tệp `.env`:

| Biến                            | Bắt buộc | Mô tả                                          |
| :------------------------------ | :------: | :--------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      |    Có    | URL dự án trên Supabase                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` |    Có    | Khóa truy cập công khai (Anon Key) từ Supabase |

## Lệnh thực thi

| Lệnh             | Thao tác                                                     |
| :--------------- | :----------------------------------------------------------- |
| `npm run dev`    | Khởi chạy máy chủ phát triển cục bộ                          |
| `npm run build`  | Kiểm tra kiểu và đóng gói mã nguồn cho môi trường production |
| `npm run start`  | Khởi chạy ứng dụng sau khi đã hoàn tất build                 |
| `npm run lint`   | Kiểm tra quy chuẩn mã nguồn với ESLint                       |
| `npm run format` | Định dạng toàn bộ mã nguồn với Prettier                      |

## Cấu trúc thư mục

```text
treemaker/
├── docs/       # Tài liệu dự án và các quyết định kiến trúc (ADR)
├── public/     # Tệp tĩnh và tài nguyên nhận diện thương hiệu
├── src/
│   ├── app/         # Router và các trang giao diện (Next.js App Router)
│   ├── components/  # Component giao diện dùng chung
│   ├── features/    # Các module nghiệp vụ (auth, person, tree)
│   ├── hooks/       # Custom React hooks dùng chung
│   ├── lib/         # Tiện ích, store Zustand và Supabase client
│   └── types/       # Định nghĩa kiểu dữ liệu TypeScript
└── supabase/   # Cấu hình và các bản migration SQL
```

## Giấy phép

Dự án được phân phối theo giấy phép [MIT](LICENSE).
