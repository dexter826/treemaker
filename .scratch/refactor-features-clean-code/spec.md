# Spec: Refactor Codebase Theo Từng Feature (Chuẩn A -> Chuẩn C)

Status: ready-for-agent

## Problem Statement

Codebase TreeMaker đã được tổ chức lại theo mô hình Feature-Based (`src/features`), tuy nhiên chất lượng code nội bộ giữa các module chưa đồng đều và còn tồn tại nợ kỹ thuật:

- Module `auth`: Bị coupling trực tiếp Supabase SDK vào UI component, rò rỉ logic kiểm tra tính hợp lệ ra ngoài schema Zod, tồn tại input chết (`rememberMe`), và lạm dụng non-null assertion.
- Module `person`: Quản lý hồ sơ nhân khẩu và ảnh đại diện, cần rà soát lại việc tách biệt giữa `person.service.ts` và các form component, xử lý lỗi bất đồng bộ và chuẩn hoá danh pháp miền theo `GLOSSARY.md`.
- Module `tree`: Là module lõi lớn nhất (19 files bao gồm canvas đồ thị, thuật toán layout, HUD, modal, và xuất PDF LegacyBook). Cần rà soát coupling giữa canvas hooks, service, và store slice để đảm bảo tính độc lập và khả năng bảo trì.
- Module `ai`: Chatbot ngữ cảnh cần đảm bảo chỉ giao tiếp với dữ liệu gia phả thông qua public interface của các feature.

## Solution

Thực hiện quy trình tái cấu trúc code có kiểm soát theo chu trình Chuẩn A (Review Report theo 7 trục clean code) ➔ Chuẩn C (Refactor Code hoàn chỉnh) cho từng feature độc lập theo thứ tự mức độ phụ thuộc:

1. Feature `auth`
2. Feature `person`
3. Feature `tree`
4. Feature `ai`

Mỗi feature được refactor theo mô hình Deep Module (ADR 0001), cô lập hạ tầng vào `services/`, chuẩn hoá Zod schema, bảo toàn 100% runtime behavior và Neo-brutalist design tokens (ADR 0002), đồng thời tuân thủ bộ từ vựng canonical trong `GLOSSARY.md`.

## User Stories

1. As a developer, I want module `auth` to isolate Supabase SDK interactions into a dedicated `auth.service.ts`, so that UI components only focus on presentation and form state.
2. As a user, I want clear, inline Vietnamese validation messages when inputting credentials, so that I immediately understand formatting errors without relying on generic toasts.
3. As a developer, I want strict Zod validation schemas for login, signup, and password recovery, so that runtime type assertions (`!`) are eliminated and confirmation passwords are strictly verified.
4. As a developer, I want module `person` to strictly conform to `GLOSSARY.md` (using `Person` instead of `Member`/`Individual`), so that codebase terminology remains canonical.
5. As a developer, I want `person.service.ts` and `person-form.tsx` to handle image cropping and demographics cleanly with robust error context and no swallowed exceptions.
6. As a developer, I want module `tree` (canvas, nodes, edges) to encapsulate graph state cleanly with minimal coupling to global slices, using `FamilyTree` and `Relationship` as canonical domain terms.
7. As a developer, I want `legacy-book-template.tsx` and `pdf.service.ts` to adhere to the `LegacyBook` domain concept, keeping printing logic decoupled from canvas HUD controls.
8. As a developer, I want module `ai` (`tree-chatbot.tsx`) to consume tree/person data through well-defined feature APIs rather than deep internal imports.
9. As a developer, I want every feature refactor to pass `npm run lint` and `npm run build` without regression, so that production stability is guaranteed.

## Implementation Decisions

- **Lộ trình từng bước**: Triển khai tuần tự theo 4 vertical slices: `auth` ➔ `person` ➔ `tree` ➔ `ai`.
- **Kiến trúc Deep Module (ADR 0001)**: Mỗi feature nằm trọn trong `src/features/<feature>/` với public entry point duy nhất qua `index.ts`. Không cho phép import sâu vào file nội bộ của feature khác.
- **Tách biệt UI và Service Layer**: Mọi lời gọi SDK Supabase hoặc API bên ngoài phải được đóng gói trong `services/*.service.ts`.
- **Bảo toàn UI và Runtime Behavior**: Giữ nguyên toàn bộ giao diện Neo-brutalist (ADR 0002), không làm vỡ các route hiện có trong `src/app/` và không đổi DB schema Supabase.
- **Chuẩn hoá Thuật ngữ Miền (GLOSSARY.md)**: Áp dụng nhất quán `FamilyTree`, `Person`, `Relationship`, `LegacyBook` trong code và comments.

## Testing Decisions

- **Testing Seams**:
  1. _Primary Seam (Feature Public API & Service Layer)_: Kiểm chứng tính đúng đắn của public contracts tại `src/features/*/index.ts` và các phương thức nghiệp vụ trong `services/*`.
  2. _Verification Gate_: Chạy `npm run lint` và `npm run build` sau mỗi lần hoàn tất một feature để đảm bảo zero type errors và zero lint warnings.
- **Tiêu chí kiểm thử**: Tập trung vào hành vi đối ngoại và tính toàn vẹn kiểu dữ liệu tĩnh; không can thiệp vào các private helper nếu không ảnh hưởng tới public contract.

## Out of Scope

- Không thay đổi cấu trúc database hoặc schema của Supabase trên production.
- Không thay đổi thiết kế các UI primitives trong `src/components/ui/`.
- Không bổ sung tính năng người dùng mới nằm ngoài phạm vi refactor code hiện có.

## Further Notes

- Sau khi spec này được người dùng duyệt, hệ thống sẽ tự động dùng `/to-tickets` để chia thành các ticket độc lập dưới `.scratch/refactor-features-clean-code/issues/` và tiến hành thực thi.
