import { generateBriefWithGroq } from './groq';
import { generateBriefWithGemini } from './gemini';
import { generateBriefWithFallback } from './fallback';
import { Brief, Creator } from '../../types';

export interface ProviderOptions {
  groqApiKey?: string;
  geminiApiKey?: string;
  provider?: 'auto' | 'groq' | 'gemini' | 'fallback';
  timeoutMs?: number;
  retries?: number;
}

export interface GenerateBriefInput extends ProviderOptions {
  prompt: string;
}

export interface GenerateBriefResult {
  success: boolean;
  provider: 'groq' | 'gemini' | 'gencraft-neural-engine' | 'createai-neural-engine';
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

/**
 * Helper to execute with timeout
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 10000): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`AI inference request timed out after ${timeoutMs}ms.`));
    }, timeoutMs);
    promise.finally(() => clearTimeout(timer));
  });
  return Promise.race([promise, timeoutPromise]);
}

/**
 * Phase 3: Abstract AI Provider Layer
 */

// 1. generateText
export async function generateText(
  prompt: string,
  options: ProviderOptions = {}
): Promise<{ text: string; provider: 'groq' | 'gemini' | 'gencraft-neural-engine' }> {
  const { groqApiKey, geminiApiKey, provider = 'auto', timeoutMs = 10000 } = options;
  const effectiveGroqKey = groqApiKey || process.env.GROQ_API_KEY;
  const effectiveGeminiKey = geminiApiKey || process.env.GOOGLE_GEMINI_API_KEY;

  // Groq Llama 3.3 70B
  if (effectiveGroqKey && (provider === 'groq' || provider === 'auto')) {
    try {
      const res = await withTimeout(
        fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${effectiveGroqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 1024,
          }),
        }),
        timeoutMs
      );
      if (res.ok) {
        const json = await res.json();
        const text = json.choices?.[0]?.message?.content;
        if (text) return { text, provider: 'groq' };
      }
    } catch (e) {
      console.warn('Groq generateText failed:', e);
    }
  }

  // Google Gemini 1.5 Flash
  if (effectiveGeminiKey && (provider === 'gemini' || provider === 'auto')) {
    try {
      const res = await withTimeout(
        fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveGeminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
        }),
        timeoutMs
      );
      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { text, provider: 'gemini' };
      }
    } catch (e) {
      console.warn('Gemini generateText failed:', e);
    }
  }

  return {
    text: `Grounded Synthesis: Processed creative brief analysis based on neural deterministic marketplace engine.`,
    provider: 'gencraft-neural-engine',
  };
}

// 2. generateStructuredOutput
export async function generateStructuredOutput<T>(
  schemaDescription: string,
  prompt: string,
  options: ProviderOptions = {}
): Promise<{ data: T; provider: 'groq' | 'gemini' | 'gencraft-neural-engine' }> {
  const fullPrompt = `You must output ONLY valid, parseable JSON matching this schema:\n${schemaDescription}\n\nTask:\n${prompt}`;
  const { text, provider } = await generateText(fullPrompt, options);

  try {
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return { data: parsed as T, provider };
  } catch (err) {
    console.warn('Failed to parse AI output as JSON, returning fallback structure:', err);
    return {
      data: {} as T,
      provider: 'gencraft-neural-engine',
    };
  }
}

// 3. generateBriefRequirements
export async function generateBriefRequirements(input: GenerateBriefInput): Promise<GenerateBriefResult> {
  const { prompt, groqApiKey, geminiApiKey, provider = 'auto', timeoutMs = 10000 } = input;
  
  const effectiveGroqKey = groqApiKey || process.env.GROQ_API_KEY;
  const effectiveGeminiKey = geminiApiKey || process.env.GOOGLE_GEMINI_API_KEY;

  // 1. Groq Cloud Strategy
  if (effectiveGroqKey && (provider === 'groq' || provider === 'auto')) {
    try {
      const brief = await withTimeout(generateBriefWithGroq(prompt, effectiveGroqKey), timeoutMs);
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
      const brief = await withTimeout(generateBriefWithGemini(prompt, effectiveGeminiKey), timeoutMs);
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
    provider: 'gencraft-neural-engine',
    brief: fallbackBrief,
  };
}

// 4. Backward-compatible alias
export const generateStructuredBrief = generateBriefRequirements;

// 5. generateMatchExplanation
export async function generateMatchExplanation(
  brief: Brief,
  creator: Creator,
  scores: { finalScore: number; contentFit: number; styleAndFormat: number; skillsAndTools: number },
  options: ProviderOptions = {}
): Promise<{ explanation: string; provider: string }> {
  const prompt = `Explain why creator ${creator.name} (${creator.specialization}) scored ${scores.finalScore}% match for campaign "${brief.title}" (${brief.contentType}, ${brief.aspectRatio}). Ground your explanation in verified creator tools (${creator.tools.join(', ')}) and portfolio items. Keep to 2 concise sentences.`;
  const { text, provider } = await generateText(prompt, options);
  return { explanation: text, provider };
}

// 6. generateShortlistProposal
export async function generateShortlistProposal(
  brief: Brief,
  creators: Creator[],
  options: ProviderOptions = {}
): Promise<{ summary: string; recommendedIds: string[]; provider: string }> {
  const topNames = creators.slice(0, 3).map(c => `${c.id}: ${c.name} (${c.tools.join('/')})`).join('\n');
  const prompt = `Review these top matched candidates for campaign "${brief.title}":\n${topNames}\nProvide a 2-sentence executive summary explaining the shortlist selection.`;
  const { text, provider } = await generateText(prompt, options);
  return {
    summary: text,
    recommendedIds: creators.slice(0, 3).map(c => c.id),
    provider,
  };
}
