# LegacyBook xuất PDF bằng ảnh chụp HTML template

Kỷ yếu được dựng từ `legacy-book-template.tsx`: mỗi trang DOM được `domToCanvas` của modern-screenshot render thành canvas, nhúng vào jsPDF dưới JPEG (`pdf.service.ts:56-88`). Chọn cách này để typography của trang kỷ yếu dùng lại đúng CSS của template, thay vì vẽ PDF bằng lệnh tọa độ.

## Consequences

- Chữ trong PDF là ảnh, không chọn được và không tìm kiếm được; bản kỷ yếu không phải nguồn lưu trữ dữ liệu, chỉ là bản in.
- Bắt buộc tồn tại `#legacy-book-export-container` trong DOM lúc xuất, nên kết xuất PDF chỉ chạy ở client.
- Chất lượng tỉ lệ theo `scale` khi render canvas; tăng số Person kéo dài thời gian xuất và bộ nhớ tạm.
