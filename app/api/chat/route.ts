import { streamText, convertToModelMessages } from 'ai';
import { openrouter, DEFAULT_AI_MODEL } from '@/lib/ai/config';

export const maxDuration = 30;

// Xử lý chat gia phả qua OpenRouter
export async function POST(req: Request) {
  try {
    const { messages, dataContext } = await req.json();
    const { tree, persons, relationships } = dataContext;

    // Giảm payload cho LLM
    const simplifiedPersons = (persons || []).map((p: any) => ({
      id: p.id,
      name: p.name || p.full_name,
      gen: p.gen || (p.gender === 'male' ? 'M' : 'F'),
      fid: p.fid || p.father_id,
      mid: p.mid || p.mother_id,
      birth: p.birth || p.birth_date
    }));

    const spouseRels = (relationships || [])
      .filter((r: any) => r.relationship_type === 'spouse')
      .map((r: any) => [r.person1_id, r.person2_id]);

    console.log(`[Chat API] Tree: ${tree?.name}, Persons: ${simplifiedPersons.length}, Relationships: ${spouseRels.length}`);

    // Cấu trúc lại context cho LLM
    const personList = simplifiedPersons.map((p: any) => 
      `- ID: ${p.id}, Tên: ${p.name}, Giới tính: ${p.gen}, Cha: ${p.fid || 'Không rõ'}, Mẹ: ${p.mid || 'Không rõ'}, Sinh: ${p.birth || '?'}`
    ).join('\n');

    const spouseList = spouseRels.map((rel: any) => 
      `- ${rel[0]} kết hôn với ${rel[1]}`
    ).join('\n');

    const result = streamText({
      model: openrouter.chat(DEFAULT_AI_MODEL),
      system: `BẠN LÀ TRỢ LÝ GIA PHẢ CHUYÊN NGHIỆP. BẠN CÓ TOÀN QUYỀN TRUY CẬP DỮ LIỆU SAU ĐÂY:

DỮ LIỆU CÂY: "${tree?.name || 'Gia đình'}"
DANH SÁCH THÀNH VIÊN:
${personList || 'Trống'}

QUAN HỆ VỢ CHỒNG:
${spouseList || 'Trống'}

QUY TẮC BẮT BUỘC:
1. Bạn CÓ tên thành viên trong danh sách trên. TUYỆT ĐỐI không được trả lời là "chỉ có ID" hay "không có tên".
2. Khi người dùng hỏi về một người theo tên (VD: "Công Minh"), hãy tìm ID tương ứng trong danh sách rồi mới phân tích quan hệ.
3. Xưng hô chuẩn Việt Nam (Ông, Bà, Chú, Bác, Cô, Dì...).
4. Trả lời súc tích bằng Markdown. Nếu không tìm thấy tên, hãy liệt kê một vài cái tên bạn thấy trong danh sách để xác nhận.`,
      messages: (messages as any[]).map(m => ({
        role: m.role === 'data' ? 'system' : m.role,
        content: typeof m.content === 'string' ? m.content : 
          (m.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') || ' ')
      })),
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Lỗi AI: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
