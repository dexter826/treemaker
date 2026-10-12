# 04: Đóng gói Feature Tree thành Deep Module

**What to build:** Gom toàn bộ logic cốt lõi xoay quanh FamilyTree thành feature Tree độc lập. Bao gồm canvas tương tác đồ họa (React Flow), thuật toán tính toán bố cục (Dagre layout), custom nodes và custom edges, thanh công cụ điều khiển (toolbar), thanh bên (sidebar), hộp thoại chia sẻ phân quyền (share settings dialog), và mẫu xuất kỷ yếu sách gia phả (LegacyBook). Feature Tree giao tiếp với Person hoàn toàn thông qua public entry point của feature Person.

**Blocked by:** 03: Đóng gói Feature Person thành Deep Module

**Status:** ready-for-agent

- [ ] Toàn bộ canvas đồ họa, layout engine, node/edge và controls được tổ chức gọn gàng trong feature Tree.
- [ ] Tính năng chia sẻ (Share) và xuất kỷ yếu (LegacyBook) được đóng gói bên trong feature Tree.
- [ ] Feature Tree tiêu thụ các thành phần của Person thông qua public entry point của feature Person, không import sâu vào ruột của Person.
- [ ] Feature Tree cung cấp public entry point duy nhất cho các routing page sử dụng.
