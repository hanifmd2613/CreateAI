import { evaluateLicensingCompatibility, extractLicensingRequirementsFromBrief } from '../../src/lib/licensing';
import { Brief, CreatorLicensingTerms, LicensingRequirements } from '../../src/types';

export function runLicensingUnitTests(): { name: string; passed: boolean; message?: string }[] {
  const results: { name: string; passed: boolean; message?: string }[] = [];

  // Subtest 1: Full Commercial Buyout Compatibility
  try {
    const briefReqs: LicensingRequirements = {
      commercialScope: 'Commercial Licensed',
      territory: 'Worldwide',
      durationMonths: 12,
      channels: ['Paid Advertising', 'Organic Social', 'Digital / Web'],
      exclusivity: 'Category Exclusive',
      derivativeRights: true,
    };

    const creatorTerms: CreatorLicensingTerms = {
      permittedScope: 'Full Buyout',
      allowedTerritories: ['Worldwide'],
      maxDurationMonths: 24,
      allowedChannels: ['Paid Advertising', 'Organic Social', 'Digital / Web'],
      exclusivityAvailable: true,
      derivativeRightsAllowed: true,
    };

    const evalResult = evaluateLicensingCompatibility(briefReqs, creatorTerms);
    if (evalResult.status !== 'COMPATIBLE') {
      throw new Error(`Expected COMPATIBLE, got ${evalResult.status} (${evalResult.conflicts.join(', ')})`);
    }
    if (evalResult.conflicts.length > 0) {
      throw new Error(`Expected 0 conflicts, got: ${evalResult.conflicts.join(', ')}`);
    }
    results.push({ name: 'Commercial buyout terms correctly evaluate as COMPATIBLE', passed: true });
  } catch (err: any) {
    results.push({ name: 'Commercial buyout terms correctly evaluate as COMPATIBLE', passed: false, message: err.message });
  }

  // Subtest 2: Territory and Advertising Mismatch Detection
  try {
    const briefReqs: LicensingRequirements = {
      commercialScope: 'Commercial Licensed',
      territory: 'Worldwide',
      durationMonths: 12,
      channels: ['Paid Advertising'],
      exclusivity: 'Non-Exclusive',
      derivativeRights: true,
    };

    const creatorTerms: CreatorLicensingTerms = {
      permittedScope: 'Editorial Only',
      allowedTerritories: ['Domestic (India)'],
      maxDurationMonths: 3,
      allowedChannels: ['Organic Social'],
      exclusivityAvailable: false,
      derivativeRightsAllowed: false,
    };

    const evalResult = evaluateLicensingCompatibility(briefReqs, creatorTerms);
    if (evalResult.status !== 'MISMATCH') {
      throw new Error(`Expected MISMATCH, got ${evalResult.status}`);
    }
    if (evalResult.conflicts.length < 2) {
      throw new Error(`Expected multiple conflicts, got: ${evalResult.conflicts.join(', ')}`);
    }
    results.push({ name: 'Territory and advertising restrictions trigger hard MISMATCH with specific conflict details', passed: true });
  } catch (err: any) {
    results.push({ name: 'Territory and advertising restrictions trigger hard MISMATCH with specific conflict details', passed: false, message: err.message });
  }

  // Subtest 3: Missing Licensing Data mapped to UNKNOWN / NEEDS_REVIEW
  try {
    const briefReqs: LicensingRequirements = {
      commercialScope: 'Commercial Licensed',
      territory: 'Worldwide',
      durationMonths: 12,
      channels: ['Paid Advertising'],
      exclusivity: 'Category Exclusive',
      derivativeRights: true,
    };

    // Creator has undefined licensing terms
    const evalResult = evaluateLicensingCompatibility(briefReqs, undefined);
    if (evalResult.status !== 'UNKNOWN') {
      throw new Error(`Expected UNKNOWN for missing terms, got ${evalResult.status}`);
    }
    results.push({ name: 'Missing creator rights are mapped to UNKNOWN and never treated as COMPATIBLE', passed: true });
  } catch (err: any) {
    results.push({ name: 'Missing creator rights are mapped to UNKNOWN and never treated as COMPATIBLE', passed: false, message: err.message });
  }

  return results;
}

if (process.argv[1]?.includes('licensing.test.ts')) {
  const res = runLicensingUnitTests();
  console.table(res);
}
