# GenCraft — Production Deployment & Operations

This document outlines the deployment architecture, operational requirements, configuration, and monitoring procedures for running GenCraft in production environments.

---

## 1. Supported Deployment Targets

1. **Node.js Standalone (Recommended for full file upload persistence)**:
   - Deployable on Ubuntu/Debian LTS, AWS EC2, DigitalOcean Droplets, or GCP Compute Engine.
   - Recommended: Node.js 20 LTS with persistent filesystem storage for `public/uploads/`.
2. **Containerized (Docker)**:
   - Multi-stage Docker build utilizing Next.js standalone output.
   - Requires persistent volume mounted to `/app/public/uploads` or S3/Firebase Cloud Storage bucket.
3. **Serverless (Vercel)**:
   - Front-end and API routes deploy seamlessly on Vercel.
   - Requires external cloud storage (e.g., AWS S3 or Firebase Cloud Storage) for user media uploads, as serverless lambdas have ephemeral filesystems.

---

## 2. Production Environment Variables

Ensure the following variables are configured in your production deployment environment:

```env
# Application Host URL
NEXT_PUBLIC_APP_URL=https://gencraft.example.com

# Production MongoDB Connection (Replica Set recommended)
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@cluster.mongodb.net/gencraft-marketplace?retryWrites=true&w=majority

# Optional: Cloud AI Providers (Groq & Gemini)
GROQ_API_KEY=gsk_...
GOOGLE_GEMINI_API_KEY=AIzaSy...

# Optional: Firebase Client Integration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gencraft-marketplace.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gencraft-marketplace
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gencraft-marketplace.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

> [!CAUTION]
> Never commit real API keys, passwords, or credentials into source control. Always inject credentials via secret managers or environment variables.

---

## 3. Production Build & Start Commands

```bash
# 1. Install production dependencies
npm ci

# 2. Seed baseline catalog if database is empty
npm run seed

# 3. Create optimized production build
npm run build

# 4. Start production server
npm run start
```

---

## 4. Persistent Storage for Media Uploads

- **Local Storage**: In standard Node.js server environments, user-uploaded portfolio assets and deliverable drafts are written to `public/uploads/`.
- **Volume Mounting**: When deploying with Docker or Kubernetes, mount a persistent volume at `public/uploads/` to ensure files survive container restarts.
- **File Validation**: All uploads are strictly validated server-side for file size (15MB images, 50MB videos) and binary magic byte signatures before disk persistence.

---

## 5. Health Checks & Monitoring

GenCraft provides dedicated health and readiness probe endpoints for load balancers and orchestrators:

- **Liveness Probe**:
  ```bash
  GET /api/health
  # Returns 200 OK: {"status": "ok", "timestamp": "..."}
  ```
- **Readiness Probe**:
  ```bash
  GET /api/ready
  # Returns 200 OK: {"ready": true, "database": "connected"}
  ```

---

## 6. Operational Troubleshooting & Recovery

| Symptom | Diagnostic Step | Corrective Action |
| :--- | :--- | :--- |
| `500 Internal Error` on Matching | Verify MongoDB connection | Ensure `MONGODB_URI` is reachable. The engine automatically falls back to in-memory creators if MongoDB is temporarily unreachable. |
| AI Generation Fails | Check `GROQ_API_KEY` quota | Platform automatically falls back to Gemini 1.5, and then to the deterministic local engine (`gencraft-neural-engine`). |
| Uploads Fail (`413` or `400`) | Check reverse proxy upload limits | Ensure NGINX or reverse proxy sets `client_max_body_size 60M;`. |
| Port Binding Conflict | Check port 3000 | Use `-p <PORT>` flag (e.g., `next start -p 8080`) or adjust the `PORT` environment variable. |
