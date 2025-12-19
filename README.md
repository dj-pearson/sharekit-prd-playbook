# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/2e706edf-bb60-4bbb-ab82-ee4188c5fd1b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2e706edf-bb60-4bbb-ab82-ee4188c5fd1b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/2e706edf-bb60-4bbb-ab82-ee4188c5fd1b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 🐳 Self-Hosting with Coolify

This project includes Docker configuration for deploying edge functions to self-hosted Supabase on Coolify.

### Edge Functions Setup

- **Quick Start**: See `EDGE_FUNCTIONS_DEPLOYMENT_CHECKLIST.md` for step-by-step instructions
- **Complete Guide**: See `COOLIFY_EDGE_FUNCTIONS_SETUP.md` for detailed setup and troubleshooting
- **Quick Reference**: See `EDGE_FUNCTIONS_QUICK_REFERENCE.md` for common commands and examples
- **Overview**: See `EDGE_FUNCTIONS_SETUP_SUMMARY.md` for architecture and benefits

### Available Edge Functions (7 total)

1. `create-checkout-session` - Stripe checkout sessions
2. `create-portal-session` - Stripe customer portal
3. `process-scheduled-emails` - Email queue processing
4. `schedule-email-sequences` - Email campaign scheduling
5. `send-resource-email` - Resource delivery emails
6. `stripe-webhook` - Stripe webhook handling
7. `trigger-webhooks` - Webhook triggers

### Deployment Scripts

The `deployment/` folder contains reusable scripts for:
- Database migrations
- Edge functions deployment (Git or SSH)
- Database backup/restore
- Service verification

See `deployment/README.md` for full documentation.

## 📝 Additional Documentation

- `PRD.md` - Product Requirements Document
- `LIVING-TECHNICAL-SPEC.md` - Technical specifications
- `EXECUTION-ROADMAP.md` - Development roadmap
- `ADMIN-SETUP.md` - Admin system setup
- `STRIPE_SETUP.md` - Stripe integration guide
- `SEO_STRATEGY.md` - SEO strategy and implementation