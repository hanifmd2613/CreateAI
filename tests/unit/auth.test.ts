import { registerUser, loginUser, hashPassword, generateSalt, isValidEmailFormat, validatePasswordPolicy } from '../../src/lib/userStore';

export async function runAuthUnitTests(): Promise<{ passed: number; failed: number; tests: { name: string; pass: boolean; details?: string }[] }> {
  const tests: { name: string; pass: boolean; details?: string }[] = [];

  // Test 1: Email Format Validation
  try {
    if (!isValidEmailFormat('director@gencraft.ai') || !isValidEmailFormat('brand.lead+qa@agency.co.in')) {
      throw new Error('Valid emails rejected');
    }
    if (isValidEmailFormat('not-an-email') || isValidEmailFormat('missing@domain') || isValidEmailFormat('@domain.com')) {
      throw new Error('Invalid email accepted');
    }
    tests.push({ name: 'RFC Email Format Syntax Validation', pass: true });
  } catch (err: any) {
    tests.push({ name: 'RFC Email Format Syntax Validation', pass: false, details: err.message });
  }

  // Test 2: Password Strength Policy Enforcement
  try {
    const weak = validatePasswordPolicy('12345');
    if (weak.valid) throw new Error('Short password (< 6 chars) was accepted');
    const good = validatePasswordPolicy('GenCraft@2026');
    if (!good.valid) throw new Error('Valid password was rejected');
    tests.push({ name: 'Password Strength & Minimum Length Policy', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Password Strength & Minimum Length Policy', pass: false, details: err.message });
  }

  // Test 3: Password Confirmation Mismatch Rejection
  try {
    const res = await registerUser({
      name: 'Test Candidate',
      email: `mismatch.${Date.now()}@gencraft.ai`,
      password: 'StrongPassword123!',
      confirmPassword: 'DifferentPassword456!',
      role: 'creator',
    });
    if (res.success) {
      throw new Error('Registration succeeded despite password confirmation mismatch');
    }
    tests.push({ name: 'Password Confirmation Mismatch Rejection', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Password Confirmation Mismatch Rejection', pass: false, details: err.message });
  }

  // Test 4: Successful Email-Based Creator Registration
  const testEmail = `creator.${Date.now()}@gencraft.ai`;
  try {
    const res = await registerUser({
      name: 'Aditi Varma',
      email: testEmail,
      password: 'SafePassword2026',
      confirmPassword: 'SafePassword2026',
      role: 'creator',
      specialization: 'Neural Style Transfer & LoRA Training',
      location: 'Hyderabad, Telangana',
      tools: ['Flux.1', 'Kling'],
      hourlyRate: 11000,
    });

    if (!res.success || !res.user || !res.token) {
      throw new Error(res.error || 'Registration failed');
    }
    if (res.user.role !== 'creator' || res.user.email !== testEmail) {
      throw new Error('User properties corrupted during registration');
    }
    tests.push({ name: 'Email-Based Registration & Profile Creation', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Email-Based Registration & Profile Creation', pass: false, details: err.message });
  }

  // Test 5: Duplicate Account Rejection
  try {
    const dupRes = await registerUser({
      name: 'Aditi Varma Duplicate',
      email: testEmail,
      password: 'SafePassword2026',
      confirmPassword: 'SafePassword2026',
      role: 'creator',
    });
    if (dupRes.success) {
      throw new Error('Duplicate registration should have been blocked');
    }
    tests.push({ name: 'Duplicate Account Registration Prevention', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Duplicate Account Registration Prevention', pass: false, details: err.message });
  }

  // Test 6: Successful Email Login with Correct Credentials
  try {
    const loginRes = await loginUser(testEmail, 'SafePassword2026');
    if (!loginRes.success || !loginRes.user || !loginRes.token) {
      throw new Error(loginRes.error || 'Valid login failed');
    }
    if (loginRes.user.name !== 'Aditi Varma') {
      throw new Error(`Expected user Aditi Varma, got ${loginRes.user.name}`);
    }
    tests.push({ name: 'Email Login Authentication with Password Verification', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Email Login Authentication with Password Verification', pass: false, details: err.message });
  }

  // Test 7: Rejection of Incorrect Password
  try {
    const badLogin = await loginUser(testEmail, 'WrongPassword123');
    if (badLogin.success) {
      throw new Error('Login succeeded with wrong password');
    }
    tests.push({ name: 'Rejection of Invalid Credentials', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Rejection of Invalid Credentials', pass: false, details: err.message });
  }

  // Test 8: Rejection of Non-Existent User
  try {
    const noUser = await loginUser('nonexistent.ghost.account@gencraft.ai', 'AnyPassword123');
    if (noUser.success) {
      throw new Error('Login succeeded for non-existent account');
    }
    tests.push({ name: 'Rejection of Non-Existent Account', pass: true });
  } catch (err: any) {
    tests.push({ name: 'Rejection of Non-Existent Account', pass: false, details: err.message });
  }

  const passed = tests.filter(t => t.pass).length;
  const failed = tests.filter(t => !t.pass).length;

  return { passed, failed, tests };
}
