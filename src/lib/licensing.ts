import { Brief, Creator, LicensingEvaluationResult, LicensingStatus, LicensingConflictDetail, LicensingRequirements, CreatorLicensingTerms } from '../types';

export function getEffectiveBriefLicensing(brief: Brief | any): LicensingRequirements {
  if (!brief) {
    return {
      commercialScope: 'Commercial Licensed',
      territory: 'Worldwide',
      durationMonths: 12,
      channels: ['Paid Advertising', 'Organic Social', 'Digital / Web'],
      exclusivity: 'Non-Exclusive',
      derivativeRights: true,
    };
  }

  if (brief.licensingRequirements) {
    return brief.licensingRequirements;
  }

  // Support direct LicensingRequirements object or Brief
  const scope = brief.commercialScope || (brief.usageType === 'commercial' ? (brief.commercialUse === 'Full Buyout' ? 'Full Buyout' : 'Commercial Licensed') : 'Commercial Licensed');
  const territory = brief.territory || 'Worldwide';
  const duration = brief.durationMonths || 12;
  const channels = brief.channels || (brief.paidAdvertisingAllowed ? ['Paid Advertising', 'Organic Social', 'Digital / Web'] : ['Organic Social', 'Digital / Web']);
  const exclusivity = brief.exclusivity || (brief.exclusivityRequired ? 'Exclusive' : 'Non-Exclusive');
  const derivativeRights = brief.derivativeRights ?? brief.derivativeWorksAllowed ?? true;

  return {
    commercialScope: scope,
    territory,
    durationMonths: duration,
    channels,
    exclusivity,
    derivativeRights,
  };
}

export const extractLicensingRequirementsFromBrief = getEffectiveBriefLicensing;

export function getEffectiveCreatorLicensing(creator: Creator | any): CreatorLicensingTerms | null {
  if (!creator) {
    return null;
  }

  if (creator.licensingTerms) {
    return creator.licensingTerms;
  }

  // Support direct CreatorLicensingTerms object
  if (creator.permittedScope || creator.standardLicense) {
    let scope: 'Full Buyout' | 'Commercial Licensed' | 'Editorial Only' = 'Commercial Licensed';
    if (creator.permittedScope && creator.permittedScope !== 'Non-Commercial') {
      scope = creator.permittedScope;
    } else if (creator.standardLicense === 'commercial_buyout') {
      scope = 'Full Buyout';
    } else if (creator.standardLicense === 'editorial_only') {
      scope = 'Editorial Only';
    }

    const terr = creator.allowedTerritories || (creator.territory ? [creator.territory] : ['Worldwide']);
    const dur = creator.maxDurationMonths ?? creator.durationMonths ?? 12;
    const ch = creator.allowedChannels || (creator.paidAdvertisingAllowed ? ['Paid Advertising', 'Organic Social', 'Digital / Web'] : ['Organic Social']);

    return {
      permittedScope: scope,
      allowedTerritories: terr,
      maxDurationMonths: dur,
      allowedChannels: ch,
      exclusivityAvailable: creator.exclusivityAvailable ?? false,
      derivativeRightsAllowed: creator.derivativeRightsAllowed ?? true,
    };
  }

  // If creator has verified details or legacy commercial use string
  if (creator.verification?.commercialRightsGuaranteed || creator.commercialUse === 'Full Buyout') {
    return {
      permittedScope: 'Full Buyout',
      allowedTerritories: ['Worldwide', 'Domestic (India)'],
      maxDurationMonths: 24,
      allowedChannels: ['Organic Social', 'Paid Advertising', 'Digital / Web', 'Broadcast / TV', 'All Media'],
      exclusivityAvailable: true,
      derivativeRightsAllowed: true,
    };
  }

  // If commercial use is declared as limited or undefined
  if (creator.commercialUse && creator.commercialUse.toLowerCase().includes('india only')) {
    return {
      permittedScope: 'Commercial Licensed',
      allowedTerritories: ['Domestic (India)'],
      maxDurationMonths: 3,
      allowedChannels: ['Organic Social'],
      exclusivityAvailable: false,
      derivativeRightsAllowed: false,
    };
  }

  return null;
}

export function evaluateLicensingCompatibility(brief: Brief | any, creator: Creator | any): LicensingEvaluationResult {
  const req = getEffectiveBriefLicensing(brief);
  const terms = getEffectiveCreatorLicensing(creator);

  // If creator has no recorded licensing terms or profile is incomplete
  if (!terms) {
    return {
      status: 'UNKNOWN',
      compatible: false,
      conflicts: ['Creator commercial rights profile is unverified or incomplete.'],
      details: [
        {
          parameter: 'Commercial Profile',
          requested: req.commercialScope,
          permitted: 'Undeclared',
          compatible: false,
          explanation: 'Creator has not yet registered binding commercial use, territory, or media allowances on the platform.'
        }
      ],
      summary: 'Licensing status is UNKNOWN. Verification required before finalizing commercial terms.',
      humanReviewRequired: true,
      actionRequired: 'Request explicit licensing declaration from creator prior to contract signing.'
    };
  }

  const conflicts: string[] = [];
  const details: LicensingConflictDetail[] = [];

  // 1. Commercial Scope
  const scopeOrder = { 'Editorial Only': 1, 'Commercial Licensed': 2, 'Full Buyout': 3 };
  const reqScopeRank = scopeOrder[req.commercialScope] || 2;
  const permittedScopeRank = scopeOrder[terms.permittedScope] || 1;

  if (permittedScopeRank < reqScopeRank) {
    conflicts.push(`Scope mismatch: Brand requires "${req.commercialScope}", but creator only offers "${terms.permittedScope}".`);
    details.push({
      parameter: 'Commercial Scope',
      requested: req.commercialScope,
      permitted: terms.permittedScope,
      compatible: false,
      explanation: `Requested rights (${req.commercialScope}) exceed permitted allowance (${terms.permittedScope}).`
    });
  } else {
    details.push({
      parameter: 'Commercial Scope',
      requested: req.commercialScope,
      permitted: terms.permittedScope,
      compatible: true,
      explanation: `Creator provides ${terms.permittedScope}.`
    });
  }

  // 2. Territory
  if (req.territory === 'Worldwide' && !terms.allowedTerritories.includes('Worldwide')) {
    conflicts.push(`Territory conflict: Brand requires "Worldwide", but creator permits: ${terms.allowedTerritories.join(', ')}.`);
    details.push({
      parameter: 'Territory',
      requested: 'Worldwide',
      permitted: terms.allowedTerritories.join(', '),
      compatible: false,
      explanation: `Campaign requires global dissemination, but creator permissions are restricted to ${terms.allowedTerritories.join(', ')}.`
    });
  } else {
    details.push({
      parameter: 'Territory',
      requested: req.territory,
      permitted: terms.allowedTerritories.join(', '),
      compatible: true,
      explanation: `Territory is covered by creator permissions.`
    });
  }

  // 3. Duration
  if (req.durationMonths > terms.maxDurationMonths) {
    conflicts.push(`Duration conflict: Brand requires ${req.durationMonths} months, but creator limit is ${terms.maxDurationMonths} months.`);
    details.push({
      parameter: 'Usage Duration',
      requested: `${req.durationMonths} Months`,
      permitted: `${terms.maxDurationMonths} Months Max`,
      compatible: false,
      explanation: `Requested campaign duration (${req.durationMonths}mo) exceeds creator's max usage window (${terms.maxDurationMonths}mo).`
    });
  } else {
    details.push({
      parameter: 'Usage Duration',
      requested: `${req.durationMonths} Months`,
      permitted: `${terms.maxDurationMonths} Months Max`,
      compatible: true,
      explanation: `Duration of ${req.durationMonths} months is within acceptable window.`
    });
  }

  // 4. Media Channels (e.g. Paid Advertising)
  const missingChannels = req.channels.filter(ch => 
    !terms.allowedChannels.includes(ch) && !terms.allowedChannels.includes('All Media')
  );

  if (missingChannels.length > 0) {
    conflicts.push(`Restricted media channels: Brand requests ${missingChannels.join(', ')} which are not cleared by creator.`);
    details.push({
      parameter: 'Media Channels',
      requested: req.channels.join(', '),
      permitted: terms.allowedChannels.join(', '),
      compatible: false,
      explanation: `Creator permits: ${terms.allowedChannels.join(', ')}. Missing: ${missingChannels.join(', ')}.`
    });
  } else {
    details.push({
      parameter: 'Media Channels',
      requested: req.channels.join(', '),
      permitted: terms.allowedChannels.join(', '),
      compatible: true,
      explanation: `All requested distribution channels are cleared.`
    });
  }

  // 5. Exclusivity
  if (req.exclusivity !== 'Non-Exclusive' && !terms.exclusivityAvailable) {
    conflicts.push(`Exclusivity conflict: Brand requires ${req.exclusivity}, but creator does not grant exclusive category rights.`);
    details.push({
      parameter: 'Exclusivity',
      requested: req.exclusivity,
      permitted: 'Non-Exclusive Only',
      compatible: false,
      explanation: 'Creator does not offer commercial category lockouts.'
    });
  }

  // 6. Derivative / Editing Rights
  if (req.derivativeRights && !terms.derivativeRightsAllowed) {
    conflicts.push('Derivative rights conflict: Brand requires editing / resizing / derivative rights, which are prohibited by creator.');
    details.push({
      parameter: 'Derivative Rights',
      requested: 'Allowed',
      permitted: 'Prohibited',
      compatible: false,
      explanation: 'Creator restricts modifications to final generative output.'
    });
  }

  // Evaluate final status
  if (conflicts.length > 0) {
    return {
      status: 'MISMATCH',
      compatible: false,
      conflicts,
      details,
      summary: `Licensing MISMATCH detected across ${conflicts.length} parameter(s). Contract confirmation blocked until resolved.`,
      humanReviewRequired: false,
      actionRequired: 'Adjust brief terms or request specialized commercial rider from creator.'
    };
  }

  return {
    status: 'COMPATIBLE',
    compatible: true,
    conflicts: [],
    details,
    summary: 'All requested commercial licensing terms are 100% COMPATIBLE with creator declarations.',
    humanReviewRequired: false,
  };
}
