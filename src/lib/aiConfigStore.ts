import crypto from 'crypto';

interface BrandAiCredentials {
  brandId: string;
  groqKey?: string;
  geminiKey?: string;
  updatedAt: string;
}

// In-memory server-side secure store for brand AI keys (fallback / cache)
const memoryStore = new Map<string, BrandAiCredentials>();

// Mask key for safe client display: "gsk_••••••••4f2a"
export function maskApiKey(key?: string): string | undefined {
  if (!key || key.length < 8) return undefined;
  const prefix = key.slice(0, 4);
  const suffix = key.slice(-4);
  return `${prefix}••••••••${suffix}`;
}

export function saveBrandAiKeys(brandId: string, groqKey?: string, geminiKey?: string): BrandAiCredentials {
  const existing = memoryStore.get(brandId) || { brandId, updatedAt: new Date().toISOString() };
  
  const updated: BrandAiCredentials = {
    brandId,
    groqKey: groqKey !== undefined ? (groqKey.trim() || undefined) : existing.groqKey,
    geminiKey: geminiKey !== undefined ? (geminiKey.trim() || undefined) : existing.geminiKey,
    updatedAt: new Date().toISOString(),
  };

  memoryStore.set(brandId, updated);
  return updated;
}

export function getBrandAiKeys(brandId: string): BrandAiCredentials | undefined {
  return memoryStore.get(brandId);
}

export function getEffectiveAiKeys(brandId?: string): { groqKey?: string; geminiKey?: string } {
  let groqKey = process.env.GROQ_API_KEY;
  let geminiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (brandId && memoryStore.has(brandId)) {
    const brandCreds = memoryStore.get(brandId);
    if (brandCreds?.groqKey) groqKey = brandCreds.groqKey;
    if (brandCreds?.geminiKey) geminiKey = brandCreds.geminiKey;
  }

  return { groqKey, geminiKey };
}
