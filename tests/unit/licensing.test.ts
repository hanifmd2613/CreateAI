import { evaluateLicensingCompatibility, extractLicensingRequirementsFromBrief } from '../../src/lib/licensing';
import { Brief, CreatorLicensingTerms, LicensingRequirements } from '../../src/types';

export function runLicensingUnitTests(): { name: string; passed: boolean; message?: string }[] {
  const results: { name: string; passed: boolean; message?: string }[] = [];

  // Subtest 1: Full Commercial Buyout Compatibility
  try {
    const briefReqs: LicensingRequirements = {
      usageType: 'commercial',
      territory: 'Worldwide',
      durationMonths: 12,
      paidAdvertisingAllowed: true,
      exclusivityRequired: true,
      derivativeWorksAllowed: true,
    };

    const creatorTerms: CreatorLicensingTerms = {
      standardLicense: 'commercial_buyout',
      territory: 'Worldwide',
      durationMonths: 24,
      paidAdvertisingAllowed: true,
      exclusivityAvailable: true,
      derivativeWorksAllowed: true,
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
      usageType: 'commercial',
      territory: 'Worldwide',
      durationMonths: 12,
      paidAdvertisingAllowed: true,
      exclusivityRequired: false,
      derivativeWorksAllowed: true,
    };

    const creatorTerms: CreatorLicensingTerms = {
      standardLicense: 'editorial_only',
      territory: 'India',
      durationMonths: 3,
      paidAdvertisingAllowed: false,
      exclusivityAvailable: false,
      derivativeWorksAllowed: false,
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
      usageType: 'commercial',
      territory: 'Worldwide',
      durationMonths: 12,
      paidAdvertisingAllowed: true,
      exclusivityRequired: true,
      derivativeWorksAllowed: true,
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
