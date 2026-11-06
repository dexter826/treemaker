# React Flow kết hợp Dagre cho canvas FamilyTree

Sơ đồ phả hệ dựng bằng `@xyflow/react` làm nền tương tác và `dagre` tính vị trí, thay vì tự viết layout theo thế hệ. `src/features/tree/utils/layout.ts` chuyển Person và Relationship thành nodes/edges, trong đó mỗi Relationship hôn phối sinh thêm một marriage node tổng hợp mang id `m:<pairKey>`.

## Considered Options

- Layout tự viết theo hàng thế hệ: cho kết quả gọn hơn với cây cân đối, nhưng phải tự xử lý kéo thả, zoom và cập nhật realtime — React Flow đã có sẵn.
- Dùng thẳng DAG layout trên Person: không nối được hai vợ chồng vào một nhánh con, nên mới cần marriage node.

## Consequences

- Vị trí node do Dagre sinh ra theo thuật toán DAG, không phản ánh thứ bậc phả hệ; `sibling_order` là thứ duy nhất được tôn trọng khi sắp anh chị em.
- Chi phí layout tăng theo số node, và mọi thay đổi cấu trúc Person/Relationship đều phải đi qua `generateNodesAndEdges`.
- `TreeEdgeMeta` trong `edge.data` là nguồn sự thật cho biết một edge biểu diễn liên kết nào; id dạng `e:m1:`/`e:marriage:child:` chỉ là khóa để dagre so khớp, không được dùng để suy ra loại liên kết.
- Người con nối với cặp vợ chồng qua đúng một edge, nên ngắt edge đó cắt cả `father_id` lẫn `mother_id`; canvas không có cách ngắt riêng từng phía khi cha mẹ còn là một cặp.
