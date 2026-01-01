# ShareKit - Resource Delivery Platform

## Project Overview

ShareKit is a simple resource delivery platform designed for creators, coaches, and consultants to share digital resources (PDFs, guides, checklists) through beautiful landing pages with automated email delivery. It positions itself as a simpler, more focused alternative to ConvertKit and Mailchimp.

**Tagline:** "Share what matters"

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** TanStack Query (React Query)
- **Backend:** Supabase (Auth, Database, Storage, Edge Functions)
- **Payments:** Stripe
- **Charts:** Recharts
- **3D Graphics:** Three.js + React Three Fiber (Hero section)
- **Animation:** Framer Motion
- **Forms:** React Hook Form + Zod validation

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── admin/           # Admin-specific components
│   └── PageBuilder/     # Page builder components
├── pages/               # Route pages
│   └── admin/           # Admin panel pages
├── hooks/               # Custom React hooks
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client & types
└── lib/                 # Utility functions
```

## Key Features

### User-Facing Features
- **Resource Upload:** Upload PDFs, guides, and digital files
- **Landing Page Builder:** Visual page builder with templates (minimal, bold, gradient, professional, playful)
- **Email Capture:** Collect emails with automated resource delivery
- **Analytics Dashboard:** Track views, signups, downloads, conversion rates
- **Real-time Notifications:** Live signup notifications
- **Custom Domains:** Business plan feature for custom domain support
- **Username Selection:** Personalized URLs (`/username/page-slug`)
- **Email Sequences:** Automated email sequence campaigns
- **A/B Testing:** Test different page variants
- **Webhooks:** Integrate with external services
- **Teams:** Collaborate with team members

### Admin Features
- User management and moderation
- Platform analytics and monitoring
- CMS for blog and marketing content
- Subscription management
- Support ticket handling

## Subscription Tiers

| Feature | Free | Pro ($19/mo) | Business ($49/mo) |
|---------|------|--------------|-------------------|
| Pages | 1 | Unlimited | Unlimited |
| Signups/month | 100 | 1,000 | 10,000 |
| Templates | 3 | All 5 | All 5 |
| Remove branding | No | Yes | Yes |
| Custom domain | No | No | Yes |
| Advanced analytics | No | Yes | Yes |
| Team collaboration | No | No | Yes |

## Routes

### Public Routes
- `/` - Home page with marketing content
- `/auth` - Sign in / Sign up
- `/pricing` - Pricing page
- `/pricing/compare` - Detailed pricing comparison
- `/p/:slug` - Public share page
- `/:username/:pageSlug` - Username-based public page
- `/d/:token` - Download page for resources
- `/blog` - Blog listing
- `/blog/:slug` - Individual blog post
- `/terms`, `/privacy`, `/dmca` - Legal pages

### Dashboard Routes (Authenticated)
- `/dashboard` - Main dashboard with stats
- `/dashboard/resources` - Resource management
- `/dashboard/upload` - Upload new resources
- `/dashboard/pages` - Page management
- `/dashboard/pages/create` - Create new page
- `/dashboard/pages/:id/edit` - Edit page
- `/dashboard/pages/:id/analytics` - Page-specific analytics
- `/dashboard/pages/builder/:pageId?` - Visual page builder
- `/dashboard/pages/:pageId/sequences` - Email sequences
- `/dashboard/pages/:pageId/ab-testing` - A/B testing
- `/dashboard/analytics` - Overall analytics
- `/dashboard/webhooks` - Webhook configuration
- `/dashboard/teams` - Team management
- `/dashboard/domains` - Custom domain setup
- `/dashboard/settings` - Account settings

### Admin Routes
- `/admin/dashboard` - Admin overview
- `/admin/users` - User management
- `/admin/monitoring` - System monitoring
- `/admin/content` - Content moderation
- `/admin/support` - Support tickets
- `/admin/subscriptions` - Subscription management
- `/admin/cms` - Content management
- `/admin/marketing` - Marketing tools
- `/admin/analytics` - Platform analytics
- `/admin/settings` - Admin settings

## Database Schema (Supabase)

Key tables:
- `profiles` - User profiles with notification preferences
- `resources` - Uploaded files/resources
- `pages` - Landing pages
- `page_resources` - Junction table for pages ↔ resources
- `email_captures` - Captured email addresses
- `analytics_events` - View, signup, download events
- `webhooks` - Webhook configurations
- `email_sequences` - Automated email campaigns
- `ab_test_variants` - A/B test configurations

## Edge Functions (7 total)

1. `create-checkout-session` - Stripe checkout
2. `create-portal-session` - Stripe customer portal
3. `process-scheduled-emails` - Email queue processing
4. `schedule-email-sequences` - Email campaign scheduling
5. `send-resource-email` - Resource delivery emails
6. `stripe-webhook` - Stripe webhook handling
7. `trigger-webhooks` - Webhook triggers

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## Recent Improvements

- Security enhancements: CORS restrictions, stronger password requirements (12+ chars, mixed case, numbers, special chars)
- Mobile responsiveness improvements across the platform
- Real-time activity feed on dashboard
- Conversion funnel visualization
- Advanced analytics with cohort analysis

## Current State

The platform is feature-complete for MVP with:
- Full authentication flow (email/password + Google OAuth)
- Resource upload and management
- Visual page builder with 5 templates
- Email capture and automated delivery
- Comprehensive analytics
- Subscription management via Stripe
- Admin panel for platform management
- Mobile-responsive design
- SEO optimization with structured data

## Areas for Future Enhancement

1. **Search/Filter** - Add search functionality to Pages and Resources lists
2. **Keyboard Shortcuts** - Add help modal showing available shortcuts
3. **Skeleton Loading** - Replace spinner loading states with skeleton loaders
4. **Dark Mode** - Full dark mode implementation (next-themes is installed)
5. **Export Features** - CSV export for email captures
6. **Integration Marketplace** - Pre-built integrations (Mailchimp, ConvertKit, etc.)
7. **Template Marketplace** - User-created templates
8. **Analytics Comparison** - Period-over-period analytics comparison
