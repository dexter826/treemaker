# TreeMaker

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/brand/lockup-horizontal-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="public/brand/lockup-horizontal.svg" />
    <img src="public/brand/lockup-horizontal.svg" alt="TreeMaker" width="320" />
  </picture>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" /></a>
  <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" /></a>
</p>

TreeMaker là ứng dụng web xây dựng, trực quan hóa và lưu trữ cây gia phả (FamilyTree). Ứng dụng hỗ trợ dựng sơ đồ phả hệ tương tác trên canvas 2D, quản lý hồ sơ nhân khẩu học cá nhân (Person) và xuất bản kỷ yếu gia phả (LegacyBook) dạng PDF phục vụ in ấn.

## Tính năng chính

- **Dựng FamilyTree trên canvas 2D:** Hiển thị và điều hướng sơ đồ phả hệ trên canvas `@xyflow/react`, tự động tính toán vị trí và bố cục phân nhánh bằng Dagre.
- **Quản lý hồ sơ Person & Relationship:** Lưu trữ thông tin nhân khẩu học (ngày sinh, ngày mất, tiểu sử, ảnh đại diện), thiết lập nhánh trực hệ phụ mẫu và quan hệ hôn phối.
- **Khởi tạo Root Person tự động:** Thiết lập nhân vật khởi tổ (thủy tổ) làm điểm neo phả hệ gốc ngay khi tạo một FamilyTree mới.
- **Xuất bản kỷ yếu gia phả (LegacyBook):** Tổng hợp hồ sơ gia tộc và kết xuất ấn phẩm PDF nhiều trang bằng `jsPDF`.
- **Đồng bộ thời gian thực:** Cập nhật trạng thái và dữ liệu FamilyTree giữa các phiên làm việc qua Supabase Realtime.
- **Kiểm soát truy cập và bảo mật dữ liệu:** Quản lý dữ liệu người dùng trên PostgreSQL bằng cơ chế Row Level Security (RLS) của Supabase.

## Công nghệ sử dụng

- **Frontend & Giao diện:** Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4, Motion, Lucide React.
- **Canvas & Bố cục:** @xyflow/react, Dagre.
- **Backend & Cơ sở dữ liệu:** Supabase (PostgreSQL, Auth, Storage, Realtime).
- **Quản lý trạng thái & Xử lý dữ liệu:** Zustand, Immer, jsPDF, Zod, React Hook Form.

## Cài đặt

### Yêu cầu hệ thống

- Node.js >= 20.0.0
- Trình quản lý gói: `npm` (hoặc `pnpm`, `yarn`)
- Tài khoản và dự án Supabase đang hoạt động

### Khởi chạy cục bộ

```bash
# 1. Tải mã nguồn về máy
git clone https://github.com/dexter826/treemaker.git
cd treemaker

# 2. Cài đặt gói phụ thuộc
npm install

# 3. Tạo tệp cấu hình môi trường từ mẫu
cp .env.example .env

# 4. Khởi chạy máy chủ phát triển
npm run dev
```

Ứng dụng khởi chạy mặc định tại địa chỉ `http://localhost:3000`.

## Cấu hình môi trường

Khai báo biến môi trường trong tệp `.env`:

| Biến                            | Bắt buộc |            Mặc định            | Mô tả                                                    |
| :------------------------------ | :------: | :----------------------------: | :------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      |    Có    |               -                | URL endpoint dự án trên Supabase                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` |    Có    |               -                | Khóa công khai (Anon Key) từ Supabase                    |
| `NEXT_PUBLIC_APP_URL`           |  Không   | `https://treemaker.vercel.app` | URL gốc ứng dụng (dùng cho metadata và liên kết chia sẻ) |

## Lệnh thực thi

Danh sách lệnh quản trị và phát triển trong `package.json`:

| Lệnh                   | Thao tác                                                                |
| :--------------------- | :---------------------------------------------------------------------- |
| `npm run dev`          | Khởi chạy máy chủ phát triển cục bộ                                     |
| `npm run build`        | Kiểm tra kiểu TypeScript và đóng gói mã nguồn cho môi trường production |
| `npm run start`        | Khởi chạy máy chủ production sau khi hoàn tất đóng gói                  |
| `npm run lint`         | Kiểm tra quy chuẩn mã nguồn với ESLint                                  |
| `npm run format`       | Tự động định dạng mã nguồn với Prettier                                 |
| `npm run format:check` | Kiểm tra định dạng mã nguồn (không ghi đè tệp)                          |
| `npm run clean`        | Dọn dẹp bộ nhớ đệm và tệp bản dựng Next.js                              |

## Cấu trúc thư mục

```text
treemaker/
├── docs/          # Tài liệu dự án, quy ước và quyết định kiến trúc (ADR)
├── public/        # Tệp tĩnh, biểu tượng và nhận diện thương hiệu (brand/)
├── src/
│   ├── app/            # Tuyến đường và giao diện ứng dụng (Next.js App Router)
│   ├── components/     # Thành phần giao diện dùng chung (UI components)
│   ├── features/       # Mô-đun nghiệp vụ chính (auth, person, tree)
│   ├── hooks/          # Custom React hooks dùng chung
│   ├── lib/            # Tiện ích, client Supabase và store trạng thái Zustand
│   └── types/          # Định nghĩa kiểu dữ liệu TypeScript
└── supabase/      # Cấu hình dự án và bản di trú dữ liệu SQL (migrations)
```

## Giấy phép

Dự án phát hành theo giấy phép [MIT](LICENSE).
