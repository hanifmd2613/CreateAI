import { CampaignUsageRightsRequirement, CreatorUsageRightsTerms, RightsCompatibilityStatus } from '../types';

export interface RightsAnalysisResult {
  status: RightsCompatibilityStatus;
  diagnostic: string;
  conflicts: string[];
  suggestedResolutions: string[];
  missingTerms: string[];
  isCompatible: boolean;
}

export function evaluateUsageRights(
  requirement: CampaignUsageRightsRequirement,
  terms?: CreatorUsageRightsTerms
): RightsAnalysisResult {
  // If creator terms are not specified or empty, mark as Unknown / Needs Confirmation
  if (!terms) {
    return {
      status: 'unknown',
      diagnostic: 'Creator commercial licensing terms are unstated. Needs confirmation before commission.',
      conflicts: [],
      suggestedResolutions: ['Request formal licensing agreement confirmation from creator.'],
      missingTerms: ['Commercial use terms', 'Territory permission', 'Paid advertising terms'],
      isCompatible: false
    };
  }

  const conflicts: string[] = [];
  const suggestedResolutions: string[] = [];
  const missingTerms: string[] = [];

  // 1. Commercial Use Permission
  if (requirement.commercialUse !== 'Non-Commercial' && !terms.commercialUseAllowed) {
    conflicts.push('Commercial Use Conflict: Campaign requires commercial use, but creator terms only permit non-commercial use.');
    suggestedResolutions.push('Request creator commercial rights upgrade or adjust brief to non-commercial.');
  }

  // 2. Buyout vs License
  if (requirement.commercialUse === 'Full Buyout' && terms.licensingType !== 'Full Buyout') {
    conflicts.push(`Licensing Tier Conflict: Campaign requests Full IP Buyout, but creator offers ${terms.licensingType}.`);
    suggestedResolutions.push('Negotiate buyout surcharge or consider licensed commercial rights with term limits.');
  }

  // 3. Geographic Territory Check
  const territoryHierarchy = {
    'India Only': 1,
    'South Asia': 2,
    'Worldwide': 3
  };

  const reqLevel = territoryHierarchy[requirement.territory] || 1;
  const creatorLevel = territoryHierarchy[terms.territory] || 1;

  if (reqLevel > creatorLevel) {
    conflicts.push(`Territory Conflict: Campaign requires ${requirement.territory} distribution, but creator terms specify ${terms.territory} only.`);
    suggestedResolutions.push(`Ask creator to expand usage rights to ${requirement.territory} or restrict ad targeting to ${terms.territory}.`);
  }

  // 4. Paid Advertising Whitelisting
  if (requirement.paidAdvertisingRequired && !terms.paidAdvertisingAllowed) {
    conflicts.push('Paid Advertising Conflict: Campaign requires paid ad whitelisting, but creator terms permit organic posting only.');
    suggestedResolutions.push('Inquire whether creator permits paid whitelisting with an additional licensing stipend.');
  }

  // 5. Exclusivity
  if (requirement.exclusivityRequired && !terms.exclusivityOffered) {
    conflicts.push('Category Exclusivity Conflict: Campaign requires category exclusivity, but creator license is non-exclusive.');
    suggestedResolutions.push('Discuss a custom exclusive window agreement (e.g. 60-day brand exclusivity).');
  }

  // 6. Modification & Subtitles Rights
  if (requirement.modificationRightsRequired && !terms.modificationRightsAllowed) {
    conflicts.push('Modification Rights Conflict: Campaign needs cropping/derivative editing rights, which creator terms restrict.');
    suggestedResolutions.push('Request brand derivative edit permissions for cross-platform adaptation.');
  }

  // 7. Duration Check
  if (requirement.durationMonths > terms.defaultDurationMonths && terms.defaultDurationMonths > 0) {
    conflicts.push(`Duration Discrepancy: Campaign requires ${requirement.durationMonths} months, but creator standard terms are ${terms.defaultDurationMonths} months.`);
    suggestedResolutions.push(`Confirm license renewal or term extension fees for months ${terms.defaultDurationMonths + 1} to ${requirement.durationMonths}.`);
  }

  // 8. Missing Terms Check
  if (!terms.supportedPlatforms || terms.supportedPlatforms.length === 0) {
    missingTerms.push('Permitted Platforms list');
  }
  if (terms.thirdPartyAssetClearance === undefined) {
    missingTerms.push('Third-party font and sound asset clearance certification');
  }

  // Determine final status
  if (conflicts.length > 0) {
    return {
      status: 'conflict',
      diagnostic: `Rights Conflict Detected (${conflicts.length} issue${conflicts.length > 1 ? 's' : ''}): ${conflicts[0]}`,
      conflicts,
      suggestedResolutions,
      missingTerms,
      isCompatible: false
    };
  }

  if (missingTerms.length > 0) {
    return {
      status: 'unknown',
      diagnostic: 'Partial terms verified; minor rights elements require confirmation.',
      conflicts: [],
      suggestedResolutions: ['Clarify missing platform list and asset warranties prior to milestone agreement.'],
      missingTerms,
      isCompatible: true
    };
  }

  return {
    status: 'compatible',
    diagnostic: 'Fully Compatible: Stated creator licensing terms satisfy all campaign requirements.',
    conflicts: [],
    suggestedResolutions: [],
    missingTerms: [],
    isCompatible: true
  };
}
