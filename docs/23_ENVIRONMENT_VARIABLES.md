# 23 — Environment Variables

## 1. Environment Variable Reference

The application requires minimal external configuration and provides resilient zero-config fallbacks for local evaluation.

| Variable Name | Required? | Default / Example Value | Description |
|---|---|---|---|
| `MONGODB_URI` | Optional | `mongodb://127.0.0.1:27017/gencraft-marketplace` | Primary MongoDB database connection string. Falls back to in-memory cache if unreachable. |
| `NEXT_PUBLIC_APP_URL` | Optional | `http://localhost:3000` | Application base URL for absolute links. |
| `GROQ_API_KEY` | Optional | `gsk_...` | Groq Cloud API key for Llama 3.3 70B inference. |
| `GOOGLE_GEMINI_API_KEY` | Optional | `AIza...` | Google Gemini API key for Gemini 1.5 Flash inference. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Optional | `AIza...` | Client Firebase API key for Auth and Cloud Firestore. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Optional | `gencraft-marketplace.firebaseapp.com` | Firebase Auth domain. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Optional | `gencraft-marketplace` | Firebase project identifier. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Optional | `gencraft-marketplace.appspot.com` | Firebase Storage bucket for media uploads. |

---

## 2. Zero-Secret Guarantee
No real secrets, API keys, or production passwords are committed to the git repository. All `.env` templates provide placeholder instructions.
