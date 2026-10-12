# 01: Thiết lập cấu trúc src và di chuyển tầng Shared

**What to build:** Khởi tạo cấu trúc thư mục `src/` và di chuyển toàn bộ các thành phần dùng chung (UI primitives, database client, centralized state store, utilities, types, shared hooks) vào trong `src/`. Cập nhật cấu hình path alias của TypeScript để `@/*` phân giải chính xác vào `./src/*`. Đảm bảo toàn bộ tầng Shared hoàn toàn độc lập và không import ngược từ bất kỳ feature nghiệp vụ nào.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Thư mục `src/` được tạo lập với các thư mục con cho shared UI primitives, shared library, types, và hooks.
- [x] Toàn bộ các UI component nền tảng của design system (shadcn) và infrastructure client được di chuyển an toàn vào tầng Shared trong `src/`.
- [x] Centralized state engine được đặt tập trung trong shared library, sẵn sàng cho các feature kết nối.
- [x] Cấu hình path alias trong TypeScript được cập nhật thành `@/*: ./src/*`.
- [x] Không có bất kỳ import ngược nào từ tầng Shared tới các feature nghiệp vụ.

## Answer

Đã hoàn thành di chuyển tầng Shared vào `src/`:

- `src/components/ui/` (toàn bộ shadcn UI primitives)
- `src/types/index.ts`
- `src/hooks/use-mobile.ts`
- `src/lib/constants/`
- `src/lib/supabase/` & `src/lib/supabase.ts`
- `src/lib/store/` & `src/lib/store.ts`
- `src/lib/utils.ts`
- Cập nhật `tsconfig.json` path alias.
- Xác minh `npx tsc --noEmit` và `npm run build` thành công 100%.
