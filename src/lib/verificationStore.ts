import crypto from 'crypto';

export interface VerificationChallenge {
  email: string;
  codeHash: string;
  expiresAt: number;
  attemptsLeft: number;
  lastSentAt: number;
  purpose: 'signup' | 'login' | 'reset';
  verifiedAt?: number;
}

// In-memory server-side challenge store (keyed by normalized email)
const challengeMap = new Map<string, VerificationChallenge>();

/**
 * Normalizes email address (lowercase and trimmed)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Computes SHA-256 hash of a verification code
 */
export function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
}

/**
 * Generates a cryptographically secure 6-digit verification OTP code
 */
export function generateOtpCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Creates and stores a new verification challenge for an email
 */
export function createVerificationChallenge(
  email: string,
  purpose: 'signup' | 'login' | 'reset' = 'signup'
): { success: boolean; code: string; message?: string; cooldownLeft?: number } {
  const normEmail = normalizeEmail(email);
  const now = Date.now();

  const existing = challengeMap.get(normEmail);
  if (existing) {
    const elapsedSeconds = Math.floor((now - existing.lastSentAt) / 1000);
    if (elapsedSeconds < 60) {
      const cooldownLeft = 60 - elapsedSeconds;
      return {
        success: false,
        code: '',
        message: `Please wait ${cooldownLeft} seconds before requesting a new verification code.`,
        cooldownLeft,
      };
    }
  }

  const code = generateOtpCode();
  const codeHash = hashCode(code);
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes expiry

  challengeMap.set(normEmail, {
    email: normEmail,
    codeHash,
    expiresAt,
    attemptsLeft: 5,
    lastSentAt: now,
    purpose,
  });

  return { success: true, code };
}

/**
 * Verifies a submitted OTP code against stored challenge
 */
export function verifyOtpCode(
  email: string,
  code: string
): { success: boolean; message: string; verifiedToken?: string } {
  const normEmail = normalizeEmail(email);
  const challenge = challengeMap.get(normEmail);

  if (!challenge) {
    return { success: false, message: 'No verification challenge found for this email. Please request a new code.' };
  }

  if (Date.now() > challenge.expiresAt) {
    challengeMap.delete(normEmail);
    return { success: false, message: 'Verification code has expired. Please request a new code.' };
  }

  if (challenge.attemptsLeft <= 0) {
    challengeMap.delete(normEmail);
    return { success: false, message: 'Maximum verification attempts exceeded. Please request a new code.' };
  }

  const inputHash = hashCode(code);
  if (inputHash !== challenge.codeHash) {
    challenge.attemptsLeft -= 1;
    if (challenge.attemptsLeft <= 0) {
      challengeMap.delete(normEmail);
      return { success: false, message: 'Invalid verification code. Maximum attempts reached, challenge reset.' };
    }
    return { success: false, message: `Invalid verification code. ${challenge.attemptsLeft} attempts remaining.` };
  }

  // Atomic consumption of challenge upon successful verification
  challenge.verifiedAt = Date.now();
  const verificationToken = crypto.randomBytes(24).toString('hex');
  challengeMap.delete(normEmail);

  return {
    success: true,
    message: 'Email verified successfully!',
    verifiedToken,
  };
}
