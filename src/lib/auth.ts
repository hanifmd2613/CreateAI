import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserAccount, UserRole, Creator } from '../types';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export interface AuthState {
  firebaseUser: FirebaseUser | null;
  userAccount: UserAccount | null;
  loading: boolean;
  error: string | null;
}

/**
 * Normalizes email address
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Sign in using Firebase Google Auth Provider
 */
export async function signInWithGoogle(): Promise<{ user: FirebaseUser | null; error: string | null }> {
  if (!auth) {
    return { user: null, error: 'Firebase Authentication is not initialized.' };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (err: any) {
    console.warn('Google sign-in popup error:', err);
    let errorMsg = 'Failed to sign in with Google.';
    if (err.code === 'auth/popup-closed-by-user') {
      errorMsg = 'Google sign-in window was closed before completion.';
    } else if (err.code === 'auth/popup-blocked') {
      errorMsg = 'Google sign-in popup was blocked by your browser settings.';
    } else if (err.message) {
      errorMsg = err.message;
    }
    return { user: null, error: errorMsg };
  }
}

/**
 * Create a new user with Email and Password
 */
export async function signUpWithEmail(email: string, password: string): Promise<{ user: FirebaseUser | null; error: string | null }> {
  if (!auth) {
    return { user: null, error: 'Firebase Authentication is not initialized.' };
  }

  try {
    const normEmail = normalizeEmail(email);
    const result = await createUserWithEmailAndPassword(auth, normEmail, password);
    return { user: result.user, error: null };
  } catch (err: any) {
    console.warn('Email signup error:', err);
    let errorMsg = 'Failed to create account.';
    if (err.code === 'auth/email-already-in-use') {
      errorMsg = 'An account with this email address already exists.';
    } else if (err.code === 'auth/weak-password') {
      errorMsg = 'Password should be at least 6 characters long.';
    } else if (err.code === 'auth/invalid-email') {
      errorMsg = 'The provided email address is invalid.';
    } else if (err.message) {
      errorMsg = err.message;
    }
    return { user: null, error: errorMsg };
  }
}

/**
 * Sign in existing user with Email and Password
 */
export async function signInWithEmail(email: string, password: string): Promise<{ user: FirebaseUser | null; error: string | null }> {
  if (!auth) {
    return { user: null, error: 'Firebase Authentication is not initialized.' };
  }

  try {
    const normEmail = normalizeEmail(email);
    const result = await signInWithEmailAndPassword(auth, normEmail, password);
    return { user: result.user, error: null };
  } catch (err: any) {
    console.warn('Email signin error:', err);
    let errorMsg = 'Failed to sign in.';
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      errorMsg = 'Invalid email or password. Please check your credentials.';
    } else if (err.code === 'auth/user-disabled') {
      errorMsg = 'This account has been disabled.';
    } else if (err.message) {
      errorMsg = err.message;
    }
    return { user: null, error: errorMsg };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  if (!auth) {
    return { success: false, message: 'Firebase Authentication is not initialized.' };
  }

  try {
    const normEmail = normalizeEmail(email);
    await sendPasswordResetEmail(auth, normEmail);
    return { 
      success: true, 
      message: 'If an account exists for this email address, password reset instructions have been sent.' 
    };
  } catch (err: any) {
    console.warn('Password reset error:', err);
    return { 
      success: true, 
      message: 'If an account exists for this email address, password reset instructions have been sent.' 
    };
  }
}

/**
 * Sign out current authenticated user
 */
export async function signOutAuthUser(): Promise<void> {
  if (auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Error during signOut:', err);
    }
  }
}

/**
 * Fetch authoritative user profile from Firestore `users/{uid}`
 */
export async function fetchUserProfile(uid: string): Promise<UserAccount | null> {
  if (!db) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserAccount;
    }
  } catch (err) {
    console.warn(`Firestore read warning for users/${uid}:`, err);
  }
  return null;
}

/**
 * Save user profile to Firestore `users/{uid}` and role-specific collections
 */
export async function saveUserProfileToFirestore(
  userAccount: UserAccount, 
  creatorProfile?: Creator
): Promise<boolean> {
  if (!db) return false;

  try {
    const uid = userAccount.id;
    // 1. Save Authoritative User Account to users/{uid}
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...userAccount,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // 2. Save Role-Specific Profile
    if (userAccount.role === 'brand') {
      const brandRef = doc(db, 'brandProfiles', uid);
      await setDoc(brandRef, {
        uid,
        companyName: userAccount.companyName || 'Brand Partner',
        contactName: userAccount.name,
        email: userAccount.email,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } else if (userAccount.role === 'creator' && creatorProfile) {
      const creatorRef = doc(db, 'creatorProfiles', uid);
      await setDoc(creatorRef, {
        ...creatorProfile,
        uid,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // Also ensure creator is saved to main creators collection
      const publicCreatorRef = doc(db, 'creators', creatorProfile.id);
      await setDoc(publicCreatorRef, {
        ...creatorProfile,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }

    return true;
  } catch (err) {
    console.warn('Firestore write warning:', err);
    return false;
  }
}

/**
 * Real-time Firebase auth state listener
 */
export function subscribeToAuthState(callback: (firebaseUser: FirebaseUser | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
