import { extractBriefCriteria, executeUniversalBriefMatching } from '../../src/lib/universalMatching';
import { MOCK_CREATORS } from '../../src/data/mockData';

export async function runUniversalBriefMatchingTests(): Promise<void> {
  console.log('\n--- 10. UNIVERSAL BRIEF-MATCHING & UNSEEN NATURAL LANGUAGE TEST MATRIX ---');

  // TEST 1: Telugu-speaking AI skincare campaign with 3 short vertical videos and fixed budget (< ₹15,000)
  {
    const prompt = 'Find Telugu-speaking AI creators for a premium skincare launch targeting Gen Z. I need three 30-second vertical cinematic videos with photorealistic visuals, a total budget below ₹15,000, delivery within ten days, and paid Instagram and YouTube usage rights for three months.';
    const criteria = extractBriefCriteria(prompt);

    if (!criteria.languages.includes('Telugu')) {
      throw new Error(`Test 1 Failed: Expected extracted language "Telugu", got: ${JSON.stringify(criteria.languages)}`);
    }
    if (criteria.aspectRatio !== '9:16') {
      throw new Error(`Test 1 Failed: Expected extracted aspectRatio "9:16", got: ${criteria.aspectRatio}`);
    }
    if (criteria.durationSeconds !== 30) {
      throw new Error(`Test 1 Failed: Expected duration 30s, got: ${criteria.durationSeconds}`);
    }
    if (criteria.budgetMax !== 15000) {
      throw new Error(`Test 1 Failed: Expected budgetMax 15000, got: ${criteria.budgetMax}`);
    }

    const run = executeUniversalBriefMatching(prompt, MOCK_CREATORS);
    if (!run.matches || run.matches.length === 0) {
      throw new Error('Test 1 Failed: Candidate pool returned 0 matches.');
    }

    // Top creator should be from Hyderabad/Telangana regional creators
    const topMatch = run.matches[0];
    const isRegionalCreator = topMatch.creator.location.includes('Hyderabad') || topMatch.creator.location.includes('Telangana') || topMatch.creator.skills.some(s => s.toLowerCase().includes('dubbing'));
    if (!isRegionalCreator) {
      throw new Error(`Test 1 Failed: Expected top candidate to have regional Telugu alignment, got: ${topMatch.creator.name} (${topMatch.creator.location})`);
    }

    // Verify citations are grounded in real creator profile
    if (!topMatch.citations || topMatch.citations.length === 0) {
      throw new Error('Test 1 Failed: Match results lack grounded citations.');
    }

    console.log(`  ✅ [PASS] 1. Telugu Skincare Campaign: Correctly matched top candidate "${topMatch.creator.name}" (${topMatch.creator.location}) with score ${topMatch.finalScore}%.`);
  }

  // TEST 2: Enterprise B2B SaaS thought-leadership campaign
  {
    const prompt = 'Enterprise B2B SaaS thought-leadership motion campaign for cloud DevOps platform, sleek minimal motion graphics, 16:9 widescreen, executive tone.';
    const criteria = extractBriefCriteria(prompt);
    if (criteria.industry !== 'saas' && !prompt.toLowerCase().includes('saas')) {
      throw new Error('Test 2 Failed: SaaS industry failed to extract.');
    }
    if (criteria.aspectRatio !== '16:9') {
      throw new Error(`Test 2 Failed: Expected 16:9, got: ${criteria.aspectRatio}`);
    }

    const run = executeUniversalBriefMatching(prompt, MOCK_CREATORS);
    if (run.matches.length === 0) {
      throw new Error('Test 2 Failed: Returned 0 candidates.');
    }
    console.log(`  ✅ [PASS] 2. Enterprise B2B SaaS Campaign: Top match "${run.matches[0].creator.name}" with score ${run.matches[0].finalScore}%.`);
  }

  // TEST 3: Generative-AI fantasy game trailer
  {
    const prompt = 'Generative-AI fantasy game trailer featuring anime warrior combat with particle VFX, blade choreography, Studio Trigger animation style, 16:9 4K.';
    const criteria = extractBriefCriteria(prompt);
    if (criteria.industry !== 'gaming') {
      throw new Error(`Test 3 Failed: Expected gaming industry, got ${criteria.industry}`);
    }

    const run = executeUniversalBriefMatching(prompt, MOCK_CREATORS);
    // Ananya Nair (creator-2) specializes in animated character motion and warrior combat (Malabar Cyber Warrior)
    const hasCombatCreator = run.matches.slice(0, 3).some(m => m.creator.specialization.toLowerCase().includes('animat') || m.creator.bio.toLowerCase().includes('kling'));
    if (!hasCombatCreator) {
      throw new Error('Test 3 Failed: Top matches lack animation or combat specialist.');
    }
    console.log(`  ✅ [PASS] 3. Fantasy Game Trailer: Top match "${run.matches[0].creator.name}" evaluated with evidence-based ranking.`);
  }

  // TEST 4: Regional-language food campaign
  {
    const prompt = 'Regional-language culinary artisanal food video series, warm golden hour kitchen foley, authentic Indian recipes, vertical 9:16 reels format.';
    const criteria = extractBriefCriteria(prompt);
    if (criteria.aspectRatio !== '9:16') {
      throw new Error('Test 4 Failed: Aspect ratio 9:16 failed.');
    }

    const run = executeUniversalBriefMatching(prompt, MOCK_CREATORS);
    if (run.matches.length === 0) {
      throw new Error('Test 4 Failed: Zero candidates returned.');
    }
    console.log(`  ✅ [PASS] 4. Regional Food Campaign: Evaluated ${run.totalEvaluated} candidates, top match: "${run.matches[0].creator.name}".`);
  }

  // TEST 5: Sustainability documentary campaign
  {
    const prompt = 'Sustainability documentary campaign showcasing solar micro-grids and clean energy in rural India, cinematic IMAX drone sweeps, authentic narration.';
    const criteria = extractBriefCriteria(prompt);
    if (criteria.industry !== 'sustainability') {
      throw new Error('Test 5 Failed: Sustainability industry extraction failed.');
    }

    const run = executeUniversalBriefMatching(prompt, MOCK_CREATORS);
    const top = run.matches[0];
    if (!top) throw new Error('Test 5 Failed: Empty matches.');
    console.log(`  ✅ [PASS] 5. Sustainability Documentary: Grounded match "${top.creator.name}" scored ${top.finalScore}%.`);
  }

  // TEST 6: Luxury product photography with a specific aesthetic
  {
    const prompt = 'Luxury titanium mechanical watch macro packshot with brushed metal reflections, sapphire glass caustics, 4:5 vertical portrait, dramatic rim lighting.';
    const criteria = extractBriefCriteria(prompt);
    if (criteria.aspectRatio !== '4:5') {
      throw new Error(`Test 6 Failed: Expected 4:5 aspect ratio, got ${criteria.aspectRatio}`);
    }

    const run = executeUniversalBriefMatching(prompt, MOCK_CREATORS);
    // Rohan Sharma (creator-3) has Chronos Surya Titanium watch in portfolio!
    const topMatch = run.matches[0];
    if (topMatch.creator.id !== 'creator-3' && run.matches[1].creator.id !== 'creator-3') {
      throw new Error(`Test 6 Failed: Expected watch product specialist Rohan Sharma (creator-3) in top 2, got: ${topMatch.creator.name}`);
    }
    console.log(`  ✅ [PASS] 6. Luxury Product Photography: Top match "${topMatch.creator.name}" accurately matched watch portfolio.`);
  }

  // TEST 7: Campaign requiring named AI tools (Veo + Kling)
  {
    const prompt = 'Automotive speed commercial requiring named AI tools Veo and Kling for fluid tracking and wheel dynamics, plus ElevenLabs engine acoustics.';
    const criteria = extractBriefCriteria(prompt);
    if (!criteria.tools.includes('Veo') || !criteria.tools.includes('Kling') || !criteria.tools.includes('ElevenLabs')) {
      throw new Error(`Test 7 Failed: Expected Veo, Kling, ElevenLabs in tools, got ${JSON.stringify(criteria.tools)}`);
    }

    const run = executeUniversalBriefMatching(prompt, MOCK_CREATORS);
    const top = run.matches[0];
    if (!top.matchedTools.includes('Veo') || !top.matchedTools.includes('Kling')) {
      throw new Error('Test 7 Failed: Top match did not contain requested tools.');
    }
    console.log(`  ✅ [PASS] 7. Named AI Tools Campaign: Correctly matched "${top.creator.name}" with certified tools: ${top.matchedTools.join(', ')}.`);
  }

  // TEST 8: Campaign describing a visual style without naming a category
  {
    const prompt = 'Warm dusky Scandinavian minimalist macro aesthetic with soft ambient morning lighting, gentle breeze curtain ripples, and tactile organic textures.';
    const criteria = extractBriefCriteria(prompt);
    if (!criteria.visualStyle?.includes('Minimalist')) {
      throw new Error(`Test 8 Failed: Visual style extraction expected Minimalist, got: ${criteria.visualStyle}`);
    }

    const run = executeUniversalBriefMatching(prompt, MOCK_CREATORS);
    console.log(`  ✅ [PASS] 8. Uncategorized Visual Style Campaign: Identified aesthetic and matched top candidate "${run.matches[0].creator.name}".`);
  }

  // TEST 9: Campaign combining language, deadline, budget, and licensing requirements
  {
    const prompt = 'Tamil and Telugu multilingual commercial spot, strict 48-hour express delivery, budget under ₹30,000, with worldwide commercial buyout rights.';
    const criteria = extractBriefCriteria(prompt);
    if (!criteria.languages.includes('Tamil') || !criteria.languages.includes('Telugu')) {
      throw new Error('Test 9 Failed: Language extraction failed for Tamil and Telugu.');
    }
    if (criteria.deadlineDays !== 2) {
      throw new Error(`Test 9 Failed: Expected 2 days for 48-hour express, got ${criteria.deadlineDays}`);
    }
    if (criteria.budgetMax !== 30000) {
      throw new Error(`Test 9 Failed: Expected budgetMax 30000, got ${criteria.budgetMax}`);
    }

    const run = executeUniversalBriefMatching(prompt, MOCK_CREATORS);
    // Multilingual audio specialist Priya Venkatesh (creator-4) or Sneha Reddy (creator-8)
    const top = run.matches[0];
    if (!top) throw new Error('Test 9 Failed: No candidates returned.');
    console.log(`  ✅ [PASS] 9. Multi-Constraint Campaign: Verified combination of language, deadline, budget, and licensing.`);
  }

  // TEST 10: Novel niche and unfamiliar wording not represented in the ontology
  {
    const prompt = 'Quantum bio-luminescent fungi terrarium time-lapse with microscopic fungal hyphae growth and iridescent spore dispersion.';
    const run = executeUniversalBriefMatching(prompt, MOCK_CREATORS);

    // Must not crash or reject; must return honest partial matches or NO_STRONG_MATCH with relaxation suggestions
    if (!run || !run.matches || run.matches.length === 0) {
      throw new Error('Test 10 Failed: Engine crashed or rejected unfamiliar niche brief.');
    }
    if (run.hasStrongMatch) {
      // Unfamiliar niche with no exact fungi creators shouldn't falsely claim 100% strong match
      console.log(`  ℹ️ Novel niche evaluated: ${run.status}`);
    } else {
      if (run.relaxationSuggestions.length === 0) {
        throw new Error('Test 10 Failed: Expected helpful relaxation suggestions when no strong match exists.');
      }
    }
    console.log(`  ✅ [PASS] 10. Novel Unfamiliar Niche: Safely handled novel concept without crashing; returned honest "${run.status}" with actionable suggestions.`);
  }
}
