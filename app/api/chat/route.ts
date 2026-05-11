import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';

export const maxDuration = 30;

// Xử lý chat gia phả qua Gemini
export async function POST(req: Request) {
  try {
    const { messages, dataContext } = await req.json();
    const { tree, persons, relationships } = dataContext;

    // Tinh gọn dữ liệu để tiết kiệm token
    const simplifiedPersons = (persons || []).map((p: any) => ({
      id: p.id,
      name: p.full_name,
      gender: p.gender,
      birth: p.birth_date,
      father: p.father_id,
      mother: p.mother_id
    }));

    const simplifiedRels = (relationships || [])
      .filter((r: any) => r.relationship_type === 'spouse')
      .map((r: any) => ({ p1: r.person1_id, p2: r.person2_id }));

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: `Bạn là trợ lý ảo chuyên về gia phả trong ứng dụng TreeMaker.
      Tên cây: ${tree?.name || 'Chưa rõ'}.
      Dữ liệu:
      - Thành viên: ${JSON.stringify(simplifiedPersons)}
      - Vợ chồng: ${JSON.stringify(simplifiedRels)}
      
      Nhiệm vụ:
      1. Phân tích quan hệ từ father_id, mother_id và danh sách vợ chồng.
      2. Trả lời ngắn gọn, tiếng Việt súc tích (dưới 3 câu).
      3. Nếu không có dữ liệu, hãy nói rõ thông tin chưa được cập nhật.`,
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
