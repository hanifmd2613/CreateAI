import { generateBriefWithGroq } from './groq';
import { generateBriefWithGemini } from './gemini';
import { generateBriefWithFallback } from './fallback';

export interface GenerateBriefInput {
  prompt: string;
  groqApiKey?: string;
  geminiApiKey?: string;
  provider?: 'auto' | 'groq' | 'gemini' | 'fallback';
}

export interface GenerateBriefResult {
  success: boolean;
  provider: 'groq' | 'gemini' | 'createai-neural-engine';
  brief: {
    title: string;
    contentType: string;
    style: string;
    aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
    commercialUse: 'Full Buyout' | 'Licensed';
    budget: string;
    deadline: string;
    tools: string[];
    description: string;
    deliverables: string[];
  };
}

export async function generateStructuredBrief(input: GenerateBriefInput): Promise<GenerateBriefResult> {
  const { prompt, groqApiKey, geminiApiKey, provider = 'auto' } = input;
  
  const effectiveGroqKey = groqApiKey || process.env.GROQ_API_KEY;
  const effectiveGeminiKey = geminiApiKey || process.env.GOOGLE_GEMINI_API_KEY;

  // 1. Groq Cloud Strategy
  if (effectiveGroqKey && (provider === 'groq' || provider === 'auto')) {
    try {
      const brief = await generateBriefWithGroq(prompt, effectiveGroqKey);
      return {
        success: true,
        provider: 'groq',
        brief,
      };
    } catch (groqErr) {
      console.warn('Groq brief generation failed, attempting next provider:', groqErr);
    }
  }

  // 2. Google Gemini Strategy
  if (effectiveGeminiKey && (provider === 'gemini' || provider === 'auto')) {
    try {
      const brief = await generateBriefWithGemini(prompt, effectiveGeminiKey);
      return {
        success: true,
        provider: 'gemini',
        brief,
      };
    } catch (geminiErr) {
      console.warn('Gemini brief generation failed, attempting next provider:', geminiErr);
    }
  }

  // 3. Local Deterministic Synthesis Engine
  const fallbackBrief = generateBriefWithFallback(prompt);
  return {
    success: true,
    provider: 'createai-neural-engine',
    brief: fallbackBrief,
  };
}
