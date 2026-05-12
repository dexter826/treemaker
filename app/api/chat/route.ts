import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';

export const maxDuration = 30;

// Xử lý chat gia phả qua Gemini 2.0
export async function POST(req: Request) {
  try {
    const { messages, dataContext } = await req.json();
    const { tree, persons, relationships } = dataContext;

    const simplifiedPersons = (persons || []).map((p: any) => ({
      i: p.id,
      n: p.full_name,
      g: p.gender === 'male' ? 'M' : 'F',
      f: p.father_id,
      m: p.mother_id,
      b: p.birth_date
    }));

    const simplifiedRels = (relationships || [])
      .filter((r: any) => r.relationship_type === 'spouse')
      .map((r: any) => [r.person1_id, r.person2_id]);

    const result = streamText({
      model: google('gemini-3.1-flash-lite-preview'),
      system: `Bạn là chuyên gia gia phả học Việt Nam cho ứng dụng TreeMaker.
      Dữ liệu cây "${tree?.name || 'Gia đình'}":
      - Members: ${JSON.stringify(simplifiedPersons)} (i:id, n:name, g:gender, f:father, m:mother, b:birth_year)
      - Spouses: ${JSON.stringify(simplifiedRels)}
      
      Nhiệm vụ:
      1. Phân tích quan hệ dựa trên ID cha/mẹ và danh sách vợ chồng. 
      2. Luôn ưu tiên cách xưng hô và thuật ngữ họ hàng Việt Nam (Nội, Ngoại, Chú, Bác, Cô, Dì, Anh em họ...).
      3. Nếu được hỏi về quan hệ giữa 2 người, hãy chỉ ra lộ trình kết nối (VD: A là con của B, B là anh của C => A gọi C là Bác/Chú).
      4. Câu trả lời súc tích, trình bày đẹp bằng Markdown (sử dụng bảng nếu liệt kê danh sách).
      5. Nếu thông tin không có trong dữ liệu, hãy đề xuất người dùng cập nhật thêm.`,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
