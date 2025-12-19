# Deploy ShareKit Edge Functions to Coolify

## Overview
This guide will help you deploy your ShareKit Edge Functions to your self-hosted Supabase on Coolify.

## Prerequisites
✅ Self-hosted Supabase running on Coolify
✅ Database migrated and configured
✅ GitHub repository with ShareKit code pushed
✅ Stripe account configured (for payment functions)

## Files Included
- `edge-functions.Dockerfile` - Docker configuration for Deno runtime
- `edge-functions-server.ts` - Main server that hosts all 7 functions
- `docker-compose.edge-functions.yml` - For local testing (optional)

## Available Functions
1. **create-checkout-session** - Creates Stripe checkout sessions
2. **create-portal-session** - Creates Stripe customer portal sessions
3. **process-scheduled-emails** - Processes queued email sequences
4. **schedule-email-sequences** - Schedules email sequences for users
5. **send-resource-email** - Sends resource delivery emails
6. **stripe-webhook** - Handles Stripe webhook events
7. **trigger-webhooks** - Triggers configured webhooks

## Step-by-Step Deployment

### 1. Push Files to GitHub

Make sure these new files are committed and pushed:

```bash
git add edge-functions.Dockerfile edge-functions-server.ts docker-compose.edge-functions.yml COOLIFY_EDGE_FUNCTIONS_SETUP.md
git commit -m "Add Edge Functions Docker setup for Coolify"
git push
```

### 2. Create New Resource in Coolify

1. Go to your Coolify dashboard
2. Navigate to your project (where Supabase is deployed)
3. Click **"+ New Resource"**
4. Select **"Dockerfile"**

### 3. Configure the Resource

#### General Settings:
- **Name**: `sharekit-edge-functions`
- **Source**: Select your GitHub repository for ShareKit
- **Branch**: `main` (or your production branch)
- **Dockerfile**: `edge-functions.Dockerfile`
- **Port**: `8000`

#### Environment Variables:
Add these in Coolify's environment variables section. Get these values from your Supabase Coolify deployment:

```env
# Supabase Configuration
SUPABASE_URL=https://your-supabase-kong-url
SUPABASE_ANON_KEY=your-anon-key-from-supabase-settings
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-settings

# Stripe Configuration (for payment functions)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Service (if using Resend)
RESEND_API_KEY=re_...

# Optional: Additional keys your functions might need
FRONTEND_URL=https://yourdomain.com
```

#### Network Settings:
- **Domain**: Add a subdomain like `functions.yourdomain.com` or use auto-generated
- **Ports**: 8000:8000
- **Enable HTTPS**: Yes (recommended)

### 4. Deploy

1. Click **"Save"**
2. Click **"Deploy"**
3. Wait for the build to complete (2-4 minutes)
4. Check the logs to ensure it started successfully

#### Expected Success Logs:
```
🚀 ShareKit Edge Functions Server starting on port 8000...
📦 Loaded 7 functions
🔗 Supabase URL: https://...
✅ Available functions: create-checkout-session, create-portal-session, process-scheduled-emails, ...
```

### 5. Test the Deployment

Once deployed, test the health endpoint:

```bash
curl https://your-functions-domain/health
```

Should return:
```json
{
  "status": "ok",
  "functions": 7,
  "available": [
    "create-checkout-session",
    "create-portal-session",
    "process-scheduled-emails",
    "schedule-email-sequences",
    "send-resource-email",
    "stripe-webhook",
    "trigger-webhooks"
  ],
  "supabaseUrl": "configured"
}
```

### 6. Update Your Application Code

You'll need to update your frontend to call the new functions URL.

#### Option A: Update Supabase Client Configuration

In your `src/integrations/supabase/client.ts`:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const functionUrl = import.meta.env.VITE_FUNCTIONS_URL || ''; // Add this

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Add to your `.env`:
```env
VITE_FUNCTIONS_URL=https://your-functions-domain
```

#### Option B: Update Function Calls

**Before (Supabase hosted):**
```typescript
const { data } = await supabase.functions.invoke('create-checkout-session', {
  body: { priceId }
});
```

**After (Self-hosted):**
```typescript
const response = await fetch(`${import.meta.env.VITE_FUNCTIONS_URL}/create-checkout-session`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseAnonKey}`
  },
  body: JSON.stringify({ priceId })
});
const data = await response.json();
```

### 7. Configure Stripe Webhooks

Update your Stripe webhook endpoint:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add new endpoint: `https://your-functions-domain/stripe-webhook`
3. Select events to listen to
4. Copy the webhook signing secret to your Coolify environment variables

## Testing

### Local Testing (Optional)

You can test locally using Docker Compose:

```bash
# Create .env file with your variables
cp deployment/env.template .env

# Edit .env with your values
# Then run:
docker-compose -f docker-compose.edge-functions.yml up

# Test locally:
curl http://localhost:8000/health
```

### Production Testing

Test each function endpoint:

```bash
# Health check
curl https://your-functions-domain/health

# Test create-checkout-session (requires auth token)
curl -X POST https://your-functions-domain/create-checkout-session \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"priceId": "price_xxx"}'
```

## Troubleshooting

### Build Fails
- ✅ Check that `edge-functions.Dockerfile` path is correct in Coolify
- ✅ Ensure all files are committed and pushed to GitHub
- ✅ Check Coolify build logs for specific errors
- ✅ Verify Dockerfile syntax

### Function Not Found (404)
- ✅ Verify function name matches FUNCTIONS_MAP in `edge-functions-server.ts`
- ✅ Check function directory exists in `supabase/functions/`
- ✅ Ensure proper file structure: `supabase/functions/[name]/index.ts`

### CORS Errors
- ✅ CORS headers are pre-configured in the server
- ✅ Check that your frontend is sending correct headers
- ✅ Verify Origin header if you have specific domain requirements

### Environment Variables Not Working
- ✅ Double-check all environment variables are set in Coolify
- ✅ Restart the service after updating environment variables
- ✅ Check service logs for "not configured" messages

### Stripe Webhook Failures
- ✅ Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- ✅ Check that webhook URL in Stripe matches your functions domain
- ✅ Review Stripe dashboard for webhook delivery attempts
- ✅ Check function logs for signature verification errors

### Email Delivery Issues
- ✅ Verify `RESEND_API_KEY` is configured
- ✅ Check Resend dashboard for delivery status
- ✅ Ensure email templates exist in `_templates` folders
- ✅ Check function logs for email sending errors

## Adding More Functions

To add new edge functions:

1. Create function in `supabase/functions/[name]/index.ts`
2. Update `edge-functions-server.ts`:
   ```typescript
   const FUNCTIONS_MAP: { [key: string]: string } = {
     // ... existing functions
     "your-new-function": "./functions/your-new-function/index.ts",
   };
   ```
3. If function needs JWT verification, update `supabase/config.toml`:
   ```toml
   [functions.your-new-function]
   verify_jwt = false  # or true if auth required
   ```
4. Commit and push changes
5. Redeploy in Coolify (automatic if you have auto-deploy enabled)

## Monitoring

### Coolify Dashboard
- View real-time logs
- Monitor resource usage (CPU, Memory)
- Check deployment history
- Set up alerts

### Health Endpoint
Monitor service health:
```bash
curl https://your-functions-domain/health
```

### Function-Specific Logging
Each function logs to Coolify. Check logs for:
- Request/response details
- Error messages
- Performance metrics

## Security Notes

⚠️ **Important Security Considerations:**

1. **Service Role Key**: Keep `SUPABASE_SERVICE_ROLE_KEY` secret. It has admin access.
2. **Stripe Keys**: Never expose `STRIPE_SECRET_KEY` in frontend code
3. **Webhook Secrets**: Verify all webhook signatures (already implemented)
4. **JWT Verification**: Configure in `config.toml` for functions that need auth
5. **CORS**: Update CORS headers if you need to restrict origins
6. **Rate Limiting**: Consider adding rate limiting for production (Coolify + Cloudflare)
7. **HTTPS**: Always use HTTPS in production
8. **Environment Variables**: Never commit sensitive keys to Git

## Maintenance

### Updating Functions
1. Make changes to function code
2. Commit and push to GitHub
3. Coolify will auto-deploy (if enabled) or click "Deploy" manually

### Monitoring Performance
- Check Coolify metrics regularly
- Monitor function execution times
- Set up alerts for errors

### Backup Configuration
- Keep a copy of environment variables securely
- Document any custom configurations
- Export Coolify configuration periodically

## Support

If you encounter issues:
1. Check Coolify logs first
2. Review this guide's troubleshooting section
3. Check Supabase self-hosting documentation
4. Verify all environment variables are correct

## Next Steps

After deployment:
- ✅ Set up monitoring alerts in Coolify
- ✅ Configure Stripe webhooks
- ✅ Test all payment flows
- ✅ Test email sequences
- ✅ Set up database scheduled jobs (cron) for email functions
- ✅ Configure CDN/WAF (Cloudflare) for additional security
- ✅ Document your production URLs and configuration

