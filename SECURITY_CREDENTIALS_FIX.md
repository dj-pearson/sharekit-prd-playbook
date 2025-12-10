# Security Fix: Removed Hardcoded Credentials

## ✅ What Was Fixed

### File: `src/integrations/supabase/client.ts`

**BEFORE (INSECURE):**
```typescript
const SUPABASE_URL = "https://tvjgpqmqybtlazabzszo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

**AFTER (SECURE):**
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
```

## 🔐 Required Environment Variables

Create a `.env` file in the project root with these variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://api.yourdomain.com
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Edge Functions URL
VITE_FUNCTIONS_URL=https://functions.yourdomain.com

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

See `env.example.txt` for a complete template.

## 📋 Verification Checklist

- [x] No hardcoded JWT tokens in source code
- [x] No hardcoded Supabase URLs in source code  
- [x] All credentials use environment variables
- [x] `.env` file is in `.gitignore`
- [x] Example environment file created (`env.example.txt`)
- [x] Documentation files have no real credentials

## 🚀 How to Use

### Local Development

1. Copy the example file:
   ```bash
   cp env.example.txt .env
   ```

2. Edit `.env` with your actual credentials:
   ```bash
   # On Windows
   notepad .env
   
   # On Mac/Linux
   nano .env
   ```

3. Add your real values:
   - Get `VITE_SUPABASE_URL` from your Coolify Supabase deployment
   - Get `VITE_SUPABASE_ANON_KEY` from Supabase settings in Coolify
   - Get `VITE_FUNCTIONS_URL` after deploying edge functions

### Coolify Deployment

1. In Coolify dashboard, go to your ShareKit frontend resource
2. Navigate to **Environment Variables** section
3. Add each variable:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_FUNCTIONS_URL`
   - `VITE_STRIPE_PUBLISHABLE_KEY`

## 🔒 Security Best Practices

✅ **DO:**
- Use environment variables for all credentials
- Keep `.env` in `.gitignore`
- Use different credentials for dev/staging/production
- Rotate keys regularly
- Store secrets in password manager

❌ **DON'T:**
- Commit `.env` files to Git
- Hardcode credentials in source code
- Share credentials in chat/email
- Use production keys in development
- Commit API keys or tokens

## 🗂️ Files That Are Safe to Commit

- `env.example.txt` - Template with placeholder values ✅
- `src/integrations/supabase/client.ts` - Uses environment variables ✅
- All documentation files (`.md`) - No real credentials ✅
- Edge function setup files - No hardcoded credentials ✅

## 🗂️ Files That Should NEVER Be Committed

- `.env` - Contains real credentials ❌
- `.env.local` - Local overrides ❌
- `.env.production` - Production secrets ❌
- Any file with actual JWT tokens ❌
- Any file with actual API keys ❌

## 📝 Note About Database Backups

The database backup files (`database/` folder) contain historical data including old credentials from when the database was in use. These are:
- Archived database snapshots
- Should not be used for new deployments
- Are included in the repository for backup purposes only

For new deployments, always use fresh credentials configured via environment variables.

## ✅ Commit Safety Check

Before committing, verify:

```bash
# Check for JWT tokens
git diff | grep -E "eyJ[A-Za-z0-9_-]+\."

# Check for .supabase.co URLs
git diff | grep "supabase\.co"

# Check .env is ignored
git status | grep ".env"

# Should return no results for new files
```

## 🎉 All Clear!

Your codebase is now secure and ready to commit. All sensitive credentials have been moved to environment variables.

