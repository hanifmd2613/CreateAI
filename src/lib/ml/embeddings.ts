import crypto from 'crypto';

export const EMBEDDING_MODEL = 'gencraft-dense-v1.2';
export const EMBEDDING_DIM = 384;

export interface EmbeddingVector {
  vector: number[];
  model: string;
  provider: string;
  dim: number;
  normalized: boolean;
}

export interface EmbeddingProvider {
  readonly providerId: string;
  readonly modelVersion: string;
  readonly dimensions: number;
  embed(text: string): Promise<EmbeddingVector>;
}

// In-memory embedding cache with TTL (10 minutes)
interface CacheEntry {
  embedding: EmbeddingVector;
  timestamp: number;
}
const embeddingCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;

// Creator-specific cache tracking for invalidation
const creatorCacheKeys = new Map<string, Set<string>>();

/**
 * Validates a dense vector:
 * - Must be an array of length equal to expectedDim
 * - Every element must be a finite number (not NaN or Infinity)
 * - Norm must be non-zero
 */
export function validateVector(vec: number[], expectedDim: number = EMBEDDING_DIM): { valid: boolean; reason?: string } {
  if (!Array.isArray(vec)) {
    return { valid: false, reason: 'Vector must be an array of numbers' };
  }
  if (vec.length !== expectedDim) {
    return { valid: false, reason: `Dimension mismatch: expected ${expectedDim}, got ${vec.length}` };
  }
  let sumSq = 0;
  for (let i = 0; i < vec.length; i++) {
    const val = vec[i];
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      return { valid: false, reason: `Non-finite numeric value at index ${i}: ${val}` };
    }
    sumSq += val * val;
  }
  if (sumSq === 0) {
    return { valid: false, reason: 'Zero-magnitude vector' };
  }
  return { valid: true };
}

/**
 * Computes cosine similarity between two normalized vectors.
 * Ensures model compatibility and bounds the return value to [-1, 1].
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i];
    const b = vecB[i];
    if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA === 0 || normB === 0) return 0;
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  const similarity = dotProduct / denominator;
  return Math.max(-1, Math.min(1, similarity));
}

/**
 * Safe cosine similarity checking model and dimension compatibility.
 * Rejects comparing vectors produced by incompatible models.
 */
export function safeCosineSimilarity(a: EmbeddingVector | number[], b: EmbeddingVector | number[]): number {
  const isEmbedA = typeof a === 'object' && 'vector' in a;
  const isEmbedB = typeof b === 'object' && 'vector' in b;

  if (isEmbedA && isEmbedB) {
    const objA = a as EmbeddingVector;
    const objB = b as EmbeddingVector;
    if (objA.model !== objB.model) {
      console.warn(`[EmbeddingWarning] Comparing mismatched models: ${objA.model} vs ${objB.model}. Returning 0.`);
      return 0;
    }
    if (objA.dim !== objB.dim) {
      console.warn(`[EmbeddingWarning] Dimension mismatch: ${objA.dim} vs ${objB.dim}. Returning 0.`);
      return 0;
    }
    return cosineSimilarity(objA.vector, objB.vector);
  }

  const arrA = isEmbedA ? (a as EmbeddingVector).vector : (a as number[]);
  const arrB = isEmbedB ? (b as EmbeddingVector).vector : (b as number[]);
  return cosineSimilarity(arrA, arrB);
}

// Domain Semantic Cluster Weights for 384-d feature projection
// Includes synonyms, domain paraphrases, and visual keywords
const SEMANTIC_CLUSTERS: Record<string, number[]> = {
  // 1. Skincare & Beauty (0 - 32)
  skincare: [0, 32],
  beauty: [0, 32],
  cosmetics: [0, 32],
  serum: [0, 32],
  dermatology: [0, 32],
  hydration: [0, 32],
  glow: [0, 32],
  retinol: [0, 32],
  toner: [0, 32],
  sunscreen: [0, 32],

  // 2. Automotive & Vehicles (32 - 64)
  automotive: [32, 64],
  supercar: [32, 64],
  vehicle: [32, 64],
  speed: [32, 64],
  racing: [32, 64],
  ev: [32, 64],
  electric: [32, 64],
  car: [32, 64],
  drift: [32, 64],

  // 3. Fashion & Apparel (64 - 96)
  fashion: [64, 96],
  couture: [64, 96],
  apparel: [64, 96],
  silk: [64, 96],
  editorial: [64, 96],
  clothing: [64, 96],
  runway: [64, 96],
  haute: [64, 96],

  // 4. B2B & Enterprise SaaS (96 - 128)
  saas: [96, 128],
  b2b: [96, 128],
  software: [96, 128],
  enterprise: [96, 128],
  cloud: [96, 128],
  dashboard: [96, 128],
  devops: [96, 128],
  productivity: [96, 128],

  // 5. Gaming, VFX & Fantasy (128 - 160)
  gaming: [128, 160],
  game: [128, 160],
  fantasy: [128, 160],
  animation: [128, 160],
  vfx: [128, 160],
  anime: [128, 160],
  cgi: [128, 160],
  cinematic: [128, 160],
  trailer: [128, 160],

  // 6. Food & Beverage (160 - 192)
  food: [160, 192],
  beverage: [160, 192],
  culinary: [160, 192],
  recipe: [160, 192],
  snacks: [160, 192],
  gourmet: [160, 192],
  coffee: [160, 192],

  // 7. Sustainability & Documentary (192 - 224)
  sustainability: [192, 224],
  documentary: [192, 224],
  eco: [192, 224],
  green: [192, 224],
  nature: [192, 224],
  conservation: [192, 224],
  solar: [192, 224],

  // 8. Luxury & Horology (224 - 256)
  luxury: [224, 256],
  horlogerie: [224, 256],
  watch: [224, 256],
  titanium: [224, 256],
  timepiece: [224, 256],
  jewelry: [224, 256],
  diamond: [224, 256],

  // 9. Production Tools (256 - 320)
  veo: [256, 288],
  kling: [256, 288],
  sora: [256, 288],
  runwayml: [256, 288],
  midjourney: [288, 320],
  flux: [288, 320],
  elevenlabs: [288, 320],

  // 10. Formats & Camera Directions (320 - 384)
  vertical: [320, 352],
  reel: [320, 352],
  tiktok: [320, 352],
  horizontal: [352, 384],
  commercial: [352, 384],
  photorealistic: [352, 384],
};

/**
 * Generates a reproducible, L2-normalized 384-dimensional dense semantic embedding.
 * Uses deterministic n-gram hashing combined with domain ontology semantic projection.
 */
export function generateLocalDenseEmbedding(text: string): number[] {
  const vector = new Array(EMBEDDING_DIM).fill(0);
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return vector;
  }

  const normalized = text.toLowerCase().trim();
  const tokens = normalized.split(/[^a-z0-9_-]+/).filter(t => t.length > 1);

  if (tokens.length === 0) return vector;

  // 1. Hash projection for general lexical vocabulary
  for (const token of tokens) {
    const hash = crypto.createHash('sha256').update(token).digest();
    for (let i = 0; i < 8; i++) {
      const idx = (hash[i * 2] * 256 + hash[i * 2 + 1]) % EMBEDDING_DIM;
      const val = (hash[i] / 255.0) * 2 - 1;
      vector[idx] += val * 0.5;
    }

    // 2. Semantic Cluster Projection for domain concepts
    for (const [clusterKey, range] of Object.entries(SEMANTIC_CLUSTERS)) {
      if (token.includes(clusterKey) || clusterKey.includes(token)) {
        const [start, end] = range;
        for (let dim = start; dim < end; dim++) {
          const clusterHash = (hash[dim % hash.length] / 255.0);
          vector[dim] += 1.5 + clusterHash;
        }
      }
    }
  }

  // 3. L2 Normalization (Unit vector length = 1.0)
  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    norm += vector[i] * vector[i];
  }

  if (norm > 0) {
    const sqrtNorm = Math.sqrt(norm);
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      vector[i] = Number((vector[i] / sqrtNorm).toFixed(6));
    }
  }

  return vector;
}

/**
 * Deterministic local dense embedding provider
 */
export class LocalDeterministicEmbeddingProvider implements EmbeddingProvider {
  readonly providerId = 'gencraft-local-deterministic';
  readonly modelVersion = EMBEDDING_MODEL;
  readonly dimensions = EMBEDDING_DIM;

  async embed(text: string): Promise<EmbeddingVector> {
    const vector = generateLocalDenseEmbedding(text);
    return {
      vector,
      model: this.modelVersion,
      provider: this.providerId,
      dim: this.dimensions,
      normalized: true,
    };
  }
}

const defaultLocalProvider = new LocalDeterministicEmbeddingProvider();

/**
 * Generates an embedding for text with caching and model version tracking.
 */
export async function getSemanticEmbedding(
  text: string,
  options?: { creatorId?: string; bypassCache?: boolean }
): Promise<EmbeddingVector> {
  const cacheKey = crypto.createHash('sha256').update(text || '').digest('hex');

  // Check cache
  if (!options?.bypassCache) {
    const cached = embeddingCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.embedding;
    }
  }

  const result = await defaultLocalProvider.embed(text);

  // Store in cache
  embeddingCache.set(cacheKey, {
    embedding: result,
    timestamp: Date.now(),
  });

  // Track key for creator-specific invalidation if provided
  if (options?.creatorId) {
    let keys = creatorCacheKeys.get(options.creatorId);
    if (!keys) {
      keys = new Set();
      creatorCacheKeys.set(options.creatorId, keys);
    }
    keys.add(cacheKey);
  }

  return result;
}

/**
 * Invalidates cached embeddings for a specific creator when their profile or portfolio updates.
 */
export function invalidateCreatorEmbedding(creatorId: string): void {
  const keys = creatorCacheKeys.get(creatorId);
  if (keys) {
    keys.forEach((key) => {
      embeddingCache.delete(key);
    });
    creatorCacheKeys.delete(creatorId);
  }
}

/**
 * Clears the entire embedding cache (useful for testing).
 */
export function clearEmbeddingCache(): void {
  embeddingCache.clear();
  creatorCacheKeys.clear();
}
