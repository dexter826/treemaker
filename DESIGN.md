---
version: 1
name: TreeMaker — Paper & Ink
description: Nền tảng dựng, trực quan hóa và xuất gia phả. Giao diện đọc như một hồ sơ dòng họ trên nền giấy; một chủ đề sáng duy nhất, một màu nhấn đỏ vang, phân tầng thị giác bằng đường hairline thay vì bóng đổ khối.
colors:
  background: '#f8f5ee'
  surface: '#fbf8f1'
  surface-elevated: '#fefcf6'
  primary: '#8c1f2a'
  primary-hover: '#72111d'
  on-primary: '#fbf8f1'
  primary-soft: '#f7e7e6'
  primary-tint: '#eecfce'
  text-primary: '#060606'
  text-secondary: '#595549'
  text-muted: '#686357'
  text-faint: '#8b8679'
  border: '#8b8679'
  border-default: '#cfcabc'
  border-strong: '#060606'
  focus: '#8c1f2a'
  danger: '#bf4306'
  on-danger: '#fbf8f1'
  overlay: 'rgb(33 31 26 / 0.55)'
  skeleton: 'color-mix(in srgb, {colors.text-primary} 8%, {colors.surface})'
  gender-male: '#005e82'
  gender-female: '#9e427b'
  deceased: '#595549'
  deceased-surface: '#e7e4dd'
  selected: '#eecfce'
  on-selected: '#8c1f2a'
print:
  page: '#ffffff'
  ink: '#0f0d0b'
  accent: '#8c1f2a'
  muted: '#595549'
  rule: 'rgb(15 13 11 / 0.18)'
  gender-male: '#005e82'
  gender-female: '#9e427b'
  serif: 'Cormorant Garamond'
typography:
  display-brand:
    fontFamily: Cormorant Garamond
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: 0
  display-lg:
    fontFamily: Cormorant Garamond
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: 0
  name-person-lg:
    fontFamily: Cormorant Garamond
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0
  title-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0
  title-md:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 0
  name-person:
    fontFamily: Cormorant Garamond
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0
  body:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  caption:
    fontFamily: Be Vietnam Pro
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  meta:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
    fontFeature: tabular-nums
  button:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0
rounded:
  control: 6px
  card: 6px
  dialog: 8px
  node: 6px
  avatar: 4px
  media: 8px
  full: 9999px
spacing:
  micro-1: 2px
  micro-2: 6px
  micro-3: 10px
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  xxxl: 40px
  huge: 48px
  section: 64px
elevation:
  flat: none
  xs: '0 1px 2px rgb(6 6 6 / 0.08)'
  md: '0 8px 24px -6px rgb(6 6 6 / 0.18)'
  inner: 'inset 0 1px 0 rgb(255 255 255 / 0.06)'
motion:
  press: 120ms
  overlay: 200ms
  canvas-layout: 260ms
  easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
  reducedMotion: 'transform tắt, opacity giữ'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    typography: '{typography.button}'
    rounded: '{rounded.control}'
    height: 44px
    padding: 0 20px
    gap: '{spacing.micro-2}'
    border: transparent
  button-secondary:
    backgroundColor: transparent
    textColor: '{colors.text-primary}'
    typography: '{typography.button}'
    rounded: '{rounded.control}'
    height: 44px
    padding: 0 20px
    gap: '{spacing.micro-2}'
    border: '1px solid {colors.border}'
  button-ghost:
    backgroundColor: transparent
    textColor: '{colors.text-primary}'
    typography: '{typography.button}'
    rounded: '{rounded.control}'
    height: 44px
    padding: 0 12px
    gap: '{spacing.micro-2}'
    border: transparent
  button-inset:
    backgroundColor: transparent
    textColor: '{colors.text-secondary}'
    typography: '{typography.button}'
    rounded: '{rounded.control}'
    height: 44px
    padding: 0 12px
    gap: '{spacing.micro-2}'
    border: transparent
    hoverTextColor: '{colors.primary}'
    hoverBackgroundColor: transparent
  button-danger:
    backgroundColor: '{colors.danger}'
    textColor: '{colors.on-danger}'
    typography: '{typography.button}'
    rounded: '{rounded.control}'
    height: 44px
    padding: 0 20px
    gap: '{spacing.micro-2}'
    border: transparent
  button-lg:
    height: 48px
    padding: 0 24px
    typography: '{typography.body-sm}'
  icon-button:
    width: 44px
    height: 44px
    rounded: '{rounded.control}'
  icon-button-lg:
    width: 48px
    height: 48px
    rounded: '{rounded.card}'
  text-field:
    height: 44px
    padding: 0 12px
    typography: '{typography.body}'
    textColor: '{colors.text-primary}'
    placeholderColor: '{colors.text-muted}'
    rounded: '{rounded.control}'
    border: '1px solid {colors.border}'
  field-label:
    typography: '{typography.caption}'
    textColor: '{colors.text-secondary}'
    gap: '{spacing.xxs}'
  field-error:
    typography: '{typography.caption}'
    textColor: '{colors.danger}'
  badge:
    padding: 2px 8px
    gap: '{spacing.micro-1}'
    rounded: '{rounded.full}'
    typography: '{typography.caption}'
  badge-male:
    backgroundColor: '{colors.primary-soft}'
    textColor: '{colors.gender-male}'
    border: '1px solid {colors.gender-male}'
  badge-female:
    backgroundColor: '{colors.primary-soft}'
    textColor: '{colors.gender-female}'
    border: '1px solid {colors.gender-female}'
  badge-deceased:
    backgroundColor: '{colors.deceased-surface}'
    textColor: '{colors.deceased}'
    border: '1px solid {colors.deceased}'
  dialog-overlay:
    backgroundColor: '{colors.overlay}'
  dialog-panel:
    backgroundColor: '{colors.surface-elevated}'
    rounded: '{rounded.dialog}'
    border: '1px solid {colors.border-default}'
    maxWidth: 560px
    elevation: '{elevation.md}'
  dialog-header:
    padding: 20px 24px
    borderBottom: '1px solid {colors.border-default}'
    typography: '{typography.title-lg}'
  dialog-body:
    padding: 24px
    gap: '{spacing.md}'
  dialog-footer:
    padding: 16px 24px
    borderTop: '1px solid {colors.border-default}'
    gap: '{spacing.sm}'
  toast:
    backgroundColor: '{colors.surface-elevated}'
    border: '1px solid {colors.border-default}'
    rounded: '{rounded.card}'
    padding: '{spacing.md}'
    typography: '{typography.body-sm}'
    elevation: '{elevation.md}'
  skeleton:
    backgroundColor: '{colors.skeleton}'
    rounded: '{rounded.control}'
  person-node:
    width: 176px
    height: 64px
    backgroundColor: '{colors.surface}'
    border: '1px solid {colors.border-default}'
    rounded: '{rounded.node}'
    padding: 10px 12px
    gap: '{spacing.sm}'
  person-node-selected:
    border: '2px solid {colors.primary}'
    backgroundColor: '{colors.selected}'
    textColor: '{colors.on-selected}'
  person-node-deceased:
    backgroundColor: '{colors.deceased-surface}'
    border: '1px solid {colors.deceased}'
    textColor: '{colors.deceased}'
  person-avatar:
    width: 40px
    height: 40px
    rounded: '{rounded.avatar}'
  marriage-node:
    width: 20px
    height: 20px
    rounded: '{rounded.full}'
    backgroundColor: '{colors.surface}'
    border: '2px solid {colors.text-primary}'
  tree-edge:
    strokeWidth: 2
    strokeColor: '{colors.text-primary}'
  tree-edge-selected:
    strokeWidth: 3
    strokeColor: '{colors.primary}'
  canvas-background:
    type: grid
    gap: 40px
    color: '{colors.border-default}'
  toolbar:
    height: 48px
    backgroundColor: '{colors.surface-elevated}'
    border: '1px solid {colors.border-default}'
    rounded: '{rounded.card}'
    padding: '{spacing.micro-2}'
    gap: '{spacing.micro-2}'
    elevation: '{elevation.xs}'
  panel-person:
    width: 420px
    backgroundColor: '{colors.surface}'
    borderLeft: '1px solid {colors.border-default}'
    padding: '{spacing.xl}'
  tree-card:
    backgroundColor: '{colors.surface}'
    border: '1px solid {colors.border-default}'
    rounded: '{rounded.card}'
    padding: '{spacing.xl}'
    gap: '{spacing.sm}'
  otp-field:
    width: 48px
    height: 56px
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    border: '1px solid {colors.border}'
  empty-state:
    padding: '{spacing.section}'
    gap: '{spacing.md}'
    typography: '{typography.body-sm}'
---

## 1. Overview

TreeMaker là nền tảng xây dựng, trực quan hóa và lưu trữ gia phả, kèm khả năng chia sẻ cây qua liên
kết và xuất ấn phẩm kỷ yếu (LegacyBook) định dạng PDF. Ngôn ngữ thiết kế là **giấy và mực**: giao
diện mô phỏng một hồ sơ dòng họ được soạn cẩn thận, dựa trên kiểu chữ serif có kiểm soát, đường hairline
mảnh và một màu nhấn duy nhất trên nền giấy ấm.

### Đặc tính cốt lõi

- **Chế độ hiển thị:** Một chủ đề sáng duy nhất. Không tồn tại biến thể tối, không có biến chạy `.dark`,
  không có bộ chuyển chủ đề.
- **Kiểu chữ:** Cormorant Garamond dành cho tên Person và tiêu đề; Be Vietnam Pro dành cho toàn bộ chữ
  giao diện còn lại. Cả hai phông đều nạp subset `vietnamese`.
- **Cấu trúc hình học:** Bo góc kiểm soát ở mức 6–8px, viền hairline 1px làm phương tiện phân cấp chính,
  không dùng bóng đổ offset và không dùng dải màu trang trí.
- **Màu nhấn:** `primary` đỏ vang xuất hiện ở hành động, trạng thái đang chọn và đường focus; mọi bề
  mặt còn lại là trung tính.
- **Nền tảng:** Desktop là mặt bằng soạn thảo; liên kết chia sẻ và trang đăng nhập được tối ưu cho màn
  hình 390px.
- **Ấn phẩm:** LegacyBook dùng bộ biến `print` độc lập, không tham chiếu bảng màu của ứng dụng.

---

## 2. Colors

Hệ thống màu tuân thủ WCAG AA cho văn bản và ngưỡng 3:1 cho các thành phần phi-văn-bản có chức năng.
Mọi thành phần giao diện bắt buộc tham chiếu qua token ngữ nghĩa; không định nghĩa mã màu trực tiếp
trong mã nguồn component.

| Token                 | Giá trị                | Vai trò ngữ nghĩa                                                            |
| :-------------------- | :--------------------- | :--------------------------------------------------------------------------- |
| `background`          | `#f8f5ee`              | Nền canvas của ứng dụng                                                      |
| `surface`             | `#fbf8f1`              | Bề mặt phân cấp cấp 1: thẻ, panel, node                                      |
| `surface-elevated`    | `#fefcf6`              | Bề mặt nổi: dialog, popover, toolbar, toast                                  |
| `primary`             | `#8c1f2a`              | Màu nhấn duy nhất; đạt 8.23:1 trên nền giấy                                  |
| `primary-hover`       | `#72111d`              | Trạng thái press của màu nhấn                                                |
| `on-primary`          | `#fbf8f1`              | Chữ và biểu tượng trên nền `primary` đặc; đạt 8.96:1                         |
| `primary-soft`        | `#f7e7e6`              | Nền hover nhẹ                                                                |
| `primary-tint`        | `#eecfce`              | Nền của phần tử đang được chọn; chữ `primary` trên đó đạt 6.16:1             |
| `text-primary`        | `#060606`              | Mực chính cho tiêu đề, tên Person và nội dung đọc; đạt 18.61:1               |
| `text-secondary`      | `#595549`              | Mực phụ cho mô tả, nhãn và siêu dữ liệu; đạt 6.84:1                          |
| `text-muted`          | `#686357`              | Màu placeholder và gợi ý trong ô nhập; đạt 5.49:1                            |
| `text-faint`          | `#8b8679`              | Ký tự lớn mang tính trang trí; đạt 3.33:1, **không dùng cho chữ nội dung**   |
| `border`              | `#8b8679`              | Viền của các thành phần điều khiển có tương tác; đạt 3.33:1                  |
| `border-default`      | `#cfcabc`              | Hairline phân cách cấu trúc và viền thẻ; 1.50:1, chỉ mang tính trang trí     |
| `border-strong`       | `#060606`              | Viền 2px đánh dấu node đang được chọn trên canvas                            |
| `focus`               | `#8c1f2a`              | Đường viền chỉ thị focus bàn phím                                            |
| `danger`              | `#bf4306`              | Hành động phá hủy và lỗi nhập liệu; đạt 4.80:1, chữ trắng trên đó đạt 5.22:1 |
| `overlay`             | `rgb(33 31 26 / 0.55)` | Lớp phủ sau dialog và sheet                                                  |
| `skeleton`            | computed               | Khung chờ nội dung                                                           |
| `gender-male`         | `#005e82`              | Chỉ dẫn giới nam; đạt 6.60:1                                                 |
| `gender-female`       | `#9e427b`              | Chỉ dẫn giới nữ; đạt 5.48:1, cách hue thương hiệu 35.8°                      |
| `deceased`            | `#595549`              | Trạng thái đã mất                                                            |
| `deceased-surface`    | `#e7e4dd`              | Nền của node ở trạng thái đã mất                                             |
| `print.page`          | `#ffffff`              | Nền trang in của LegacyBook                                                  |
| `print.ink`           | `#0f0d0b`              | Mực in                                                                       |
| `print.accent`        | `#8c1f2a`              | Màu nhấn trong ấn bản                                                        |
| `print.gender-male`   | `#005e82`              | Chỉ dẫn giới nam trong ấn bản; đạt 7.18:1 trên nền in                        |
| `print.gender-female` | `#9e427b`              | Chỉ dẫn giới nữ trong ấn bản; đạt 5.97:1 trên nền in                         |

### Nguyên tắc sử dụng màu

1. **Một màu nhấn.** `primary` là điểm nhấn duy nhất; không bổ sung màu nhấn thứ hai.
2. **Không dùng alpha cho chữ.** Độ tương phản của chữ do token quyết định; cấm giảm alpha trên văn bản
   đặt trực tiếp trên nền. Alpha chỉ dành cho viền, lớp phủ và nền.
3. **Màu không đơn phương chở nghĩa.** Giới tính và trạng thái đã mất luôn kèm ký hiệu hoặc xử lý ảnh;
   màu là lớp thông tin thứ hai.
4. **`danger` tách khỏi `primary` bằng hue.** Hai màu cách nhau 19.2°; hành động phá hủy không bao giờ
   dùng biến thể `primary`.
5. **Viền chức năng khác viền trang trí.** Ô nhập và control dùng `border` (3.33:1); thẻ và phân cách
   dùng `border-default`.
6. **Ấn phẩm không đọc token ứng dụng.** Bộ biến `print` được khai báo trong stylesheet của chính
   template LegacyBook; thay đổi bảng màu giao diện không ảnh hưởng tới PDF.

---

## 3. Typography

Hai phông chữ đảm nhiệm hai vai trò tách bạch: **Cormorant Garamond** (serif) tạo giọng của một hồ sơ
dòng họ và chỉ dùng cho tên Person cùng tiêu đề; **Be Vietnam Pro** (sans) bảo đảm khả năng đọc tiếng
Việt cho toàn bộ giao diện còn lại.

| Cấp bậc          | Phông chữ          | Cỡ chữ | Trọng số | Độ cao dòng | Khoảng chữ |
| :--------------- | :----------------- | :----- | :------- | :---------- | :--------- |
| `display-brand`  | Cormorant Garamond | 40px   | 600      | 1.1         | 0          |
| `display-lg`     | Cormorant Garamond | 32px   | 600      | 1.15        | 0          |
| `name-person-lg` | Cormorant Garamond | 24px   | 600      | 1.2         | 0          |
| `title-lg`       | Be Vietnam Pro     | 20px   | 600      | 1.3         | 0          |
| `title-md`       | Be Vietnam Pro     | 18px   | 600      | 1.35        | 0          |
| `name-person`    | Cormorant Garamond | 14px   | 600      | 1.3         | 0          |
| `body`           | Be Vietnam Pro     | 16px   | 500      | 1.5         | 0          |
| `body-sm`        | Be Vietnam Pro     | 14px   | 500      | 1.5         | 0          |
| `caption`        | Be Vietnam Pro     | 13px   | 400      | 1.45        | 0          |
| `meta`           | Be Vietnam Pro     | 12px   | 400      | 1.4         | 0          |
| `button`         | Be Vietnam Pro     | 14px   | 600      | 1.2         | 0          |

### Nguyên tắc định dạng chữ

1. **Cỡ chữ tối thiểu 12px.** Kích thước chỉ tham chiếu từ bảng phân cấp; không dùng cỡ chữ tuỳ ý viết
   tay trong class.
2. **Trọng số phải được nạp thật.** Danh sách weight hợp lệ: Cormorant Garamond 400/500/600/700, Be
   Vietnam Pro 400/500/600. Giá trị ngoài danh sách này làm trình duyệt tổng hợp nét giả.
3. **Serif không viết hoa toàn bộ.** Tên Person dùng serif ở mọi cấp từ 14px trở lên; không áp dụng
   `uppercase` hay khoảng chữ rộng cho serif.
4. **Nhãn là sentence case.** Nhãn trường và nhãn điều hướng dùng `caption` với `text-secondary`; hệ
   thống không có cấp chữ in hoa vi mô.
5. **Số thẳng cột.** Ngày tháng, năm sinh – năm mất và mọi chỉ số dùng `tabular-nums`.

---

## 4. Layout

Bố cục theo tỷ lệ 4px, ưu tiên khoảng thở; phân chia vùng bằng hairline thay vì bằng nền khác màu.

### Thang khoảng cách

Token giữ vai trò từ vựng. Triển khai dùng thang số gốc 4px của Tailwind (`--spacing: 0.25rem`),
không khai báo token khoảng cách có tên trong `@theme`.

| Token     | Giá trị | Class Tailwind | Phạm vi dùng                              |
| :-------- | :------ | :------------- | :---------------------------------------- |
| `micro-1` | 2px     | `0.5`          | Giữa biểu tượng và chữ trong badge, chip  |
| `micro-2` | 6px     | `1.5`          | Khe giữa các nút trong toolbar            |
| `micro-3` | 10px    | `2.5`          | Nhãn trường và ô nhập trong mật ngữ OTP   |
| `xxs`     | 4px     | `1`            | Nhãn với control, chữ phụ sát tiêu đề     |
| `xs`      | 8px     | `2`            | Khoảng cách mặc định trong hàng, cụm nút  |
| `sm`      | 12px    | `3`            | Lưới nút "Thêm người thân", footer dialog |
| `md`      | 16px    | `4`            | Đệm trong thẻ, block form                 |
| `lg`      | 20px    | `5`            | Đệm header dialog, cụm tiêu đề trang      |
| `xl`      | 24px    | `6`            | Đệm card, panel, dialog body              |
| `xxl`     | 32px    | `8`            | Tách header khỏi danh sách                |
| `xxxl`    | 40px    | `10`           | Khoảng lớn giữa hai vùng nội dung         |
| `huge`    | 48px    | `12`           | Chiều cao nút cỡ lớn                      |
| `section` | 64px    | `16`           | Đệm đứng của trang và trạng thái rỗng     |

Quy tắc namespace: tên `xs`, `sm`, `md`, `lg`, `xl`, `2xl` thuộc về thang container
(`--container-*`, dùng cho `max-w-*`) và thang breakpoint (`sm:`, `md:`). Đặt chúng vào `--spacing-*`
sẽ làm `max-w-md` biên dịch thành `var(--spacing-md)` thay vì `var(--container-md)`, tức mọi khung
chịu rộng trên ứng dụng bị bóp xuống đúng số đo khoảng cách.

### Lưới hiển thị và điểm ngắt

| Breakpoint | Chiều rộng | Bố cục và hành vi                                                                                                         |
| :--------- | :--------- | :------------------------------------------------------------------------------------------------------------------------ |
| **Mobile** | < 768px    | Lề trang 16px. Đăng nhập và liên kết chia sẻ dùng được hoàn toàn. Canvas ở chế độ chỉ đọc, kèm dòng dẫn mở trên máy tính. |
| **md**     | ≥ 768px    | Lề trang 24px. Panel Person mở dưới dạng sheet chiều rộng 92vw, tối đa 420px.                                             |
| **lg**     | ≥ 1024px   | Khung nội dung giới hạn 1120px. Panel Person là thành phần kề canvas; canvas co lại khi panel mở.                         |
| **xl**     | ≥ 1280px   | Lưới thẻ dự án ba cột; toolbar canvas nổi giữ nguyên chiều cao 48px.                                                      |

### Vùng tương tác

- Nút bấm, ô nhập và nút icon trong giao diện chrome có vùng bấm tối thiểu **44×44px**, khoảng cách
  giữa hai mục liền kề tối thiểu 8px.
- Node trên canvas là ngoại lệ duy nhất: kích thước do hệ quy chiếu zoom-pan quyết định, không do điểm
  ngắt.

### Canvas

| Hằng số               | Giá trị   | Ghi chú                                                      |
| :-------------------- | :-------- | :----------------------------------------------------------- |
| Node Person           | 176×64    | Avatar 40px, tên, năm sinh – năm mất                         |
| Node hôn phối         | 20px      | Hữu hình, không transparent                                  |
| `nodesep` / `edgesep` | 40 / 24   | Ngăn cách node cùng thế hệ                                   |
| `ranksep`             | 120       | Ngăn cách giữa hai thế hệ                                    |
| `minZoom` / `maxZoom` | 0.2 / 1.6 | Khai báo một lần trong `constants.ts`, mọi nơi khác đọc theo |

---

## 5. Elevation & Depth

Phân tầng bằng tương phản bề mặt và hairline. Bóng đổ chỉ dành cho phần tử thực sự nổi khỏi mặt trang.

### Cấu trúc phân lớp

1. **Lớp nền (Base Plane):** `background` là bề mặt sâu nhất.
2. **Lớp thành phần (Component Plane):** `surface` cho thẻ, panel và node; `deceased-surface` cho node
   ở trạng thái đã mất.
3. **Lớp nổi (Floating Plane):** `surface-elevated` cho dialog, popover, sheet, toolbar và toast, kèm
   `elevation.md` hoặc `elevation.xs`.
4. **Đường phân cách (Hairline Separation):** `border-default` cho phân cách cấu trúc; `border` cho
   viền control; `border-strong` 2px chỉ xuất hiện trên phần tử đang được chọn trong canvas.
5. **Lớp phủ (Overlay Plane):** `overlay` sau dialog và sheet, `z-index` tăng dần theo thứ tự trên.

| Token             | Giá trị                                 | Dùng cho                            |
| :---------------- | :-------------------------------------- | :---------------------------------- |
| `elevation.flat`  | none                                    | Node, thẻ, hàng danh sách           |
| `elevation.xs`    | `0 1px 2px rgb(6 6 6 / 0.08)`           | Toolbar nổi, thẻ ở trạng thái hover |
| `elevation.md`    | `0 8px 24px -6px rgb(6 6 6 / 0.18)`     | Dialog, popover, sheet, toast       |
| `elevation.inner` | `inset 0 1px 0 rgb(255 255 255 / 0.06)` | Đỉnh ô nhập, nếu cần phân tách nhẹ  |

Nền canvas dùng lưới hairline `gap` 40px ở `border-default`; không dùng chấm tròn, không dùng vân giấy.

---

## 6. Shapes

| Token             | Giá trị | Phạm vi áp dụng                                        |
| :---------------- | :------ | :----------------------------------------------------- |
| `rounded.control` | 6px     | Nút bấm, ô nhập, OTP, dropdown, thanh trượt trạng thái |
| `rounded.card`    | 6px     | Thẻ dự án, panel, toast, toolbar                       |
| `rounded.dialog`  | 8px     | Hộp thoại và sheet                                     |
| `rounded.node`    | 6px     | Node Person trên canvas                                |
| `rounded.avatar`  | 4px     | Ảnh đại diện trong node                                |
| `rounded.media`   | 8px     | Ảnh lớn trong modal Person                             |
| `rounded.full`    | 9999px  | Badge, node hôn phối, avatar tròn, thanh trượt         |

### Quy tắc định hình

- Không dùng giá trị bo góc ngoài bảng trên; không trộn góc vuông và góc bo trong cùng một khối.
- Viền mặc định 1px. Viền 2px chỉ cho trạng thái đang chọn.
- Ảnh chân dung trong node giữ tỉ lệ khung chữ nhật đứng, phủ xám nhẹ ở trạng thái đã mất.
- Handle kết nối: bốn cạnh của node, một định nghĩa hình ảnh dùng chung cho mọi cạnh.

---

## 7. Components

Mỗi thành phần là một hợp đồng giao diện. Nội dung chữ hiển thị trong các thành phần bắt buộc tuân theo
`COPY.md`.

### Button & IconButton

- **Biến thể:** `button-primary` cho hành động chính của màn hình; `button-secondary` cho hành động phụ;
  `button-ghost` cho thao tác trong toolbar và hàng danh sách; `button-inset` cho ký hiệu nằm _trong_
  bề mặt của control khác (nút hiện mật khẩu trong ô nhập, nút đóng ở header dialog/sheet/panel) —
  không tô nền, chỉ đổi màu ký hiệu; `button-danger` cho hành động phá hủy.
- **Tương tác:** trạng thái xử lý hiển thị spinner 16px tại chỗ, giữ nguyên kích thước, kèm
  `aria-busy="true"`; hover đổi nền theo `primary-soft` hoặc `primary-hover`; press dịch 1px.
- **Tiếp cận:** IconButton không có chữ hiển thị bắt buộc có `aria-label`. Thẻ `<button>` cho thao tác
  tại chỗ, `<a>`/`<Link>` cho điều hướng.

### Field, Form và Báo lỗi

- `field-label` đặt trên control, cách `xxs`; `text-field` cao 44px, viền `border`.
- Lỗi hiển thị **tại trường** bằng `field-error`, liên kết qua `aria-invalid` và `aria-describedby`;
  tổng hợp lỗi khi nộp form hiển thị một khối `alert` ở đầu biểu mẫu.
- Toast chỉ mang thông báo hệ thống bất ngờ và trạng thái thành công, theo công thức ba phần của
  `COPY.md` §3.2.

### OTP và liên kết chia sẻ

- `otp-field` gồm bốn ô 48×56px, tự động nộp khi đủ bốn ký tự.
- Mật khẩu sai: lỗi inline dưới cụm ô, toàn bộ ký tự được chọn lại để gõ tiếp; không chỉ báo bằng toast.
- Ở màn hình hẹp, liên kết chia sẻ hiển thị ở chế độ chỉ đọc kèm dòng dẫn soạn thảo trên máy tính.

### Badge

- `badge-male`, `badge-female`, `badge-deceased` luôn kèm ký hiệu hoặc chữ, không chỉ dựa vào màu.
- Badge là thành phần hiển thị trạng thái, không đóng vai trò nút bấm.

### Dialog, Sheet và Alert

- `dialog-overlay` dùng `overlay`; `dialog-panel` có `maxWidth` 560px, tiêu điểm bị khóa bên trong, đóng
  bằng Escape và hoàn trả tiêu điểm về phần tử kích hoạt.
- Hộp thoại xác nhận phá hủy đặt tiêu điểm mặc định vào hành động an toàn; nút xác nhận dùng
  `button-danger` với nhãn là động từ cụ thể.

### Node và cạnh trên canvas

- `person-node`: avatar 40px góc `avatar`, tên theo `name-person`, năm sinh – năm mất theo `meta`.
- Trạng thái chọn dùng `person-node-selected`: viền 2px `primary`, nền `selected`, đồng thời là nguồn
  màu cho `tree-edge-selected`.
- Trạng thái đã mất dùng `person-node-deceased` kèm ảnh phủ xám.
- `marriage-node` là nút tròn 20px hữu hình, nối bằng `tree-edge` vuông góc.
- Thanh điều khiển zoom nằm trong `toolbar`; không tồn tại bộ điều khiển thứ hai do thư viện canvas cung
  cấp.

### Panel Person

- `panel-person` rộng 420px, là thành phần kề canvas: khi mở, canvas co lại và không bị che mất node
  đang chọn.
- Trên màn hình hẹp, panel chuyển thành sheet từ phải, chỉ đọc.

### Skeleton, trạng thái rỗng và lỗi

- Skeleton mô phỏng đúng lưới, tỉ lệ và số lượng phần tử của nội dung thật; không dùng spinner che toàn
  màn hình.
- Trạng thái chờ chỉ hiển thị sau 150ms và giữ tối thiểu 300ms khi đã xuất hiện.
- Trạng thái rỗng theo ba bước của `COPY.md` §3.3: tiêu đề hiện trạng, mô tả giá trị, một nút dẫn lối.
- Màn hình lỗi và 404 dùng một câu mô tả hiện trạng kèm một hành động thoát ra.

### Chuyển động

| Token                  | Giá trị | Dùng cho                             |
| :--------------------- | :------ | :----------------------------------- |
| `motion.press`         | 120ms   | hover, press, dropdown               |
| `motion.overlay`       | 200ms   | dialog, popover, sheet               |
| `motion.canvas-layout` | 260ms   | xếp lại cây, zoom tới node đang chọn |

- Thời lượng lấy từ một nguồn duy nhất trong `constants.ts`; không khai báo số lẻ ở component.
- `prefers-reduced-motion` tắt transform, giữ opacity.

---

## 8. Do's and Don'ts

| Do                                                                 | Don't                                                                                                                                          |
| :----------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| Phân tầng bằng hairline, nền `surface` và khoảng trắng.            | Không dùng bóng đổ offset hoặc viền 2px cho phần tử không được chọn.                                                                           |
| Duy trì `primary` là màu nhấn duy nhất.                            | Không bổ sung màu nhấn thứ hai, kể cả màu thương hiệu phụ.                                                                                     |
| Dùng `on-primary` cho chữ trên nền màu nhấn đặc.                   | Không dùng chữ trắng trực tiếp trên `primary-tint`.                                                                                            |
| Ký hiệu lồng trong control khác dùng `button-inset` (chỉ đổi màu). | Không tô nền cho affordance nằm đè lên bề mặt của control hoặc header khác.                                                                    |
| Lấy màu chữ từ token; `text-secondary` cho chữ phụ.                | Không giảm độ tương phản chữ bằng alpha trên nền ứng dụng.                                                                                     |
| Dùng `border` (3.33:1) cho ô nhập và control.                      | Không dùng `border-default` (1.50:1) làm viền của thành phần có tương tác.                                                                     |
| Focus ring 2px `focus`, offset 2px, trên mọi phần tử bấm được.     | Không tắt outline focus trừ khi có cơ chế thay thế tương đương.                                                                                |
| Nhãn sentence case ở `caption`; tên Person bằng serif.             | Không dùng chữ in hoa toàn bộ kèm khoảng chữ rộng làm nhãn.                                                                                    |
| Chỉ dùng weight đã nạp: 400/500/600/700.                           | Không dùng weight 900 trên serif chưa nạp.                                                                                                     |
| Kèm ký hiệu hoặc chữ cho giới tính và trạng thái đã mất.           | Không để màu một mình chở thông tin nghiệp vụ.                                                                                                 |
| Nút và ô nhập chrome cao 44px, cách nhau ít nhất 8px.              | Không dùng chiều cao lẻ hoặc mục bấm dưới 44px ngoài node canvas.                                                                              |
| Báo lỗi tại trường, kèm lối thoát theo `COPY.md`.                  | Không đẩy toàn bộ lỗi lên toast.                                                                                                               |
| Skeleton đúng hình nội dung khi tải.                               | Không dùng ảnh động hoặc spinner che toàn màn hình.                                                                                            |
| Di sản in dùng bộ biến `print`.                                    | Không để template LegacyBook đọc token màu của ứng dụng.                                                                                       |
| Tham chiếu mọi giá trị màu, khoảng cách, cỡ chữ qua design token.  | Không viết mã màu hoặc số đo tuỳ tiện trong mã nguồn component.                                                                                |
| Một chủ đề sáng duy nhất.                                          | Không thêm biến thể tối, không thêm bộ chuyển chủ đề.                                                                                          |
| Khoảng cách triển khai bằng thang số gốc 4px (`p-4`, `gap-3`).     | Không khai báo `--spacing-xs`…`--spacing-section` trong `@theme`; các tên đó thuộc `--container-*` và `max-w-*` sẽ bóp theo số đo khoảng cách. |
