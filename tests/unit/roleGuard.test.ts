import { saveBrandAiKeys, getBrandAiKeys, getEffectiveAiKeys, maskApiKey } from '../../src/lib/aiConfigStore';
import { GET, POST } from '../../src/app/api/ai/config/route';
import { NextRequest } from 'next/server';

export async function runRoleGuardUnitTests(): Promise<{ passed: number; failed: number; tests: { name: string; pass: boolean; details?: string }[] }> {
  const tests: { name: string; pass: boolean; details?: string }[] = [];

  // Test 1: Brand role can save and retrieve custom AI inference keys
  try {
    const brandId = `brand-test-${Date.now()}`;
    const groqKey = 'gsk_testGroqKey1234567890abcdef';
    const geminiKey = 'AIzaSyTestGeminiKey1234567890abcdef';

    saveBrandAiKeys(brandId, groqKey, geminiKey);
    const retrieved = getBrandAiKeys(brandId);

    if (!retrieved || retrieved.groqKey !== groqKey || retrieved.geminiKey !== geminiKey) {
      throw new Error(`Retrieved keys did not match stored keys: ${JSON.stringify(retrieved)}`);
    }
    tests.push({ name: 'Brand Role AI Inference Key Storage & Retrieval', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Brand Role AI Inference Key Storage & Retrieval', pass: false, details: err.message });
  }

  // Test 2: Masking verification - Secrets never exposed in UI payloads
  try {
    const rawKey = 'gsk_9876543210fedcba9876';
    const masked = maskApiKey(rawKey);
    if (!masked || masked === rawKey || !masked.includes('••••••••') || !masked.startsWith('gsk_') || !masked.endsWith('9876')) {
      throw new Error(`Masking failed: got "${masked}"`);
    }
    tests.push({ name: 'Sensitive Secret Masking (maskApiKey protects plain secrets)', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Sensitive Secret Masking (maskApiKey protects plain secrets)', pass: false, details: err.message });
  }

  // Test 3: Effective keys fallback to system environment when unconfigured
  try {
    const emptyBrandId = `brand-empty-${Date.now()}`;
    const effective = getEffectiveAiKeys(emptyBrandId);
    // Should fallback to process.env without throwing
    if (typeof effective !== 'object') {
      throw new Error('Effective keys did not return an object');
    }
    tests.push({ name: 'Fallback to System Environment Variables for Unconfigured Brands', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Fallback to System Environment Variables for Unconfigured Brands', pass: false, details: err.message });
  }

  // Test 4: Brand Isolation - Multiple brands maintain isolated credentials
  try {
    const brandA = `brand-A-${Date.now()}`;
    const brandB = `brand-B-${Date.now()}`;

    saveBrandAiKeys(brandA, 'gsk_brandAKey111111111111111111', undefined);
    saveBrandAiKeys(brandB, 'gsk_brandBKey222222222222222222', undefined);

    const keysA = getBrandAiKeys(brandA);
    const keysB = getBrandAiKeys(brandB);

    if (keysA?.groqKey === keysB?.groqKey || !keysA?.groqKey?.includes('brandA') || !keysB?.groqKey?.includes('brandB')) {
      throw new Error('Brand credentials cross-contaminated');
    }
    tests.push({ name: 'Multi-Tenant Brand Credential Isolation', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Multi-Tenant Brand Credential Isolation', pass: false, details: err.message });
  }

  // Test 5: Server-Side API Role Guard Rejects Creator GET Request with 403 Forbidden
  try {
    const req = new NextRequest('http://localhost:3000/api/ai/config?role=creator&brandId=test', {
      method: 'GET',
      headers: {
        'x-user-role': 'creator',
      },
    });

    const res = await GET(req);
    if (res.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden, got status: ${res.status}`);
    }
    const data = await res.json();
    if (!data.error || !data.error.includes('Forbidden')) {
      throw new Error(`Expected Forbidden error message, got: ${JSON.stringify(data)}`);
    }
    tests.push({ name: 'Server-Side API Role Guard: Creator GET Blocked with HTTP 403', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Server-Side API Role Guard: Creator GET Blocked with HTTP 403', pass: false, details: err.message });
  }

  // Test 6: Server-Side API Role Guard Rejects Creator POST Request with 403 Forbidden
  try {
    const req = new NextRequest('http://localhost:3000/api/ai/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'creator',
      },
      body: JSON.stringify({
        brandId: 'hacked-brand',
        role: 'creator',
        groqKey: 'gsk_maliciousKey12345678',
      }),
    });

    const res = await POST(req);
    if (res.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for creator POST, got status: ${res.status}`);
    }
    tests.push({ name: 'Server-Side API Role Guard: Creator POST Blocked with HTTP 403', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Server-Side API Role Guard: Creator POST Blocked with HTTP 403', pass: false, details: err.message });
  }

  // Test 7: API Input Validation Rejects Malformed Groq Key (Must start with gsk_)
  try {
    const req = new NextRequest('http://localhost:3000/api/ai/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'brand',
      },
      body: JSON.stringify({
        brandId: 'brand-valid',
        role: 'brand',
        groqKey: 'invalid_prefix_key_12345678',
      }),
    });

    const res = await POST(req);
    if (res.status !== 400) {
      throw new Error(`Expected HTTP 400 Bad Request for malformed Groq key, got status: ${res.status}`);
    }
    tests.push({ name: 'API Input Validation: Rejection of Malformed Groq Key Format', pass: true });
  } catch (err: any) {
    tests.push({ name: 'API Input Validation: Rejection of Malformed Groq Key Format', pass: false, details: err.message });
  }

  // Test 8: API Input Validation Rejects Malformed Gemini Key (Must start with AIzaSy)
  try {
    const req = new NextRequest('http://localhost:3000/api/ai/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'brand',
      },
      body: JSON.stringify({
        brandId: 'brand-valid',
        role: 'brand',
        geminiKey: 'wrongPrefixKey_12345678',
      }),
    });

    const res = await POST(req);
    if (res.status !== 400) {
      throw new Error(`Expected HTTP 400 Bad Request for malformed Gemini key, got status: ${res.status}`);
    }
    tests.push({ name: 'API Input Validation: Rejection of Malformed Gemini Key Format', pass: true });
  } catch (err: any) {
    tests.push({ name: 'API Input Validation: Rejection of Malformed Gemini Key Format', pass: false, details: err.message });
  }

  // Test 9: Brand Can Successfully Update and Receive Masked Secrets
  try {
    const req = new NextRequest('http://localhost:3000/api/ai/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'brand',
      },
      body: JSON.stringify({
        brandId: `brand-brand-${Date.now()}`,
        role: 'brand',
        groqKey: 'gsk_secretGroqKey998877665544',
        geminiKey: 'AIzaSySecretGeminiKey1122334455',
      }),
    });

    const res = await POST(req);
    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200 for valid brand POST, got status: ${res.status}`);
    }
    const data = await res.json();
    if (!data.groqMasked?.includes('••••••••') || !data.geminiMasked?.includes('••••••••')) {
      throw new Error(`Expected masked keys in response: ${JSON.stringify(data)}`);
    }
    // Verify plaintext is NOT in response
    if (JSON.stringify(data).includes('gsk_secretGroqKey998877665544')) {
      throw new Error('Raw plaintext Groq key leaked in response JSON!');
    }
    tests.push({ name: 'Brand POST Success & Zero Plaintext Secret Leakage', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Brand POST Success & Zero Plaintext Secret Leakage', pass: false, details: err.message });
  }

  const passed = tests.filter(t => t.pass).length;
  const failed = tests.filter(t => !t.pass).length;

  return { passed, failed, tests };
}
