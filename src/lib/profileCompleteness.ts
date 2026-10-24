import { Creator } from '../types';

export interface CompletenessReport {
  score: number;
  suggestions: string[];
  missingSections: string[];
  sections: {
    basicInfo: boolean;
    bioAndHeadline: boolean;
    specializationAndLanguages: boolean;
    toolsAndSkills: boolean;
    commercialPreferences: boolean;
    portfolioItems: boolean;
  };
}

/**
 * Calculates creator profile completeness from actual saved creator data.
 * Pure, deterministic calculation based on stored fields.
 */
export function calculateProfileCompleteness(creator: Partial<Creator>): CompletenessReport {
  let score = 0;
  const suggestions: string[] = [];
  const missingSections: string[] = [];

  // 1. Basic Info (15%)
  const hasBasicInfo = Boolean(
    creator.name && creator.name.trim().length > 0 &&
    creator.handle && creator.handle.trim().length > 0 &&
    creator.avatar && creator.avatar.trim().length > 0
  );
  if (hasBasicInfo) {
    score += 15;
  } else {
    missingSections.push('Basic Information');
    suggestions.push('Upload a profile avatar and configure your professional display handle.');
  }

  // 2. Headline & Bio (20%)
  const bio = creator.bio || '';
  const headline = creator.headline || '';
  const hasGoodBio = bio.trim().length >= 40 || headline.trim().length >= 10;
  if (hasGoodBio) {
    score += 20;
  } else {
    missingSections.push('Headline & Biography');
    suggestions.push('Add a professional headline and detailed biography describing your AI directing background.');
  }

  // 3. Specialization & Languages (15%)
  const hasSpecialization = Boolean(creator.specialization && creator.specialization.trim().length > 0);
  const hasLanguages = Array.isArray(creator.languages) && creator.languages.length > 0;
  if (hasSpecialization && hasLanguages) {
    score += 15;
  } else if (hasSpecialization || hasLanguages) {
    score += 8;
    if (!hasLanguages) {
      suggestions.push('Specify your supported regional or international spoken languages.');
    }
  } else {
    missingSections.push('Specializations & Languages');
    suggestions.push('Add your primary AI content specialization and supported languages.');
  }

  // 4. Tools & Skills (15%)
  const toolsCount = Array.isArray(creator.tools) ? creator.tools.length : 0;
  const skillsCount = Array.isArray(creator.skills) ? creator.skills.length : 0;
  if (toolsCount >= 2 && skillsCount >= 2) {
    score += 15;
  } else if (toolsCount >= 1 || skillsCount >= 1) {
    score += 8;
    suggestions.push('Add at least 3 AI generation tools (e.g. Veo, Kling, Midjourney) and technical skills.');
  } else {
    missingSections.push('Tools & Technical Skills');
    suggestions.push('List the AI tools and software you use in production.');
  }

  // 5. Commercial Preferences & Turnaround (15%)
  const hasRates = Boolean(
    typeof creator.hourlyRate === 'number' && creator.hourlyRate > 0 ||
    typeof creator.projectRate === 'number' && creator.projectRate > 0
  );
  const hasTurnaround = Boolean(creator.avgTurnaround && creator.avgTurnaround.trim().length > 0);
  if (hasRates && hasTurnaround) {
    score += 15;
  } else if (hasRates || hasTurnaround) {
    score += 8;
    if (!hasRates) suggestions.push('Set your standard hourly or milestone project rate in ₹ INR.');
  } else {
    missingSections.push('Commercial Pricing & Turnaround');
    suggestions.push('Specify your turnaround time and pricing model so brands can send direct offers.');
  }

  // 6. Portfolio Projects (20%)
  const portfolioCount = Array.isArray(creator.portfolio) ? creator.portfolio.length : 0;
  if (portfolioCount >= 2) {
    score += 20;
  } else if (portfolioCount === 1) {
    score += 12;
    suggestions.push('Add a second portfolio project to showcase diverse aspect ratios and styles.');
  } else {
    missingSections.push('Portfolio Projects');
    suggestions.push('Add your first portfolio project with media preview, aspect ratio, and AI tool attribution.');
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    suggestions,
    missingSections,
    sections: {
      basicInfo: hasBasicInfo,
      bioAndHeadline: hasGoodBio,
      specializationAndLanguages: hasSpecialization && hasLanguages,
      toolsAndSkills: toolsCount >= 2 && skillsCount >= 2,
      commercialPreferences: hasRates && hasTurnaround,
      portfolioItems: portfolioCount >= 1,
    }
  };
}
