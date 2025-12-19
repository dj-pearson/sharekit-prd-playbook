# Edge Functions Deployment Checklist

## 🎯 Quick Start Guide

Follow this checklist to deploy your ShareKit Edge Functions to Coolify.

---

## Phase 1: Pre-Deployment ✅

- [ ] Verify self-hosted Supabase is running on Coolify
- [ ] Confirm database is migrated and accessible
- [ ] Have GitHub repository access ready
- [ ] Gather all required API keys (Stripe, Resend, etc.)

---

## Phase 2: Commit & Push Files 📦

Files to commit:
- [ ] `edge-functions.Dockerfile`
- [ ] `edge-functions-server.ts`
- [ ] `docker-compose.edge-functions.yml`
- [ ] `COOLIFY_EDGE_FUNCTIONS_SETUP.md`

```bash
git add edge-functions.Dockerfile edge-functions-server.ts docker-compose.edge-functions.yml COOLIFY_EDGE_FUNCTIONS_SETUP.md
git commit -m "Add Edge Functions Docker setup for Coolify"
git push
```

---

## Phase 3: Coolify Configuration 🚀

### 3.1 Create New Resource
- [ ] Go to Coolify dashboard
- [ ] Navigate to ShareKit project
- [ ] Click "+ New Resource"
- [ ] Select "Dockerfile"

### 3.2 Basic Settings
- [ ] **Name**: `sharekit-edge-functions`
- [ ] **Source**: GitHub repository (ShareKit)
- [ ] **Branch**: `main`
- [ ] **Dockerfile**: `edge-functions.Dockerfile`
- [ ] **Port**: `8000`

### 3.3 Environment Variables

#### Required - Supabase
- [ ] `SUPABASE_URL` - Your Kong URL from Supabase Coolify deployment
- [ ] `SUPABASE_ANON_KEY` - From Supabase settings
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - From Supabase settings

#### Required - Stripe (for payment functions)
- [ ] `STRIPE_SECRET_KEY` - From Stripe dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` - Created after webhook setup

#### Required - Email Service
- [ ] `RESEND_API_KEY` - From Resend dashboard

#### Optional
- [ ] `FRONTEND_URL` - Your ShareKit frontend URL

### 3.4 Network Settings
- [ ] Configure domain (e.g., `functions.yourdomain.com`)
- [ ] Ports: `8000:8000`
- [ ] Enable HTTPS

---

## Phase 4: Deploy & Verify 🔍

### 4.1 Initial Deployment
- [ ] Click "Save" in Coolify
- [ ] Click "Deploy"
- [ ] Wait 2-4 minutes for build
- [ ] Check logs for success messages:
  ```
  🚀 ShareKit Edge Functions Server starting on port 8000...
  📦 Loaded 7 functions
  ✅ Available functions: ...
  ```

### 4.2 Test Health Endpoint
```bash
curl https://your-functions-domain/health
```

Expected response:
```json
{
  "status": "ok",
  "functions": 7,
  "available": [...],
  "supabaseUrl": "configured"
}
```

- [ ] Health check returns 200 OK
- [ ] All 7 functions listed
- [ ] Supabase URL shows "configured"

---

## Phase 5: Application Integration 🔗

### 5.1 Update Environment Variables
Add to your frontend `.env`:
```env
VITE_FUNCTIONS_URL=https://your-functions-domain
```

- [ ] Environment variable added to `.env`
- [ ] Variable added to Coolify frontend deployment

### 5.2 Update Function Calls
- [ ] Update `src/integrations/supabase/client.ts` if needed
- [ ] Replace `supabase.functions.invoke()` calls with direct fetch
- [ ] Update authorization headers

Example:
```typescript
// Old
await supabase.functions.invoke('create-checkout-session', { body })

// New
await fetch(`${VITE_FUNCTIONS_URL}/create-checkout-session`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${anonKey}`
  },
  body: JSON.stringify(body)
})
```

---

## Phase 6: Stripe Webhook Configuration 💳

- [ ] Go to Stripe Dashboard → Developers → Webhooks
- [ ] Click "Add endpoint"
- [ ] URL: `https://your-functions-domain/stripe-webhook`
- [ ] Select events to listen to:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Copy webhook signing secret
- [ ] Add `STRIPE_WEBHOOK_SECRET` to Coolify environment variables
- [ ] Restart edge functions service

---

## Phase 7: Email Function Setup 📧

### 7.1 Verify Email Templates
- [ ] Check `_templates` exist in each email function
- [ ] Verify Resend API key is configured

### 7.2 Setup Database Cron Jobs
Create scheduled jobs in Supabase for:

- [ ] `schedule-email-sequences` - Run every hour
- [ ] `process-scheduled-emails` - Run every 5 minutes

Example SQL:
```sql
-- Add to your Supabase pg_cron setup
SELECT cron.schedule(
  'process-scheduled-emails',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT net.http_post(
    url:='https://your-functions-domain/process-scheduled-emails',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) as request_id;
  $$
);

SELECT cron.schedule(
  'schedule-email-sequences',
  '0 * * * *', -- Every hour
  $$
  SELECT net.http_post(
    url:='https://your-functions-domain/schedule-email-sequences',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) as request_id;
  $$
);
```

---

## Phase 8: Testing 🧪

### 8.1 Test Each Function

#### Create Checkout Session
```bash
curl -X POST https://your-functions-domain/create-checkout-session \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"priceId": "price_xxx"}'
```
- [ ] Returns checkout URL
- [ ] No errors in logs

#### Stripe Webhook
- [ ] Trigger test event from Stripe Dashboard
- [ ] Check webhook delivery status in Stripe
- [ ] Verify event processed in Coolify logs

#### Email Functions
- [ ] Test `send-resource-email` with real data
- [ ] Verify email delivered in Resend dashboard
- [ ] Check logs for successful sends

#### Other Functions
- [ ] `create-portal-session` - Test customer portal
- [ ] `trigger-webhooks` - Verify webhook triggers work
- [ ] `schedule-email-sequences` - Check sequence creation
- [ ] `process-scheduled-emails` - Verify scheduled sends

---

## Phase 9: Monitoring Setup 📊

### 9.1 Coolify Monitoring
- [ ] Set up log alerts for errors
- [ ] Configure resource usage alerts
- [ ] Enable auto-deploy on push (optional)

### 9.2 Health Check Monitoring
- [ ] Add health endpoint to uptime monitor (e.g., UptimeRobot)
- [ ] Set up notifications for downtime

### 9.3 External Monitoring
- [ ] Stripe webhook monitoring
- [ ] Resend email delivery monitoring
- [ ] Database cron job monitoring

---

## Phase 10: Documentation & Handoff 📝

- [ ] Document your production URLs:
  - Edge Functions URL: `_______________`
  - Supabase URL: `_______________`
  - Frontend URL: `_______________`
  
- [ ] Save environment variables securely (1Password, etc.)
- [ ] Document any custom configurations
- [ ] Create runbook for common operations
- [ ] Set up team access to Coolify

---

## 🎉 Deployment Complete!

### Final Verification:
- [ ] All functions accessible and responding
- [ ] Payments working end-to-end
- [ ] Emails sending successfully
- [ ] Webhooks triggering correctly
- [ ] Monitoring and alerts configured
- [ ] Team has access and documentation

---

## 🆘 Troubleshooting

If issues occur, check:
1. Coolify logs for error messages
2. All environment variables are set correctly
3. Supabase is accessible from functions
4. Stripe webhook signing secret matches
5. Resend API key is valid
6. Refer to `COOLIFY_EDGE_FUNCTIONS_SETUP.md` for detailed troubleshooting

---

## 📞 Support Resources

- Coolify Logs: Check your edge-functions service logs
- Stripe Dashboard: webhook delivery status
- Resend Dashboard: email delivery status
- Supabase Logs: database and auth errors
- Documentation: `COOLIFY_EDGE_FUNCTIONS_SETUP.md`

---

**Good luck with your deployment!** 🚀

