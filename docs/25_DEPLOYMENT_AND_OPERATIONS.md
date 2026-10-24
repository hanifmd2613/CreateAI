# 25 — Deployment and Operations

## 1. Local Development
```bash
# 1. Install dependencies
npm install

# 2. Seed database
npm run seed

# 3. Start development server
npm run dev

# 4. Run automated test suite
npm test
```

---

## 2. Production Build & Deployment
The application is optimized for Vercel, Node.js server environments, or Docker containers:
```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

### Operational Health Checks
- `GET /api/creators`: Validates database connectivity and creator directory loading.
- `GET /api/briefs`: Verifies campaign brief retrieval.
- `POST /api/matching`: Health check for mathematical scoring engine.
