import { Brief, Creator, MatchResult, AutoShortlistReport } from '../types';
import { evaluateUsageRights } from './rightsEngine';

export function rankCreatorsForCampaign(brief: Brief, creators: Creator[]): MatchResult[] {
  return creators.map(creator => {
    const hardViolations: string[] = [];
    const reasonsForRank: string[] = [];
    const potentialConcerns: string[] = [];
    const missingInfo: string[] = [];
    const suggestedQuestions: string[] = [];

    // 1. Evaluate Rights Compatibility
    const rightsResult = evaluateUsageRights(brief.usageRights, creator.usageTerms);
    if (rightsResult.status === 'conflict') {
      hardViolations.push(`Usage Rights Conflict: ${rightsResult.conflicts[0]}`);
      potentialConcerns.push(...rightsResult.conflicts);
    }
    if (rightsResult.status === 'unknown') {
      missingInfo.push(...rightsResult.missingTerms);
      suggestedQuestions.push('Can you provide full commercial usage and advertising whitelisting confirmation?');
    }

    // 2. Format & Deliverables Compatibility
    const briefNeedsVideo = brief.contentType.toLowerCase().includes('video') || brief.aspectRatio === '9:16';
    const creatorHasVideo = creator.portfolio.some(p => p.type === 'video') || 
                            creator.tools.some(t => ['veo', 'kling', 'sora', 'pika'].includes(t.toLowerCase()));

    if (briefNeedsVideo && !creatorHasVideo) {
      hardViolations.push('Format Conflict: Campaign strictly requires video production, but creator specializes in stills/audio.');
    }

    // 3. Aspect Ratio Alignment
    const hasMatchingRatio = creator.portfolio.some(p => p.aspectRatio === brief.aspectRatio);
    if (hasMatchingRatio) {
      reasonsForRank.push(`Direct portfolio evidence matching required ${brief.aspectRatio} aspect ratio.`);
    }

    // 4. Budget Compatibility
    // Estimate campaign price per creator
    const targetCount = brief.requiredCreatorsCount || 1;
    const maxBudgetTotal = brief.budgetMaxINR || 50000;
    const maxBudgetPerCreator = maxBudgetTotal / targetCount;
    
    // Approximate creator project fee (e.g. 3-4 hours or min project fee)
    const creatorMinEst = creator.minProjectFeeINR || (creator.hourlyRate * 3.5);
    
    if (creatorMinEst > maxBudgetPerCreator * 1.5) {
      // Exceeds budget significantly
      potentialConcerns.push(`Budget Stretch: Estimated fee (₹${Math.round(creatorMinEst).toLocaleString('en-IN')}) exceeds allocated budget of ₹${Math.round(maxBudgetPerCreator).toLocaleString('en-IN')} per creator.`);
      suggestedQuestions.push(`Can you produce a streamlined 15s delivery package within our budget of ₹${Math.round(maxBudgetPerCreator).toLocaleString('en-IN')}?`);
    } else {
      reasonsForRank.push(`Commercial rate is well-calibrated within campaign budget (₹${Math.round(creatorMinEst).toLocaleString('en-IN')} est).`);
    }

    // 5. Availability Check
    if (!creator.availableNow && brief.deadline.toLowerCase().includes('rush')) {
      hardViolations.push('Availability Conflict: Creator currently marked unavailable for rush campaigns.');
    }

    // 6. SCORING BREAKDOWN (Normalized 0 - 100)
    
    // A. Creative & Content Fit (30% weight)
    let creativeFit = 50;
    const textCorpus = `${creator.specialization} ${creator.bio} ${creator.skills.join(' ')}`.toLowerCase();
    const briefKeywords = `${brief.campaignObjective} ${brief.productOrService} ${brief.industryNiche} ${brief.style}`.toLowerCase();
    
    if (briefKeywords.includes('skin') || briefKeywords.includes('beauty') || briefKeywords.includes('cosmetic')) {
      if (textCorpus.includes('product') || textCorpus.includes('fluid') || textCorpus.includes('fashion') || textCorpus.includes('commercial')) {
        creativeFit += 40;
        reasonsForRank.push('Strong creative alignment with beauty, skincare, and luxury macro aesthetics.');
      }
    } else if (briefKeywords.includes('car') || briefKeywords.includes('automotive')) {
      if (textCorpus.includes('cinematic') || textCorpus.includes('drift') || textCorpus.includes('vehicle') || textCorpus.includes('motion')) {
        creativeFit += 45;
        reasonsForRank.push('Demonstrated mastery in automotive dynamics and high-speed motion paths.');
      }
    } else {
      creativeFit += 30;
    }
    creativeFit = Math.min(100, creativeFit);

    // B. Relevant Portfolio Evidence (25% weight)
    let portfolioEvidence = 40;
    const relevantPortfolios = creator.portfolio.filter(item => {
      const pText = `${item.title} ${item.workflowDescription} ${item.specificModel}`.toLowerCase();
      return pText.includes('fluid') || pText.includes('product') || pText.includes('cinematic') || pText.includes('macro');
    });

    if (relevantPortfolios.length > 0) {
      portfolioEvidence += 35 + Math.min(25, relevantPortfolios.length * 10);
      reasonsForRank.push(`${relevantPortfolios.length} relevant commercial portfolio sample${relevantPortfolios.length > 1 ? 's' : ''} directly demonstrating required technique.`);
    } else if (creator.portfolio.length > 0) {
      portfolioEvidence += 20;
    }
    portfolioEvidence = Math.min(100, portfolioEvidence);

    // C. Skills, Platform & Tool Compatibility (20% weight)
    let skillsTools = 30;
    const matchedTools = creator.tools.filter(t => 
      brief.requiredTools.some(bt => bt.toLowerCase() === t.toLowerCase())
    );
    if (matchedTools.length > 0) {
      skillsTools += (matchedTools.length / Math.max(1, brief.requiredTools.length)) * 50;
      reasonsForRank.push(`Direct production pipeline coverage for ${matchedTools.join(', ')}.`);
    }

    const matchedPlatforms = (creator.supportedPlatforms || []).filter(p =>
      brief.targetPlatforms.some(bp => bp.toLowerCase() === p.toLowerCase())
    );
    if (matchedPlatforms.length > 0) {
      skillsTools += 20;
    }
    skillsTools = Math.min(100, Math.round(skillsTools));

    // D. Budget & Deadline Compatibility (15% weight)
    let budgetDeadline = 70;
    if (creatorMinEst <= maxBudgetPerCreator) {
      budgetDeadline += 25;
    } else if (creatorMinEst <= maxBudgetPerCreator * 1.3) {
      budgetDeadline += 10;
    } else {
      budgetDeadline -= 30;
    }
    budgetDeadline = Math.max(20, Math.min(100, budgetDeadline));

    // E. Trust & Verification Signals (10% weight)
    let trustVerification = 50;
    if (creator.isVerified) {
      trustVerification += 30;
      reasonsForRank.push('Audited commercially-safe AI workflow pipeline with verified copyright clearance.');
    }
    if (creator.rating >= 4.9) {
      trustVerification += 15;
    }
    if (creator.completedProjects >= 25) {
      trustVerification += 15;
    }
    trustVerification = Math.min(100, trustVerification);

    // Weighted Score Calculation
    const weightedScore = Math.round(
      (creativeFit * 0.30) +
      (portfolioEvidence * 0.25) +
      (skillsTools * 0.20) +
      (budgetDeadline * 0.15) +
      (trustVerification * 0.10)
    );

    // Determine Overall Eligibility
    // Mandatory Rule: If hard constraint violations exist, mark as ineligible!
    const isEligible = hardViolations.length === 0;

    // Suggested Questions
    if (suggestedQuestions.length === 0) {
      suggestedQuestions.push('What turnaround time can you guarantee for initial 15s keyframe draft?');
      suggestedQuestions.push('Can you provide the seed lock and prompt manifest for deterministic revision passes?');
    }

    return {
      creatorId: creator.id,
      creator,
      matchScore: weightedScore,
      scoreBreakdown: {
        creativeFit,
        portfolioEvidence,
        skillsTools,
        budgetDeadline,
        trustVerification
      },
      isEligible,
      hardConstraintViolations: hardViolations,
      rightsCompatibility: rightsResult.status,
      rightsDiagnostic: rightsResult.diagnostic,
      reasonsForRank: reasonsForRank.slice(0, 3),
      potentialConcerns: potentialConcerns.slice(0, 2),
      missingInformation: missingInfo.slice(0, 2),
      suggestedQuestions: suggestedQuestions.slice(0, 2)
    };
  }).sort((a, b) => {
    // Eligible creators rank above ineligible ones; then by match score
    if (a.isEligible && !b.isEligible) return -1;
    if (!a.isEligible && b.isEligible) return 1;
    return b.matchScore - a.matchScore;
  });
}

// Auto-Shortlist AI Agent
export function generateAutoShortlist(
  brief: Brief,
  allCreators: Creator[],
  requestedCount: number = 5
): AutoShortlistReport {
  const ranked = rankCreatorsForCampaign(brief, allCreators);
  const eligible = ranked.filter(r => r.isEligible);
  const excluded = ranked.filter(r => !r.isEligible);

  const selectedResults = eligible.slice(0, requestedCount);

  const selectedCreators = selectedResults.map(res => ({
    creatorId: res.creatorId,
    creatorName: res.creator.name,
    score: res.matchScore,
    selectionRationale: `Ranked #${selectedResults.indexOf(res) + 1} with ${res.matchScore}/100 match. ${res.reasonsForRank[0] || 'High creative and technical compatibility.'}`
  }));

  const excludedCreators = excluded.map(res => ({
    creatorId: res.creatorId,
    creatorName: res.creator.name,
    reason: res.hardConstraintViolations[0] || 'Hard constraint compatibility mismatch.'
  }));

  const unresolvedItems: string[] = [];
  selectedResults.forEach(res => {
    if (res.rightsCompatibility === 'unknown') {
      unresolvedItems.push(`${res.creator.name}: Requires written confirmation of advertising rights.`);
    }
    if (res.missingInformation.length > 0) {
      unresolvedItems.push(`${res.creator.name}: Unverified ${res.missingInformation.join(', ')}.`);
    }
  });

  return {
    generatedAt: new Date().toISOString(),
    campaignId: brief.id,
    requestedCount,
    selectedCreators,
    excludedCreators,
    unresolvedItems,
    status: 'pending_approval'
  };
}
