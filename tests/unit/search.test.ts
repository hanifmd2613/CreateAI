import { searchCreators, normalizeSearchQuery } from '../../src/lib/search';
import { MOCK_CREATORS } from '../../src/data/mockData';

export async function runSearchUnitTests(): Promise<{ passed: number; failed: number; tests: { name: string; pass: boolean; details?: string }[] }> {
  const tests: { name: string; pass: boolean; details?: string }[] = [];

  // Test 1: Query Normalization & Token Extraction
  try {
    const norm = normalizeSearchQuery('  Find an AI creator who can make a smartphone launch video, vertical 9:16!  ');
    if (!norm.tokens.includes('smartphone') || !norm.tokens.includes('launch') || !norm.tokens.includes('video')) {
      throw new Error(`Normalization missed key tokens: ${JSON.stringify(norm.tokens)}`);
    }
    if (!norm.phrases.includes('smartphone launch') || !norm.phrases.includes('9:16')) {
      throw new Error(`Normalization missed key phrases: ${JSON.stringify(norm.phrases)}`);
    }
    tests.push({ name: 'Query Normalization, Tokenization & Phrase Extraction', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Query Normalization, Tokenization & Phrase Extraction', pass: false, details: err.message });
  }

  // Test 2: Exact Creator Name Search
  try {
    const results = searchCreators(MOCK_CREATORS, { query: 'Karthik Subramanian' });
    if (results.length === 0 || results[0].creator.name !== 'Karthik Subramanian') {
      throw new Error(`Expected Karthik Subramanian as #1, got ${results[0]?.creator.name}`);
    }
    tests.push({ name: 'Exact Creator Name Retrieval & #1 Ranking', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Exact Creator Name Retrieval & #1 Ranking', pass: false, details: err.message });
  }

  // Test 3: Partial Creator Name Search
  try {
    const results = searchCreators(MOCK_CREATORS, { query: 'Ananya' });
    if (results.length === 0 || results[0].creator.name !== 'Ananya Nair') {
      throw new Error(`Expected Ananya Nair as #1, got ${results[0]?.creator.name}`);
    }
    tests.push({ name: 'Partial Creator Name Retrieval', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Partial Creator Name Retrieval', pass: false, details: err.message });
  }

  // Test 4: Tool-Specific Query ("Kling" or "Veo")
  try {
    const results = searchCreators(MOCK_CREATORS, { query: 'Veo cinematic camera' });
    if (results.length === 0 || !results[0].creator.tools.includes('Veo')) {
      throw new Error(`Expected top creator to have Veo, got tools: ${results[0]?.creator.tools.join(', ')}`);
    }
    tests.push({ name: 'Tool Query Retrieval ("Veo cinematic camera")', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Tool Query Retrieval ("Veo cinematic camera")', pass: false, details: err.message });
  }

  // Test 5: Complex Natural-Language Creative Brief
  try {
    const complexQuery = 'Find an AI creator who can make a premium futuristic smartphone launch video using generative video tools, cinematic lighting, vertical 9:16 output, and worldwide commercial usage.';
    const results = searchCreators(MOCK_CREATORS, { query: complexQuery });

    if (results.length === 0) {
      throw new Error('Complex query returned 0 results');
    }

    const top = results[0];
    if (top.relevanceScore < 60) {
      throw new Error(`Expected strong match score (>=60), got ${top.relevanceScore}`);
    }

    // Top creator must have video tools & worldwide rights
    if (!top.creator.tools.some(t => ['Veo', 'Kling', 'Sora'].includes(t))) {
      throw new Error('Top creator lacks generative video tools');
    }

    if (top.licensingCompatibility !== 'COMPATIBLE') {
      throw new Error('Top creator should have compatible worldwide commercial licensing');
    }

    tests.push({ 
      name: 'Natural-Language Smartphone Launch Brief Retrieval', 
      pass: true,
      details: `Top result: ${top.creator.name} (${top.relevanceScore}% match)` 
    });
  } catch (err: any) {
    tests.push({ name: 'Natural-Language Smartphone Launch Brief Retrieval', pass: false, details: err.message });
  }

  // Test 6: Conceptual & Synonym Retrieval ("AI-generated luxury product advertisements")
  try {
    const results = searchCreators(MOCK_CREATORS, { query: 'AI-generated luxury product advertisements' });
    if (results.length === 0) {
      throw new Error('Synonym query returned 0 results');
    }

    // Rohan Sharma or Karthik Subramanian specialize in luxury product / commercial
    const topCreators = results.slice(0, 2).map(r => r.creator.name);
    if (!topCreators.includes('Rohan Sharma') && !topCreators.includes('Karthik Subramanian')) {
      throw new Error(`Expected Rohan Sharma or Karthik in top 2, got: ${topCreators.join(', ')}`);
    }

    tests.push({ name: 'Semantic Concept & Synonym Expansion ("luxury product advertisements")', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Semantic Concept & Synonym Expansion ("luxury product advertisements")', pass: false, details: err.message });
  }

  // Test 7: Licensing Constraint & Territory Mismatch Flagging
  try {
    const results = searchCreators(MOCK_CREATORS, { query: 'Worldwide commercial rights for 30-second campaign' });
    const priyaResult = results.find(r => r.creator.id === 'creator-4'); // Priya Venkatesh has Domestic India only

    if (priyaResult && priyaResult.licensingCompatibility !== 'MISMATCH') {
      throw new Error('Priya Venkatesh should be flagged as MISMATCH for worldwide commercial requirement');
    }

    tests.push({ name: 'Licensing Mismatch & Territory Conflict Detection in Search', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Licensing Mismatch & Territory Conflict Detection in Search', pass: false, details: err.message });
  }

  // Test 8: Empty Search Query Returns Default Pool
  try {
    const results = searchCreators(MOCK_CREATORS, { query: '' });
    if (results.length !== MOCK_CREATORS.length) {
      throw new Error(`Expected all ${MOCK_CREATORS.length} creators, got ${results.length}`);
    }
    tests.push({ name: 'Empty Search Query Returns Full Catalog', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Empty Search Query Returns Full Catalog', pass: false, details: err.message });
  }

  // Test 9: Combined Search with Tool Filter
  try {
    const results = searchCreators(MOCK_CREATORS, { query: 'cinematic lighting', tool: 'Veo' });
    for (const r of results) {
      if (!r.creator.tools.includes('Veo')) {
        throw new Error(`Creator ${r.creator.name} does not have filtered tool Veo`);
      }
    }
    tests.push({ name: 'Combined Query & Tool Filter Enforcement', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Combined Query & Tool Filter Enforcement', pass: false, details: err.message });
  }

  const passed = tests.filter(t => t.pass).length;
  const failed = tests.filter(t => !t.pass).length;

  return { passed, failed, tests };
}
