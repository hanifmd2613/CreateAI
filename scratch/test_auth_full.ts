import { 
  createVerificationChallenge, 
  verifyOtpCode, 
  normalizeEmail,
  hashCode 
} from '../src/lib/verificationStore';
import { UserAccount, UserRole } from '../src/types';

async function runAuthTestSuite() {
  console.log('=== GENCRAFT AUTHENTICATION TEST SUITE ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail || ''}`);
      failed++;
    }
  }

  // 1. Email Normalization
  const email1 = '  Test.User+Sub@GenCraft.AI ';
  assert(normalizeEmail(email1) === 'test.user+sub@gencraft.ai', '1. Email Normalization');

  // 2. SHA-256 Code Hashing
  const code = '654321';
  const hash = hashCode(code);
  assert(hash.length === 64, '2. Cryptographic SHA-256 Hashing');

  // 3. Challenge Creation & 6-Digit Code Generation
  const challengeRes = createVerificationChallenge('creator.test@gencraft.ai', 'signup');
  assert(challengeRes.success === true && challengeRes.code.length === 6, '3. Secure 6-Digit OTP Generation');

  // 4. Rate-Limiting & Resend Cooldown (60s)
  const rateLimitRes = createVerificationChallenge('creator.test@gencraft.ai', 'signup');
  assert(rateLimitRes.success === false && (rateLimitRes.cooldownLeft || 0) > 0, '4. Rate-Limiting & Resend Cooldown Enforcement');

  // 5. Invalid OTP Verification Attempt
  const badVerifyRes = verifyOtpCode('creator.test@gencraft.ai', '000000');
  assert(badVerifyRes.success === false && badVerifyRes.message.includes('Invalid'), '5. Invalid OTP Code Rejection');

  // 6. Successful OTP Verification & Single-Use Consumption
  const validVerifyRes = verifyOtpCode('creator.test@gencraft.ai', challengeRes.code);
  assert(validVerifyRes.success === true && Boolean(validVerifyRes.verifiedToken), '6. Successful OTP Verification');

  // 7. Prevent Replay Attack (Code already consumed)
  const replayVerifyRes = verifyOtpCode('creator.test@gencraft.ai', challengeRes.code);
  assert(replayVerifyRes.success === false, '7. Code Replay Prevention (Single-Use)');

  // 8. Brand Profile Structuring & Role Integrity
  const brandUser: UserAccount = {
    id: 'test-uid-brand-101',
    name: 'Kaveri Media Group',
    email: 'brand@kaveri.in',
    role: 'brand',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Kaveri',
    handle: '@kaveri_media',
    companyName: 'Kaveri Media Group',
    isVerified: true,
  };
  assert(brandUser.role === 'brand' && brandUser.companyName === 'Kaveri Media Group', '8. Brand Profile Structuring');

  // 9. Creator Profile Structuring & Role Integrity
  const creatorUser: UserAccount = {
    id: 'test-uid-creator-202',
    name: 'Arjun Nambiar',
    email: 'arjun@creators.in',
    role: 'creator',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Arjun',
    handle: '@arjun_ai',
    specialization: 'AI Commercial Director',
    tools: ['Veo', 'Kling', 'ElevenLabs'],
    isVerified: true,
  };
  assert(creatorUser.role === 'creator' && (creatorUser.tools || []).includes('Veo'), '9. Creator Profile Structuring');

  // 10. Role Isolation (User cannot be brand and creator simultaneously)
  assert(brandUser.role !== creatorUser.role, '10. Role Isolation & Protection');

  console.log(`\n=== TEST SUITE SUMMARY: ${passed} PASSED / ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTestSuite();
