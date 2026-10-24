# GenCraft AI — Firebase client connection

## 1. Install the Firebase SDK

From the project root:

```bash
npm install firebase
```

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_FIREBASE_API_KEY` from Firebase Console → Project settings → General → Your apps → Web app.

The remaining values should match the web app configuration for `createai-marketplace`. Do not commit `.env.local`.

## 3. Use the shared Firebase clients

```ts
import {
  firebaseApp,
  firebaseAuth,
  firebaseStorage,
  firestore,
} from "@/lib/firebase/client";
```

Use `firebaseAuth` for Firebase Authentication, `firebaseStorage` for Firebase Storage, and `firestore` only if the app actually uses Cloud Firestore. This module initializes Firebase once and avoids duplicate initialization during Next.js hot reloads.

## 4. Firebase Console checklist

- Authentication → Sign-in method: enable the sign-in methods the app uses.
- Authentication → Settings → Authorized domains: add localhost for local development and the exact production domain.
- Storage: enable the bucket and apply least-privilege Storage Rules before uploads.
- Firestore: create the database and apply appropriate Security Rules only if the app uses Firestore.
- Project settings: verify this web app configuration belongs to `createai-marketplace`.

## 5. Important integration notes

- Firebase web config is client-side configuration, not a server Admin credential. Never put service-account private keys in `NEXT_PUBLIC_*` variables.
- Do not duplicate creator briefs into Firestore merely to fix dashboard visibility if MongoDB is the application's canonical data store.
- For the brand-to-creator flow, verify that the server persists the brief in MongoDB and stores the same canonical creator identifier that the creator dashboard queries.
- This starter module does not claim Firebase products have been enabled in the console or that the application already uses these exports. Integrate after checking current authentication/session handling and avoiding duplicate initialization.
