# Stripe Integration Setup Guide

This document provides step-by-step instructions for setting up Stripe payments and subscriptions in ShareKit.

## Prerequisites

1. A Stripe account (create one at https://stripe.com)
2. Access to your Stripe Dashboard
3. Access to your Supabase project dashboard

## Step 1: Create Stripe Products and Prices

### 1.1 Create Products

In your Stripe Dashboard (https://dashboard.stripe.com/products):

#### Pro Plan
1. Click "Add product"
2. Name: "ShareKit Pro"
3. Description: "Professional plan with unlimited pages, AI features, and advanced analytics"
4. Create two prices:
   - **Monthly**: $19/month (recurring)
   - **Yearly**: $190/year (recurring) - This is ~$16/month, a 17% savings

#### Business Plan
1. Click "Add product"
2. Name: "ShareKit Business"
3. Description: "Business plan with custom domains, team collaboration, and priority support"
4. Create two prices:
   - **Monthly**: $49/month (recurring)
   - **Yearly**: $490/year (recurring) - This is ~$41/month, a 17% savings

### 1.2 Copy Price IDs

After creating each price, copy the Price ID (starts with `price_`). You'll need these for environment variables.

## Step 2: Set Up Environment Variables

### 2.1 Client-side Variables (.env or Vite environment)

Add these to your `.env` file in the root of your project:

```bash
# Stripe Publishable Key (starts with pk_test_ or pk_live_)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Stripe Price IDs
VITE_STRIPE_PRO_MONTHLY_PRICE_ID=price_your_pro_monthly_id
VITE_STRIPE_PRO_YEARLY_PRICE_ID=price_your_pro_yearly_id
VITE_STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_your_business_monthly_id
VITE_STRIPE_BUSINESS_YEARLY_PRICE_ID=price_your_business_yearly_id
```

### 2.2 Server-side Variables (Supabase Edge Functions)

In your Supabase project dashboard:

1. Go to **Project Settings** > **Edge Functions**
2. Add these secrets:

```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
APP_URL=https://your-app-domain.com  # Or http://localhost:5173 for development
```

**For Stripe Price IDs** (needed by webhook to determine plan):
```bash
STRIPE_PRO_MONTHLY_PRICE_ID=price_your_pro_monthly_id
STRIPE_PRO_YEARLY_PRICE_ID=price_your_pro_yearly_id
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_your_business_monthly_id
STRIPE_BUSINESS_YEARLY_PRICE_ID=price_your_business_yearly_id
```

## Step 3: Deploy Supabase Edge Functions

Deploy the three Stripe-related Edge Functions:

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
supabase functions deploy stripe-webhook
```

## Step 4: Set Up Stripe Webhook

### 4.1 Get Your Webhook URL

Your webhook URL will be:
```
https://your-project-ref.supabase.co/functions/v1/stripe-webhook
```

### 4.2 Create Webhook in Stripe

1. Go to Stripe Dashboard > **Developers** > **Webhooks**
2. Click "Add endpoint"
3. Enter your webhook URL
4. Select the following events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to your Supabase secrets as `STRIPE_WEBHOOK_SECRET`

## Step 5: Test the Integration

### 5.1 Use Test Mode

Make sure you're using Stripe test keys (they start with `pk_test_` and `sk_test_`).

### 5.2 Test Cards

Use these test card numbers:
- **Success**: 4242 4242 4242 4242
- **Requires authentication**: 4000 0025 0000 3155
- **Declined**: 4000 0000 0000 9995

Any future expiry date, any 3-digit CVC, and any postal code will work.

### 5.3 Test the Flow

1. Go to `/pricing` on your app
2. Click "Upgrade to Pro"
3. Complete the checkout with a test card
4. Verify that:
   - You're redirected back to settings
   - Your plan is updated in the database
   - The webhook received the event

### 5.4 Test Subscription Management

1. In Settings > Billing, click "Manage Subscription & Billing"
2. You should be redirected to Stripe Customer Portal
3. Test updating payment method, viewing invoices

## Step 6: Go Live

### 6.1 Switch to Live Mode

1. In Stripe Dashboard, toggle to "Live mode"
2. Create the same products and prices
3. Update all environment variables with live keys (`pk_live_`, `sk_live_`)
4. Update webhook endpoint to listen to live events

### 6.2 Enable Customer Portal

In Stripe Dashboard:
1. Go to **Settings** > **Billing** > **Customer portal**
2. Configure:
   - Allow customers to update payment methods
   - Allow customers to view invoices
   - Allow customers to cancel subscriptions (optional)
   - Set your business information

## Features Implemented

### Pricing Tiers

#### Free
- 1 landing page
- 100 signups/month
- 10MB file uploads
- ShareKit branding
- Basic analytics

#### Pro ($19/mo or $190/year)
- Unlimited pages
- 1,000 signups/month
- 50MB file uploads
- Remove branding
- AI-powered features
- A/B testing
- Email sequences
- Advanced analytics
- Priority support

#### Business ($49/mo or $490/year)
- Everything in Pro
- 10,000 signups/month
- 100MB file uploads
- Custom domains
- Team collaboration
- Advanced webhooks
- Dedicated account manager
- SLA guarantee

### Feature Gating

The following features are gated by subscription tier:

- **A/B Testing**: Pro+
- **Email Sequences**: Pro+
- **Advanced Analytics**: Pro+
- **Custom Domains**: Business only
- **Remove Branding**: Pro+
- **AI Features**: Pro+

## Troubleshooting

### Webhook not receiving events
1. Check that the webhook URL is correct
2. Verify the webhook secret is set correctly in Supabase
3. Check Supabase Edge Function logs
4. Test the webhook in Stripe Dashboard

### Checkout not working
1. Verify all Stripe keys are set correctly
2. Check browser console for errors
3. Verify the Edge Function is deployed
4. Check that Price IDs match between environment variables and Stripe

### Plan not updating after checkout
1. Check webhook is receiving events
2. Verify webhook is processing `checkout.session.completed`
3. Check Supabase database to see if customer_id was saved
4. Review Edge Function logs for errors

## Security Notes

1. **Never commit** `.env` files to version control
2. Use **test mode** for development
3. Rotate keys regularly
4. Monitor Stripe logs for suspicious activity
5. Set up alerts for failed payments
6. Always validate webhooks using the signing secret

## Support Resources

- Stripe Documentation: https://stripe.com/docs
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Stripe Test Cards: https://stripe.com/docs/testing

## Next Steps

1. Customize pricing tiers to match your business model
2. Set up email notifications for payment events
3. Implement usage-based billing (if needed)
4. Add promotional codes and discounts
5. Set up analytics to track conversions
