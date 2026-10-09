# GenCraft — Production Authentication & Setup Guide

## 1. Firebase Console Setup

To configure Firebase Authentication for production or staging environments:

1. Open the [Firebase Console](https://console.firebase.google.com/) and select your project (`gencraft-marketplace` or your target project ID).
2. Go to **Authentication** → **Get Started**.
3. Under **Sign-in method**:
   - **Google Provider**: Click **Google** → Toggle **Enable** → Set Support Email → Click **Save**.
   - **Email/Password Provider**: Click **Email/Password** → Toggle **Enable** (keep Email link disabled if using custom codes) → Click **Save**.
4. Under **Settings** → **Authorized domains**:
   - Add your production domain (e.g. `gencraft-marketplace.vercel.app`) and `localhost`.

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env.local` or configure your hosting provider environment:

```env
# ==============================================================================
# FIREBASE CLIENT CONFIGURATION
# ==============================================================================
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gencraft-marketplace.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gencraft-marketplace
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gencraft-marketplace.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# ==============================================================================
# SERVER-SIDE EMAIL VERIFICATION PROVIDER (RESEND / SMTP)
# ==============================================================================
RESEND_API_KEY=re_123456789_your_resend_api_key
VERIFICATION_FROM_EMAIL=GenCraft Verification <no-reply@gencraft.ai>

# ==============================================================================
# APPLICATION URL & DATABASE
# ==============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/gencraft-marketplace
```

---

## 3. Server-Side Email Verification System Architecture

GenCraft uses a secure server-side challenge flow for 6-digit OTP verification:

- **Endpoint**: `POST /api/auth/send-verification-code`
  - Normalizes email address.
  - Generates 6-digit cryptographically secure code (`crypto.randomInt`).
  - Hashes code with SHA-256 before storing in server challenge memory.
  - Enforces 60-second resend cooldown per email.
  - Sends email via Resend API if `RESEND_API_KEY` is present.
- **Endpoint**: `POST /api/auth/verify-code`
  - Validates submitted 6-digit code against SHA-256 hash.
  - Enforces 10-minute expiration window.
  - Enforces max 5 failed attempts per challenge.
  - Atomically invalidates code upon successful verification.

---

## 4. Firestore Security Rules Deployment

Deploy the strict production security rules located in [`firestore.rules`](firestore.rules):

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function isOwner(userId) { return isAuthenticated() && request.auth.uid == userId; }

    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create, update: if isOwner(userId);
    }
    match /creators/{creatorId} {
      allow read: if true;
      allow create: if isAuthenticated() && request.resource.data.id == creatorId;
      allow update: if isOwner(creatorId);
    }
    match /briefs/{briefId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && resource.data.brandId == request.auth.uid;
    }
  }
}
```

---

## 5. Local Development & Testing Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run TypeScript Verification**:
   ```bash
   npx tsc --noEmit
   ```
3. **Execute Automated Auth Verification Tests**:
   ```bash
   npx tsx scratch/test_auth_full.ts
   ```
4. **Start Development Server**:
   ```bash
   npm run dev
   ```
5. **Production Build Check**:
   ```bash
   npm run build
   ```

---

## 6. Troubleshooting Steps

- **Google Sign-In Popup Blocked**: Check browser popup blocker settings. GenCraft automatically catches `auth/popup-blocked` and displays a helpful user alert.
- **Verification Code Not Arriving**: Check if `RESEND_API_KEY` is set in environment. In local dev mode without an API key, the verification code is safely logged to server console output (`[AUTH] Verification code generated for...`) and exposed via `devCode` for zero-friction testing.
- **Firestore Permission Denied**: Verify user is logged in and their Firebase UID matches `users/{uid}`.
