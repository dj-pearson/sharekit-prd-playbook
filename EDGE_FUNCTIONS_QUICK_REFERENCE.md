# Edge Functions Quick Reference Card

## 🚀 Quick Deploy

```bash
# 1. Commit files
git add edge-functions* .dockerignore *EDGE_FUNCTIONS*.md
git commit -m "Add edge functions Docker setup"
git push

# 2. In Coolify:
#    - New Resource → Dockerfile
#    - Point to: edge-functions.Dockerfile
#    - Port: 8000
#    - Add environment variables
#    - Deploy

# 3. Test
curl https://your-functions-domain/health
```

## 📋 Environment Variables

```env
# Required - Supabase
SUPABASE_URL=https://your-supabase-url
SUPABASE_ANON_KEY=eyJxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...

# Required - Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Required - Email
RESEND_API_KEY=re_...

# Optional
FRONTEND_URL=https://yourdomain.com
```

## 🔧 Common Commands

### Test Health
```bash
curl https://your-functions-domain/health
```

### Test Function (with auth)
```bash
curl -X POST https://your-functions-domain/[function-name] \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

### Local Testing
```bash
docker-compose -f docker-compose.edge-functions.yml up
curl http://localhost:8000/health
```

## 📦 Available Functions

| Function Name | Purpose | Auth Required |
|---------------|---------|---------------|
| `create-checkout-session` | Stripe checkout | Yes |
| `create-portal-session` | Customer portal | Yes |
| `process-scheduled-emails` | Email queue | No (internal) |
| `schedule-email-sequences` | Schedule emails | No (internal) |
| `send-resource-email` | Resource delivery | No (webhook) |
| `stripe-webhook` | Stripe events | No (webhook) |
| `trigger-webhooks` | Trigger webhooks | No (internal) |

## 🔍 Debugging

### Check Logs
```bash
# In Coolify Dashboard:
# Navigate to edge-functions service → Logs
```

### Common Issues

| Problem | Solution |
|---------|----------|
| 404 Function not found | Check FUNCTIONS_MAP in edge-functions-server.ts |
| 500 Execution failed | Check environment variables |
| CORS error | Already configured, check request headers |
| Build fails | Verify Dockerfile path in Coolify |

## 🔗 Integration Examples

### Frontend Fetch
```typescript
const response = await fetch(
  `${import.meta.env.VITE_FUNCTIONS_URL}/create-checkout-session`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`
    },
    body: JSON.stringify({ priceId })
  }
);
```

### Supabase Client (old method)
```typescript
// Replace this:
await supabase.functions.invoke('function-name', { body })

// With fetch to your domain:
await fetch(`${FUNCTIONS_URL}/function-name`, { ... })
```

## 📊 Monitoring

### Health Check
- Endpoint: `/health`
- Method: GET
- Response: `{ status: "ok", functions: 7, available: [...] }`

### Uptime Monitoring
Add to UptimeRobot or similar:
- URL: `https://your-functions-domain/health`
- Interval: 5 minutes
- Alert on non-200 response

## ⚡ Adding New Functions

1. Create function in `supabase/functions/new-function/index.ts`
2. Update `edge-functions-server.ts`:
   ```typescript
   const FUNCTIONS_MAP = {
     // ... existing
     "new-function": "./functions/new-function/index.ts",
   };
   ```
3. Commit and push
4. Redeploy in Coolify

## 🎯 Stripe Webhook Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-functions-domain/stripe-webhook`
3. Select events
4. Copy signing secret
5. Add to Coolify: `STRIPE_WEBHOOK_SECRET=whsec_...`
6. Restart service

## 📧 Email Cron Jobs

Add to Supabase (pg_cron extension):

```sql
-- Process emails every 5 minutes
SELECT cron.schedule(
  'process-scheduled-emails',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://your-functions-domain/process-scheduled-emails',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);

-- Schedule sequences hourly
SELECT cron.schedule(
  'schedule-email-sequences',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://your-functions-domain/schedule-email-sequences',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

## 📝 File Locations

```
sharekit-prd-playbook/
├── edge-functions.Dockerfile          # Docker config
├── edge-functions-server.ts           # Main server
├── docker-compose.edge-functions.yml  # Local testing
├── .dockerignore                      # Build optimization
├── COOLIFY_EDGE_FUNCTIONS_SETUP.md   # Full guide
├── EDGE_FUNCTIONS_DEPLOYMENT_CHECKLIST.md  # Checklist
├── EDGE_FUNCTIONS_SETUP_SUMMARY.md   # Overview
└── supabase/
    ├── config.toml                    # JWT config
    └── functions/
        ├── create-checkout-session/
        ├── create-portal-session/
        ├── process-scheduled-emails/
        ├── schedule-email-sequences/
        ├── send-resource-email/
        ├── stripe-webhook/
        └── trigger-webhooks/
```

## 🔐 Security Checklist

- [ ] Use HTTPS in production
- [ ] Keep SERVICE_ROLE_KEY secret
- [ ] Never expose in frontend
- [ ] Verify webhook signatures
- [ ] Enable JWT verification where needed
- [ ] Use environment variables for all secrets
- [ ] Regular security audits
- [ ] Monitor for suspicious activity

## 📞 Support Resources

| Resource | Location |
|----------|----------|
| Full Setup Guide | `COOLIFY_EDGE_FUNCTIONS_SETUP.md` |
| Deployment Checklist | `EDGE_FUNCTIONS_DEPLOYMENT_CHECKLIST.md` |
| Setup Summary | `EDGE_FUNCTIONS_SETUP_SUMMARY.md` |
| Coolify Logs | Dashboard → Service → Logs |
| Stripe Webhooks | Stripe Dashboard → Developers |
| Resend Status | Resend Dashboard → Logs |

## 💡 Pro Tips

1. **Always test health endpoint first**
2. **Check logs before asking for help**
3. **Use environment variables for all configs**
4. **Test locally with Docker Compose**
5. **Document your production URLs**
6. **Set up monitoring ASAP**
7. **Keep secrets in password manager**
8. **Regular backups of configurations**

---

**Need more details?** See `COOLIFY_EDGE_FUNCTIONS_SETUP.md`  
**Step-by-step guide?** See `EDGE_FUNCTIONS_DEPLOYMENT_CHECKLIST.md`  
**Overview?** See `EDGE_FUNCTIONS_SETUP_SUMMARY.md`

