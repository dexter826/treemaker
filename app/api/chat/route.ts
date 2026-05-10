import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';

export const maxDuration = 30;

// Xử lý chat gia phả qua Gemini
export async function POST(req: Request) {
  try {
    const { messages, dataContext } = await req.json();

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: `Bạn là trợ lý ảo chuyên về gia phả trong ứng dụng TreeMaker. 
      Dưới đây là dữ liệu hiện tại của cây gia phả:
      ${JSON.stringify(dataContext, null, 2)}
      
      Nhiệm vụ:
      1. Trả lời các câu hỏi về mối quan hệ giữa các thành viên.
      2. Giải thích cách sử dụng ứng dụng.
      3. Phân tích thông tin dựa trên dữ liệu JSON được cung cấp.
      4. Trả lời ngắn gọn, súc tích, phong cách chuyên nghiệp nhưng thân thiện.
      
      Lưu ý: Nếu không biết câu trả lời từ dữ liệu, hãy nói rõ là thông tin chưa được cập nhật.`,
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
