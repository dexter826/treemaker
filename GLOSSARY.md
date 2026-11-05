# TreeMaker

Nền tảng xây dựng, trực quan hóa và lưu trữ gia phả dòng họ.

## Language

**FamilyTree**:
Một cây gia phả hoàn chỉnh, bao gồm toàn bộ các thành viên và mối quan hệ trực thuộc một chủ sở hữu.
_Avoid_: Tree, chart, diagram, graph

**Person**:
Một cá nhân cụ thể trong cây gia phả với thông tin nhân khẩu học (ngày sinh, ngày mất, tiểu sử, ảnh đại diện) và quan hệ phụ mẫu trực hệ.
_Avoid_: Member, user, node, individual

**Root Person**:
Thành viên khởi tạo (thủy tổ) đầu tiên được tạo tự động khi khởi tạo một FamilyTree, đóng vai trò là điểm neo phả hệ gốc.
_Avoid_: First member, base node, creator

**Relationship**:
Mối liên kết hôn phối giữa hai Person trong cùng một cây gia phả (với kiểu mặc định là bạn đời/vợ chồng).
_Avoid_: Edge, link, marriage, spouse (khi dùng làm tên thực thể tổng quát)

**LegacyBook**:
Ấn phẩm kỷ yếu gia phả trang trọng được tổng hợp và xuất bản dưới định dạng PDF từ dữ liệu của một FamilyTree.
_Avoid_: Export, report, pdf, document

