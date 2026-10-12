import { streamText } from 'ai';
import { openrouter, DEFAULT_AI_MODEL, ChatDataContext } from '@/features/ai';

export const maxDuration = 30;

interface IncomingChatBody {
  messages: Array<{
    role: string;
    content?: string;
    parts?: Array<{ type: string; text?: string }>;
  }>;
  dataContext?: ChatDataContext;
}

// Xử lý chat gia phả qua OpenRouter
export async function POST(req: Request) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Chưa cấu hình API Key OpenRouter (OPENROUTER_API_KEY).' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages, dataContext }: IncomingChatBody = await req.json();
    const tree = dataContext?.tree;
    const persons = dataContext?.persons ?? [];
    const relationships = dataContext?.relationships ?? [];

    const simplifiedPersons = persons.map((p) => ({
      id: p.id,
      name: p.name,
      gen: p.gen,
      fid: p.fid,
      mid: p.mid,
      birth: p.birth,
    }));

    const spouseRels = relationships
      .filter((r) => r.relationship_type === 'spouse')
      .map((r) => [r.person1_id, r.person2_id]);

    const personList = simplifiedPersons
      .map((p) => `- ID: ${p.id}, Tên: ${p.name}, Giới tính: ${p.gen}, Cha: ${p.fid || 'Không rõ'}, Mẹ: ${p.mid || 'Không rõ'}, Sinh: ${p.birth || '?'}`)
      .join('\n');

    const spouseList = spouseRels
      .map((rel) => `- ${rel[0]} kết hôn với ${rel[1]}`)
      .join('\n');

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
      messages: (messages || []).map((m) => ({
        role: m.role === 'data' ? ('system' as const) : (m.role as 'user' | 'assistant' | 'system'),
        content: typeof m.content === 'string'
          ? m.content
          : (m.parts?.filter((p) => p.type === 'text').map((p) => p.text || '').join('') || ' '),
      })),
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.';
    return new Response(JSON.stringify({ error: `Lỗi AI: ${message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
