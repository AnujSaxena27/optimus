# Setup Guide - Inference Optimizer API

## ✅ Simplified Setup (No Docker, Cloud Supabase Only)

This project uses **Supabase Cloud** (hosted) for authentication and database. **No local setup required.**

---

## 🚀 Quick Start (5 minutes)

### **1. Get Your Credentials**

#### Groq API Key
1. Go to https://console.groq.com/keys
2. Create API key (free tier available)
3. Copy the key

#### Supabase Cloud
1. Go to https://supabase.com/dashboard
2. Create new project or use existing
3. Go to **Settings > API**
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **2. Configure Environment**

```bash
# Copy template to .env.local
cp .env.example .env.local

# Edit with your credentials
# - GROQ_API_KEY (from console.groq.com)
# - NEXT_PUBLIC_SUPABASE_URL (from supabase.com)
# - NEXT_PUBLIC_SUPABASE_ANON_KEY (from supabase.com)
```

**Example .env.local:**
```env
GROQ_API_KEY=gsk_your_actual_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...actual_key_here
NODE_ENV=development
LOG_LEVEL=INFO
PORT=3000
```

### **3. Install Dependencies**

```bash
npm install
```

### **4. Create Supabase Database Table**

Run this SQL in Supabase **SQL Editor**:

```sql
-- Create request logs table for analytics
CREATE TABLE IF NOT EXISTS request_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  request_id TEXT UNIQUE NOT NULL,
  model TEXT NOT NULL,
  message_length INT,
  response_tokens INT,
  cost DECIMAL(10, 6),
  latency_ms INT,
  status TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_request_logs_user_id ON request_logs(user_id);
CREATE INDEX idx_request_logs_created_at ON request_logs(created_at DESC);
```

### **5. Start Development Server**

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## ✨ Key Features

| Feature | Implementation | Status |
|---------|-----------------|--------|
| **Caching** | In-memory LRU with 1-hour TTL | ✅ Ready |
| **Batching** | Dynamic request accumulation (5 requests/100ms) | ✅ Ready |
| **Rate Limiting** | 100 requests/minute per user | ✅ Ready |
| **Authentication** | Supabase JWT (cloud-based) | ✅ Ready |
| **Logging** | Structured + Supabase database | ✅ Ready |
| **Monitoring** | Response time tracking + metrics | ✅ Ready |

---

## 🧪 Test the API

### **Get Available Models**
```bash
curl http://localhost:3000/api/models
```

### **Chat with Authentication**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the capital of France?",
    "model": "mixtral-8x7b-32768",
    "temperature": 0.7
  }'
```

**First request (cache miss):**
- Response time: ~500ms
- `"cached": false`

**Second request (cache hit):**
- Response time: ~5ms ✨
- `"cached": true`

---

## 📊 Project Structure

```
sepmpro/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts        # Main inference endpoint
│   │   │   └── models/
│   │   │       └── route.ts        # Models listing
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/                 # React UI components
│   ├── context/                    # Authentication context
│   └── lib/
│       ├── services/               # Core services
│       │   ├── cache.ts            # Caching service
│       │   ├── queue.ts            # Batching service
│       │   ├── groq.ts             # Groq API wrapper
│       │   ├── logging.ts          # Logging service
│       │   ├── rateLimiter.ts      # Rate limiting
│       │   ├── database.ts         # Supabase logging
│       │   └── index.ts            # Service exports
│       ├── middleware/
│       │   └── auth.ts             # JWT authentication
│       ├── utils/
│       │   ├── types.ts            # TypeScript types
│       │   └── helpers.ts          # Utility functions
│       └── supabase.ts             # Supabase client
├── src/config/
│   └── constants.ts                # Configuration
├── .env.example                    # Environment template
├── .env.local                      # Local environment (DO NOT COMMIT)
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

## 🔧 Configuration

All settings in `src/config/constants.ts`:

```typescript
INFERENCE_CONFIG = {
  // Batching
  BATCH_SIZE: 5,                // Requests per batch
  BATCH_TIMEOUT_MS: 100,        // Batch timeout
  MAX_QUEUE_SIZE: 1000,         // Queue limit
  
  // Caching
  CACHE_TTL_MINUTES: 60,        // Cache expiration time
  CACHE_MAX_ENTRIES: 1000,      // Cache size
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 60000,  // 1 minute window
  RATE_LIMIT_MAX_REQUESTS: 100, // Per minute limit
  
  // Timeouts
  REQUEST_TIMEOUT_MS: 30000,    // API timeout
}
```

---

## 📦 Build for Production

```bash
# Build Next.js app
npm run build

# Start production server
npm start
```

Visit: **http://localhost:3000**

---

## 🐛 Troubleshooting

### **Issue: "GROQ_API_KEY not defined"**
```bash
# Verify .env.local exists and has the key
cat .env.local
```

### **Issue: "Supabase connection failed"**
```bash
# Check Supabase credentials in .env.local
# Verify URL format: https://your-project.supabase.co (no trailing slash)
```

### **Issue: "Rate limit exceeded"**
- Default: 100 requests/minute per user
- Check JWT token in Authorization header
- Adjust `RATE_LIMIT_MAX_REQUESTS` in constants.ts

### **Issue: "Cache not working"**
- Check browser cache settings
- Request ID tracking in logs
- View cache stats: `cacheService.getStats()`

### **Issue: Module not found**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentation

- **[README.md](./README.md)** - Project overview
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design
- **[CONFIGURATION.md](./CONFIGURATION.md)** - Advanced settings
- **[API_DOCS.md](./API_DOCS.md)** - API reference
- **[PROJECT_COMPLETION.md](./PROJECT_COMPLETION.md)** - What was built

---

## 🚀 Production Deployment

### **Vercel (Recommended for Next.js)**

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel: https://vercel.com/new
# 3. Add environment variables:
#    - GROQ_API_KEY
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
# 4. Deploy
```

### **Other Platforms**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for alternatives:
- AWS Amplify
- Railway.app
- DigitalOcean App Platform
- Azure App Service

---

## 📝 Files Changed

### **Removed:**
- ❌ `Dockerfile` (Docker multi-stage build)
- ❌ `docker-compose.yml` (Container orchestration)

### **Updated:**
- ✅ `.env.example` (Simplified for Cloud Supabase)
- ✅ `SETUP.md` (This file - new)

### **Kept (No Changes):**
- ✅ All service files (cache, queue, logging, etc.)
- ✅ API endpoints (chat, models)
- ✅ Authentication middleware
- ✅ Type definitions
- ✅ Configuration constants

---

## ✅ Verification Checklist

- [ ] `npm install` completed successfully
- [ ] `.env.local` configured with Groq API key
- [ ] `.env.local` configured with Supabase URL & key
- [ ] Supabase database table created (optional)
- [ ] `npm run dev` starts without errors
- [ ] API accessible at http://localhost:3000
- [ ] `/api/models` endpoint works
- [ ] `/api/chat` endpoint returns response

---

## 🎯 Next Steps

1. **Local Testing** → Run `npm run dev` and test endpoints
2. **Database Setup** → Create `request_logs` table (optional)
3. **Production Deployment** → Deploy to Vercel or preferred platform
4. **Monitor** → Track cache hit rate, latency, errors

---

**Setup complete! Your Inference Optimizer is ready to use.** 🚀

For detailed information, see [README.md](./README.md).
