import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// Cấu hình OpenRouter Provider chính thức
export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Model ID mặc định
export const DEFAULT_AI_MODEL = 'minimax/minimax-m2.5:free';
