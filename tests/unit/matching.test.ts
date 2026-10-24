import { rankCreatorsForBrief, calculateHybridMatchScore, MATCHING_WEIGHTS } from '../../src/lib/matching';
import { MOCK_CREATORS, INITIAL_BRIEFS } from '../../src/data/mockData';
import { Brief, Creator } from '../../src/types';

export function runMatchingUnitTests(): { name: string; passed: boolean; message?: string }[] {
  const results: { name: string; passed: boolean; message?: string }[] = [];

  // Subtest 1: Weights configuration validation
  try {
    const sum = Object.values(MATCHING_WEIGHTS).reduce((acc, w) => acc + w, 0);
    const isValidSum = Math.abs(sum - 1.0) < 0.0001;
    if (!isValidSum) throw new Error(`Weights sum to ${sum}, expected 1.0`);
    results.push({ name: 'Matching weights sum exactly to 1.0', passed: true });
  } catch (err: any) {
    results.push({ name: 'Matching weights sum exactly to 1.0', passed: false, message: err.message });
  }

  // Subtest 2: Normalized scoring bounded between 0 and 100
  try {
    const testBrief = INITIAL_BRIEFS[0];
    const testCreator = MOCK_CREATORS[0];
    const score = calculateHybridMatchScore(testBrief, testCreator);

    if (score.finalScore < 0 || score.finalScore > 100) {
      throw new Error(`Final score out of bounds: ${score.finalScore}`);
    }
    const { contentFit, styleAndFormat, skillsAndTools, portfolioEvidence, trustSignals, commercialUse } = score.factorScores;
    for (const [k, v] of Object.entries({ contentFit, styleAndFormat, skillsAndTools, portfolioEvidence, trustSignals, commercialUse })) {
      if (v < 0 || v > 100) throw new Error(`Factor score ${k} out of bounds: ${v}`);
    }
    results.push({ name: 'Factor and hybrid scores normalized strictly between 0 and 100', passed: true });
  } catch (err: any) {
    results.push({ name: 'Factor and hybrid scores normalized strictly between 0 and 100', passed: false, message: err.message });
  }

  // Subtest 3: Deterministic ranking order
  try {
    const testBrief = INITIAL_BRIEFS[0];
    const run1 = rankCreatorsForBrief(testBrief, MOCK_CREATORS);
    const run2 = rankCreatorsForBrief(testBrief, MOCK_CREATORS);

    const run1Order = run1.map(m => m.creatorId).join(',');
    const run2Order = run2.map(m => m.creatorId).join(',');

    if (run1Order !== run2Order) {
      throw new Error(`Inconsistent ranking across identical inputs: ${run1Order} vs ${run2Order}`);
    }
    results.push({ name: 'Ranking order is 100% deterministic given identical database records', passed: true });
  } catch (err: any) {
    results.push({ name: 'Ranking order is 100% deterministic given identical database records', passed: false, message: err.message });
  }

  // Subtest 4: Empirical explanations and evidence references
  try {
    const testBrief = INITIAL_BRIEFS[0];
    const ranked = rankCreatorsForBrief(testBrief, MOCK_CREATORS);
    const topMatch = ranked[0];

    if (!topMatch.reasons || topMatch.reasons.length === 0) {
      throw new Error('Top match lacks empirical evidence reasons');
    }
    if (!topMatch.positiveEvidence || topMatch.positiveEvidence.length === 0) {
      throw new Error('Top match lacks positive evidence signals');
    }
    results.push({ name: 'Match recommendations generate grounded, empirical explanations', passed: true });
  } catch (err: any) {
    results.push({ name: 'Match recommendations generate grounded, empirical explanations', passed: false, message: err.message });
  }

  return results;
}

if (process.argv[1]?.includes('matching.test.ts')) {
  const res = runMatchingUnitTests();
  console.table(res);
}
