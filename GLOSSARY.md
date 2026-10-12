# TreeMaker

Nền tảng xây dựng gia phả hiện đại, tương tác và thông minh.

## Language

**FamilyTree**:
Một cây gia phả hoàn chỉnh, bao gồm toàn bộ các thành viên và mối quan hệ trực thuộc một chủ sở hữu.
_Avoid_: Tree, chart, diagram

**Person**:
Một cá nhân/thành viên cụ thể trong cây gia phả với thông tin nhân khẩu học (ngày sinh, ngày mất, tiểu sử, ảnh đại diện).
_Avoid_: Member, user, node, individual

**Relationship**:
Mối liên kết giữa hai Person trong gia phả (hiện tại đại diện cho quan hệ hôn phối/vợ chồng).
_Avoid_: Edge, link, marriage (khi chỉ mối quan hệ tổng quát)

**LegacyBook**:
Bản in kỷ yếu/sách gia phả xuất ra dạng tài liệu PDF từ dữ liệu cây gia phả.
_Avoid_: Export, report, pdf
