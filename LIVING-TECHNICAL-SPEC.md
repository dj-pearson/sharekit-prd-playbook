# Living Technical Specification (LTS)
## ShareKit - Lead Magnet Delivery Platform

**Document Version:** 1.0
**Last Updated:** November 11, 2025
**Status:** Active Development
**Repository:** sharekit-prd-playbook

---

## Executive Summary

ShareKit is a micro-SaaS platform built with React, TypeScript, Vite, and Supabase that enables creators, coaches, and consultants to share digital resources through beautiful landing pages with automated email delivery. This Living Technical Specification provides a comprehensive snapshot of the current implementation state, architectural decisions, and identified opportunities for growth.

**Current State:** MVP with core functionality implemented (~60% complete)
**Tech Stack:** React 18 + TypeScript + Vite + Supabase + Tailwind CSS
**Deployment:** Lovable.dev platform (Cloudflare Pages)

---

## Table of Contents

1. [Current Architecture](#1-current-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Database Schema](#3-database-schema)
4. [Feature Implementation Status](#4-feature-implementation-status)
5. [Component Architecture](#5-component-architecture)
6. [API & Integration Layer](#6-api--integration-layer)
7. [State Management](#7-state-management)
8. [Authentication & Security](#8-authentication--security)
9. [Performance & Optimization](#9-performance--optimization)
10. [Technical Debt & Opportunities](#10-technical-debt--opportunities)
11. [Growth Opportunities](#11-growth-opportunities)
12. [Deployment & Infrastructure](#12-deployment--infrastructure)
13. [Testing Strategy](#13-testing-strategy)
14. [Development Workflow](#14-development-workflow)

---

## 1. Current Architecture

### 1.1 Application Structure

```
ShareKit Architecture
├── Frontend Layer (React + Vite)
│   ├── Public Routes (Marketing, Landing Pages, Download)
│   ├── Protected Routes (Dashboard, Management)
│   └── UI Component Library (shadcn/ui)
│
├── Backend Layer (Supabase)
│   ├── PostgreSQL Database (17 tables)
│   ├── Authentication (JWT + RLS)
│   ├── Storage (Resources bucket)
│   └── Edge Functions (Email, Webhooks)
│
└── Third-Party Integrations
    ├── Email Delivery (Edge function ready)
    ├── Analytics (Events tracking)
    └── Payments (Planned: Stripe)
```

### 1.2 Design Patterns

**Pattern:** Component-Based Architecture with Functional React
**State Management:** React Query for server state + useState for local UI state
**Routing:** React Router v6 with route-based code splitting
**Styling:** Utility-first CSS with Tailwind + Component variants
**Type Safety:** TypeScript strict mode with generated Supabase types

### 1.3 Directory Organization

```
/src
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui primitives (50+ components)
│   ├── DashboardLayout.tsx
│   ├── EmailCaptureForm.tsx
│   ├── OnboardingWizard.tsx
│   └── RealtimeActivityFeed.tsx
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── integrations/
│   └── supabase/        # Supabase client & types
├── lib/                 # Utility functions
├── App.tsx              # Main routing & providers
└── main.tsx             # Application entry
```

**Rationale:** Follows React best practices with clear separation between UI components, business logic (hooks), and integration layers.

---

## 2. Technology Stack

### 2.1 Frontend Technologies

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **React** | 18.3.1 | UI Framework | Industry standard, excellent ecosystem |
| **TypeScript** | 5.8.3 | Type Safety | Catches errors at compile time, better DX |
| **Vite** | 5.4.19 | Build Tool | Fast HMR, optimized production builds |
| **React Router** | 6.30.1 | Client-side Routing | Declarative routing with nested routes |
| **Tailwind CSS** | 3.4.17 | Styling | Rapid UI development, consistent design |
| **shadcn/ui** | Latest | Component Library | Accessible, customizable Radix UI components |
| **TanStack Query** | 5.83.0 | Server State | Caching, background refetching, optimistic updates |
| **React Hook Form** | 7.61.1 | Form Management | Performant forms with validation |
| **Zod** | 3.25.76 | Schema Validation | Type-safe runtime validation |
| **Recharts** | 2.15.4 | Data Visualization | Simple, responsive charts |
| **Lucide React** | 0.462.0 | Icons | Consistent, modern icon system |
| **date-fns** | 3.6.0 | Date Utilities | Lightweight date manipulation |

### 2.2 Backend Technologies

| Technology | Purpose | Current Status |
|------------|---------|----------------|
| **Supabase** | Backend-as-a-Service | ✅ Fully integrated |
| **PostgreSQL 15** | Relational Database | ✅ Schema implemented |
| **Supabase Auth** | Authentication | ✅ Email/password working |
| **Supabase Storage** | File Storage | ✅ Resources bucket active |
| **Supabase Edge Functions** | Serverless Functions | ✅ 4 functions deployed |
| **Supabase Realtime** | WebSocket Subscriptions | 🔶 Partial (component exists, not connected) |

### 2.3 Development Tools

```json
{
  "devDependencies": {
    "eslint": "^9.32.0",
    "typescript-eslint": "^8.38.0",
    "@vitejs/plugin-react-swc": "^3.11.0",
    "autoprefixer": "^10.4.21",
    "lovable-tagger": "^1.1.11"
  }
}
```

**Build System:** Vite with SWC for faster compilation
**Linting:** ESLint with React hooks plugin
**Package Manager:** npm (could optimize with pnpm)

---

## 3. Database Schema

### 3.1 Current Schema Overview

**Total Tables:** 17 core tables
**Row Level Security:** Enabled on all tables
**Indexes:** Optimized for common query patterns
**Triggers:** Automated count updates and timestamp management

### 3.2 Core Tables

#### **profiles**
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  bio text,
  avatar_url text,
  website_url text,
  email_from_name text,
  email_reply_to text,
  onboarding_completed boolean DEFAULT false,
  onboarding_step integer DEFAULT 1,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);
```

**Purpose:** Extended user profile data beyond auth.users
**Relationships:** 1:1 with auth.users
**Current Usage:** Username for page URLs, onboarding tracking

#### **resources**
```sql
CREATE TABLE resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  cover_image_url text,
  thumbnail_url text,
  category text CHECK (category IN ('guide', 'checklist', 'template', 'workbook', 'other')),
  download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);
```

**Purpose:** Stores uploaded files (PDFs, guides, etc.)
**Storage Integration:** file_url points to Supabase Storage
**Current Implementation:** ✅ Upload, list, delete working

#### **pages**
```sql
CREATE TABLE pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  template_id text DEFAULT 'minimal',
  headline text,
  subheadline text,
  primary_color text DEFAULT '#0891B2',
  button_text text DEFAULT 'Get Access',
  custom_css text,
  published boolean DEFAULT false,
  published_at timestamptz,
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);
```

**Purpose:** Landing pages for resource sharing
**URL Pattern:** `/p/{slug}`
**Current Implementation:** ✅ Create, edit, publish, view tracking

#### **page_resources** (Junction Table)
```sql
CREATE TABLE page_resources (
  page_id uuid REFERENCES pages ON DELETE CASCADE,
  resource_id uuid REFERENCES resources ON DELETE CASCADE,
  display_order integer DEFAULT 0,
  PRIMARY KEY (page_id, resource_id)
);
```

**Purpose:** Many-to-many relationship between pages and resources
**Current Implementation:** ✅ Multiple resources per page supported

#### **email_captures**
```sql
CREATE TABLE email_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES pages ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  download_token text UNIQUE,
  ip_address inet,
  user_agent text,
  referrer_url text,
  created_at timestamptz DEFAULT NOW(),
  UNIQUE(page_id, email)
);
```

**Purpose:** Email signups from landing pages
**Security:** Unique constraint prevents duplicate signups per page
**Current Implementation:** ✅ Capture working, token generation ready

#### **analytics_events**
```sql
CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES pages,
  event_type text NOT NULL CHECK (event_type IN ('view', 'signup', 'download')),
  session_id text,
  metadata jsonb,
  created_at timestamptz DEFAULT NOW()
);
```

**Purpose:** Event tracking for analytics dashboard
**Event Types:** view (page visit), signup (email capture), download (file download)
**Current Implementation:** ✅ View and signup events tracked

### 3.3 Advanced Feature Tables

#### **email_sequences** (Drip Campaigns)
```sql
CREATE TABLE email_sequences (
  id uuid PRIMARY KEY,
  page_id uuid REFERENCES pages,
  name text NOT NULL,
  delay_hours integer NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  active boolean DEFAULT true,
  sequence_order integer,
  created_at timestamptz DEFAULT NOW()
);
```

**Status:** ✅ Table exists
**Usage:** Automated follow-up emails after signup
**Implementation:** Edge function `schedule-email-sequences` exists

#### **webhooks**
```sql
CREATE TABLE webhooks (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  url text NOT NULL,
  events text[] NOT NULL,
  secret text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW()
);
```

**Status:** ✅ Table exists
**Usage:** Send data to external services (Zapier, Make, etc.)
**Implementation:** Edge function `trigger-webhooks` deployed

#### **teams** & **team_members**
```sql
CREATE TABLE teams (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  owner_id uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id uuid REFERENCES teams ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  role text CHECK (role IN ('owner', 'admin', 'member')),
  PRIMARY KEY (team_id, user_id)
);
```

**Status:** ✅ Tables exist, dashboard page implemented
**Usage:** Collaborative workspaces for agencies/teams
**Current Implementation:** 🔶 UI exists but needs backend integration

#### **page_variants** (A/B Testing)
```sql
CREATE TABLE page_variants (
  id uuid PRIMARY KEY,
  page_id uuid REFERENCES pages ON DELETE CASCADE,
  name text NOT NULL,
  template_id text,
  traffic_percentage integer,
  headline text,
  -- ... variant-specific fields
  created_at timestamptz DEFAULT NOW()
);
```

**Status:** ✅ Table exists, dashboard page implemented
**Usage:** A/B test different page designs
**Current Implementation:** 🔶 UI exists, traffic splitting needs implementation

#### **custom_domains**
```sql
CREATE TABLE custom_domains (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  domain text UNIQUE NOT NULL,
  verification_token text,
  verified boolean DEFAULT false,
  ssl_status text,
  created_at timestamptz DEFAULT NOW()
);
```

**Status:** ✅ Table exists, dashboard page implemented
**Usage:** Use resources.yourdomain.com instead of sharekit URLs
**Current Implementation:** 🔶 UI exists, DNS verification needs implementation

### 3.4 Performance Optimizations

**Indexes Created:**
```sql
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_published ON pages(published) WHERE published = true;
CREATE INDEX idx_email_captures_page_id ON email_captures(page_id);
CREATE INDEX idx_analytics_events_page_id ON analytics_events(page_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
```

**Database Triggers:**
- `update_updated_at_column()`: Auto-update timestamps
- `increment_view_count()`: Increment pages.views_count on analytics events
- `update_page_view_count()`: Trigger on analytics_events INSERT

**Row Level Security (RLS) Policies:**
- Users can only view/edit their own resources and pages
- Published pages are publicly viewable
- Email captures are only visible to page owners
- Analytics events follow page ownership

---

## 4. Feature Implementation Status

### 4.1 Core Features (MVP)

| Feature | Status | Completion | Notes |
|---------|--------|------------|-------|
| **User Authentication** | ✅ Done | 100% | Email/password, protected routes |
| **Resource Upload** | ✅ Done | 100% | Drag-drop, Supabase Storage |
| **Resource Management** | ✅ Done | 90% | List, edit, delete working; thumbnail generation missing |
| **Page Builder** | ✅ Done | 85% | 5 templates, customization; real-time preview missing |
| **Email Capture** | ✅ Done | 100% | Form validation, duplicate prevention |
| **Email Delivery** | ✅ Done | 90% | Edge function exists, testing needed |
| **Public Landing Pages** | ✅ Done | 100% | `/p/{slug}` routes working |
| **Download Pages** | 🔶 Partial | 60% | Using direct links; token system not fully implemented |
| **Analytics Dashboard** | ✅ Done | 85% | Views, signups tracked; CSV export missing |
| **Dashboard UI** | ✅ Done | 95% | Sidebar nav, stats cards, responsive |

### 4.2 Advanced Features

| Feature | Status | Completion | Notes |
|---------|--------|------------|-------|
| **Email Sequences** | 🔶 Partial | 50% | DB schema + edge function exist, UI needs work |
| **A/B Testing** | 🔶 Partial | 40% | Tables exist, UI exists, traffic splitting not implemented |
| **Webhooks** | 🔶 Partial | 60% | Config UI exists, delivery tracking needs work |
| **Team Collaboration** | 🔶 Partial | 40% | Tables + UI exist, invitation flow incomplete |
| **Custom Domains** | 🔶 Partial | 30% | Table + UI exist, DNS verification not implemented |
| **Real-time Activity Feed** | 🔶 Partial | 30% | Component exists, Supabase Realtime not connected |
| **Advanced Analytics** | ✅ Done | 80% | Funnel analysis, cohort reports working |
| **Onboarding Wizard** | ❌ Not Started | 0% | Component file exists but not integrated |

### 4.3 Monetization Features

| Feature | Status | Completion | Notes |
|---------|--------|------------|-------|
| **Stripe Integration** | ❌ Not Started | 0% | Planned for Phase 2 |
| **Subscription Plans** | ❌ Not Started | 0% | Free/Pro/Business tiers designed |
| **Usage Limits** | ❌ Not Started | 0% | No enforcement of plan limits yet |
| **Billing Portal** | ❌ Not Started | 0% | Stripe Customer Portal planned |
| **Upgrade Prompts** | ❌ Not Started | 0% | UI hooks ready, logic needed |

### 4.4 Feature Gaps (PRD vs Implementation)

**Missing from PRD Implementation:**

1. **Onboarding Wizard** (PRD Section 5.2)
   - Component exists but not integrated into signup flow
   - Should guide new users through first resource + page creation
   - **Impact:** High - poor first-run experience

2. **Token-Based Downloads** (PRD Section 5.2, Feature 5)
   - Download tokens generated but not enforced
   - Currently using direct Supabase Storage URLs
   - **Impact:** Medium - less control over downloads

3. **Real-time Activity Feed** (PRD Section 5.2, Feature 6)
   - Component exists but Supabase Realtime not connected
   - Should show live signup notifications
   - **Impact:** Low - nice-to-have feature

4. **CSV Export** (PRD Section 5.2, Feature 6)
   - Analytics dashboard exists but no export functionality
   - **Impact:** Medium - important for data portability

5. **GDPR Compliance** (PRD Section 11.2)
   - No cookie consent banner
   - No data export/deletion UI
   - **Impact:** High - legal requirement for EU users

6. **Preview Mode** (PRD Section 5.2, Feature 3)
   - Can't preview pages before publishing
   - **Impact:** Medium - UX inconvenience

---

## 5. Component Architecture

### 5.1 UI Component Library (shadcn/ui)

**Total Components:** 50+ pre-built components
**Approach:** Copy-paste components (not npm package)
**Customization:** Fully customizable via Tailwind

**Core Components Used:**
```typescript
// Form Components
Button, Input, Label, Textarea, Select, Checkbox, Switch, RadioGroup

// Layout Components
Card, Separator, Tabs, Accordion, Collapsible

// Overlay Components
Dialog, Sheet, Popover, Dropdown Menu, Tooltip, Alert Dialog

// Feedback Components
Toast, Alert, Progress, Skeleton

// Navigation Components
Sidebar (new in radix-ui 1.2), Navigation Menu, Menubar

// Data Display
Table, Badge, Avatar, Calendar
```

### 5.2 Custom Components

#### **DashboardLayout.tsx**
```typescript
// Purpose: Main dashboard shell with sidebar + header
// Location: src/components/DashboardLayout.tsx
// Features:
// - Responsive sidebar (mobile drawer, desktop fixed)
// - User menu with avatar
// - Navigation links with active states
// - Authentication guard (redirects if not logged in)
// - Breadcrumb navigation

// Usage:
<DashboardLayout>
  <YourPageContent />
</DashboardLayout>
```

**Current Status:** ✅ Fully functional
**Issues:** Sidebar styling fixed in recent commit (destructuring bug)

#### **EmailCaptureForm.tsx**
```typescript
// Purpose: Email signup form for landing pages
// Location: src/components/EmailCaptureForm.tsx
// Features:
// - React Hook Form + Zod validation
// - Email format validation
// - Duplicate detection
// - Loading states
// - Success/error toast notifications
// - Triggers webhook on signup
// - Schedules email sequences

// Props:
interface EmailCaptureFormProps {
  pageId: string;
  buttonText?: string;
  requireName?: boolean;
}
```

**Current Status:** ✅ Fully functional
**Dependencies:** React Hook Form, Zod, Supabase, Toast

#### **OnboardingWizard.tsx**
```typescript
// Purpose: Multi-step wizard for new user onboarding
// Location: src/components/OnboardingWizard.tsx
// Status: ⚠️ Component exists but NOT integrated

// Intended Flow:
// Step 1: Welcome message
// Step 2: Upload first resource
// Step 3: Choose template
// Step 4: Customize page
// Step 5: Publish & share

// Current Issue: Not triggered after signup
```

**Action Needed:** Integrate into signup flow or dashboard first load

#### **RealtimeActivityFeed.tsx**
```typescript
// Purpose: Live feed of signups and downloads
// Location: src/components/RealtimeActivityFeed.tsx
// Status: ⚠️ Component exists but Realtime NOT connected

// Intended Features:
// - Subscribe to email_captures inserts
// - Show toast notification on new signup
// - Display recent 10 activities
// - Filter by event type

// Current Issue: Supabase Realtime channel not subscribed
```

**Action Needed:** Set up Supabase Realtime subscription in useEffect

### 5.3 Component Patterns

**Pattern 1: Server State Components**
```typescript
// Pattern: Fetch data with TanStack Query, display with loading states

const ResourceList = () => {
  const { data: resources, isLoading, error } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const { data } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });
      return data;
    }
  });

  if (isLoading) return <Skeleton />;
  if (error) return <Alert variant="destructive">{error.message}</Alert>;

  return <div>{resources?.map(r => <ResourceCard key={r.id} {...r} />)}</div>;
};
```

**Pattern 2: Form Components**
```typescript
// Pattern: React Hook Form + Zod + Server mutation

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional()
});

const SignupForm = () => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema)
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      return await supabase.from('email_captures').insert(data);
    },
    onSuccess: () => toast.success('Signed up!'),
    onError: (error) => toast.error(error.message)
  });

  return <Form {...form}><FormField ... /></Form>;
};
```

**Pattern 3: Layout Components**
```typescript
// Pattern: Slot-based composition

const PageLayout = ({ children, sidebar }) => (
  <div className="grid grid-cols-[240px_1fr]">
    <aside>{sidebar}</aside>
    <main>{children}</main>
  </div>
);

// Usage:
<PageLayout sidebar={<Navigation />}>
  <YourContent />
</PageLayout>
```

---

## 6. API & Integration Layer

### 6.1 Supabase Client Configuration

**Location:** `src/integrations/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

**Type Safety:** Auto-generated types from database schema
**Environment Variables:** Stored in `.env` (not committed)

### 6.2 Supabase Edge Functions

**Deployed Functions:**

1. **send-resource-email**
   - **Purpose:** Send resource download email after signup
   - **Trigger:** Called from EmailCaptureForm component
   - **Status:** ✅ Deployed
   - **Email Provider:** Resend API ready (needs API key configuration)

2. **trigger-webhooks**
   - **Purpose:** Fire webhooks to external services
   - **Events:** signup, view, download
   - **Status:** ✅ Deployed
   - **Features:** HMAC signature, retry logic

3. **schedule-email-sequences**
   - **Purpose:** Schedule drip campaign emails
   - **Trigger:** After signup if sequences exist
   - **Status:** ✅ Deployed
   - **Scheduling:** Uses pg_cron or delay mechanism

4. **process-scheduled-emails**
   - **Purpose:** Send queued emails from sequences
   - **Trigger:** Cron job (every 15 minutes)
   - **Status:** ✅ Deployed

**Location:** `supabase/functions/`

### 6.3 API Patterns

**Read Pattern (SELECT):**
```typescript
const { data, error } = await supabase
  .from('pages')
  .select('*, resources(*)')  // Join with resources
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

**Write Pattern (INSERT):**
```typescript
const { data, error } = await supabase
  .from('email_captures')
  .insert({
    page_id: pageId,
    email: formData.email,
    name: formData.name,
    download_token: crypto.randomUUID()
  })
  .select()
  .single();
```

**Update Pattern:**
```typescript
const { error } = await supabase
  .from('pages')
  .update({ published: true, published_at: new Date().toISOString() })
  .eq('id', pageId);
```

**File Upload Pattern:**
```typescript
const filePath = `${userId}/${resourceId}/${file.name}`;
const { data, error } = await supabase.storage
  .from('resources')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false
  });

// Get public URL
const { data: urlData } = supabase.storage
  .from('resources')
  .getPublicUrl(filePath);
```

### 6.4 Integration Points

**Current Integrations:**
- ✅ Supabase Auth (email/password)
- ✅ Supabase Storage (resources bucket)
- ✅ Supabase Database (all CRUD operations)
- 🔶 Supabase Realtime (channel setup incomplete)
- 🔶 Resend Email API (configured but needs testing)

**Planned Integrations:**
- ❌ Stripe (payment processing)
- ❌ Zapier (webhook triggers)
- ❌ Google Analytics (privacy-friendly alternative preferred)
- ❌ Sentry (error tracking)

---

## 7. State Management

### 7.1 Server State (TanStack React Query)

**Configuration:** `src/App.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});
```

**Usage Pattern:**
```typescript
// Fetch data
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['resources', userId],
  queryFn: fetchResources,
  enabled: !!userId  // Only run if userId exists
});

// Mutate data
const mutation = useMutation({
  mutationFn: createResource,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resources'] });
    toast.success('Resource created!');
  }
});
```

**Benefits:**
- Automatic caching and deduplication
- Background refetching
- Optimistic updates
- Loading/error states handled

### 7.2 Local UI State (useState)

**Pattern:** Component-level state for UI interactions

```typescript
// Example: Modal visibility
const [isOpen, setIsOpen] = useState(false);

// Example: Form data
const [formData, setFormData] = useState({ title: '', description: '' });

// Example: Selected items
const [selectedResources, setSelectedResources] = useState<string[]>([]);
```

**Guidance:** Use useState for:
- Modal/dialog visibility
- Form inputs (when not using React Hook Form)
- UI toggles (dark mode, sidebar collapsed)
- Temporary selections

### 7.3 Global State (Minimal)

**Current Approach:** No Redux, no Context API for global state

**Authentication State:**
- Managed by Supabase Auth
- Session persisted in localStorage
- Retrieved with `supabase.auth.getUser()`

**Why No Global State?**
- Most data is server state (React Query handles it)
- Component composition handles prop drilling
- Authentication is handled by Supabase
- Keeps architecture simple and maintainable

**Future Consideration:** If state management becomes complex, consider Zustand (lightweight alternative to Redux)

---

## 8. Authentication & Security

### 8.1 Authentication Flow

**Provider:** Supabase Auth
**Method:** Email + Password (magic links planned)
**Session Management:** JWT tokens, 30-day expiry

**Signup Flow:**
```typescript
const { data, error } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      display_name: formData.name
    }
  }
});

// Auto-creates profile via database trigger
```

**Login Flow:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: formData.email,
  password: formData.password
});

// Session stored in localStorage
// JWT token in supabase.auth.session()
```

**Protected Routes:**
```typescript
// Pattern: Check auth state before rendering
const ProtectedRoute = ({ children }) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
};
```

**Implementation:** All `/dashboard/*` routes wrapped in auth check

### 8.2 Row Level Security (RLS)

**Enabled on all tables:** ✅ Yes

**Example Policies:**

```sql
-- Users can only see their own resources
CREATE POLICY "Users can view own resources"
  ON resources FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can view published pages
CREATE POLICY "Public can view published pages"
  ON pages FOR SELECT
  USING (published = true);

-- Users can only insert signups (no DELETE to prevent data loss)
CREATE POLICY "Anyone can insert signups"
  ON email_captures FOR INSERT
  WITH CHECK (true);
```

**Security Benefits:**
- Database-level security (can't bypass with API)
- Automatic enforcement across all queries
- No need for application-level permission checks

### 8.3 Security Best Practices

**Current Implementation:**

✅ **Environment Variables:** Sensitive keys in `.env`, not committed
✅ **RLS Enabled:** All tables protected
✅ **JWT Tokens:** Secure session management
✅ **HTTPS Only:** Supabase enforces HTTPS
✅ **Input Validation:** Zod schemas validate all form inputs
✅ **SQL Injection Prevention:** Parameterized queries via Supabase client

**Missing/Needs Improvement:**

⚠️ **Rate Limiting:** No rate limiting on signup endpoints (vulnerable to spam)
⚠️ **CAPTCHA:** No bot protection on public forms
⚠️ **Email Verification:** Users can sign up without verifying email
⚠️ **CORS Configuration:** Needs review for production
⚠️ **CSP Headers:** Content Security Policy not configured
⚠️ **Audit Logging:** No audit trail for sensitive operations

---

## 9. Performance & Optimization

### 9.1 Current Performance Metrics

**Build Performance:**
- **Build Time:** ~15-20 seconds (Vite production build)
- **Bundle Size:** Not measured (needs analysis)
- **Code Splitting:** Automatic with Vite

**Runtime Performance:**
- **Dashboard Load Time:** ~1-2 seconds (depends on data)
- **Page Render:** < 500ms
- **Database Queries:** Adequate for MVP, not optimized

### 9.2 Optimization Opportunities

**1. Code Splitting & Lazy Loading**
```typescript
// Current: All routes loaded upfront
// Opportunity: Lazy load dashboard routes

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));

<Routes>
  <Route path="/dashboard" element={<Suspense fallback={<Loading />}><Dashboard /></Suspense>} />
</Routes>
```

**Impact:** Reduce initial bundle size by ~30-40%

**2. Image Optimization**
- Current: Images served directly from Supabase Storage
- Opportunity: Generate thumbnails, use WebP format
- Impact: Faster page loads, reduced bandwidth

**3. Database Query Optimization**
```sql
-- Current: Separate queries for resources and pages
SELECT * FROM resources WHERE user_id = $1;
SELECT * FROM pages WHERE user_id = $1;

-- Optimized: Single query with joins
SELECT
  r.*,
  json_agg(p.*) as pages
FROM resources r
LEFT JOIN page_resources pr ON pr.resource_id = r.id
LEFT JOIN pages p ON p.id = pr.page_id
WHERE r.user_id = $1
GROUP BY r.id;
```

**Impact:** Reduce API calls, faster dashboard load

**4. Caching Strategy**
```typescript
// Opportunity: Cache public landing pages with Cloudflare
// Add cache headers to public page responses

// Edge function:
return new Response(html, {
  headers: {
    'Content-Type': 'text/html',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400'
  }
});
```

**Impact:** Instant page loads for visitors

### 9.3 Performance Monitoring

**Current:** ❌ No monitoring in place

**Recommended Tools:**
- **Lighthouse CI:** Automated performance audits
- **Sentry:** Error tracking + performance monitoring
- **Vercel Analytics:** Page load times (if using Vercel)
- **Supabase Dashboard:** Database query performance

---

## 10. Technical Debt & Opportunities

### 10.1 Immediate Technical Debt

**Priority 1 (High Impact, Quick Fix):**

1. **Onboarding Wizard Not Integrated**
   - Component exists but never shown
   - **Fix:** Add to App.tsx after signup redirect
   - **Effort:** 2-4 hours
   - **Impact:** Significantly improve new user activation

2. **Real-time Activity Feed Not Connected**
   - Component exists but Supabase Realtime not subscribed
   - **Fix:** Add `.on('postgres_changes', ...)` subscription
   - **Effort:** 2-3 hours
   - **Impact:** Adds "wow factor" to dashboard

3. **No Error Boundary**
   - App crashes show white screen
   - **Fix:** Add React Error Boundary component
   - **Effort:** 1-2 hours
   - **Impact:** Better error handling, user trust

4. **Missing Loading States**
   - Some pages don't show loading spinners
   - **Fix:** Add Skeleton components to all data-fetching pages
   - **Effort:** 3-4 hours
   - **Impact:** Better perceived performance

**Priority 2 (Medium Impact):**

5. **No CSV Export**
   - Analytics dashboard lacks export functionality
   - **Effort:** 4-6 hours
   - **Impact:** Data portability, GDPR compliance

6. **Token-Based Downloads Not Enforced**
   - Using direct Supabase URLs instead of token verification
   - **Effort:** 6-8 hours
   - **Impact:** Better download tracking, security

7. **No Preview Mode for Pages**
   - Can't see page before publishing
   - **Effort:** 3-4 hours
   - **Impact:** UX improvement, reduce publish mistakes

8. **Bundle Size Not Optimized**
   - No code splitting beyond default Vite
   - **Effort:** 4-6 hours (route-based splitting)
   - **Impact:** Faster initial load

### 10.2 Architectural Improvements

**Opportunity 1: Move to Next.js App Router**
- **Current:** Vite + React Router (client-side only)
- **Benefit:** SSR for landing pages (better SEO), API routes (no Edge Functions)
- **Effort:** 2-3 days (significant refactor)
- **Recommendation:** Consider for v2, not worth it now

**Opportunity 2: Implement Request Batching**
- **Current:** Multiple separate API calls on dashboard load
- **Benefit:** Single roundtrip for related data
- **Effort:** 1-2 days
- **Recommendation:** Do this when performance becomes issue

**Opportunity 3: Add Search Functionality**
- **Current:** No search in resource/page lists
- **Benefit:** Better UX as users scale up
- **Effort:** 1-2 days (full-text search in Postgres)
- **Recommendation:** Add after 100+ users

### 10.3 Code Quality Improvements

**Linting & Formatting:**
```bash
# Current: ESLint configured, but not enforced in CI
# Recommendation: Add pre-commit hooks

npm install --save-dev husky lint-staged
npx husky install

# .husky/pre-commit
npm run lint && npm run type-check
```

**Testing:**
```bash
# Current: No tests
# Recommendation: Start with critical path tests

# Install Vitest + Testing Library
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Priority test coverage:
# 1. EmailCaptureForm (critical business logic)
# 2. Page builder form validation
# 3. Authentication flows
```

**TypeScript Strictness:**
```typescript
// Current: TypeScript strict mode enabled ✅
// Opportunity: Add stricter rules in tsconfig.json

{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,  // Add this
    "noUnusedLocals": true,            // Add this
    "noUnusedParameters": true         // Add this
  }
}
```

---

## 11. Growth Opportunities

### 11.1 Feature Expansion Opportunities

**Near-Term (Next 30 Days):**

1. **Complete Monetization (Stripe Integration)**
   - **Business Impact:** Start generating revenue
   - **Effort:** 5-7 days
   - **Components Needed:**
     - Stripe Checkout integration
     - Webhook handler for subscription events
     - Plan limit enforcement
     - Upgrade prompts in UI

2. **GDPR Compliance Package**
   - Cookie consent banner
   - Data export functionality
   - Data deletion flow
   - **Business Impact:** Required for EU customers
   - **Effort:** 3-4 days

3. **Email Template Customization**
   - Visual email builder
   - Variable support ({name}, {resource_title})
   - Preview before send
   - **Business Impact:** Higher perceived value
   - **Effort:** 4-5 days

**Medium-Term (Next 90 Days):**

4. **Mobile App (React Native)**
   - View analytics on mobile
   - Respond to signups
   - Share resources quickly
   - **Business Impact:** Increase engagement
   - **Effort:** 3-4 weeks

5. **AI-Powered Features**
   - Auto-generate page headlines from resource title
   - Suggest email subject lines
   - Optimize page copy for conversions
   - **Business Impact:** Differentiation, higher conversion
   - **Effort:** 2-3 weeks (using OpenAI API)

6. **Advanced Analytics**
   - Geographic heat maps
   - Conversion funnel visualization
   - Cohort analysis
   - **Business Impact:** Pro plan upsell
   - **Effort:** 2-3 weeks

### 11.2 Scalability Improvements

**Database Optimization:**
```sql
-- Current: Simple queries, no materialized views
-- Opportunity: Create materialized views for analytics

CREATE MATERIALIZED VIEW daily_analytics AS
SELECT
  page_id,
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE event_type = 'view') as views,
  COUNT(*) FILTER (WHERE event_type = 'signup') as signups
FROM analytics_events
GROUP BY page_id, DATE(created_at);

-- Refresh daily via cron
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_analytics;
```

**Impact:** 10x faster analytics queries at scale

**Caching Layer:**
```typescript
// Opportunity: Add Redis cache for frequently accessed data

// Example: Cache public page data
const getPublicPage = async (slug: string) => {
  // Check cache first
  const cached = await redis.get(`page:${slug}`);
  if (cached) return JSON.parse(cached);

  // Fetch from database
  const page = await supabase.from('pages').select('*').eq('slug', slug).single();

  // Cache for 1 hour
  await redis.set(`page:${slug}`, JSON.stringify(page), 'EX', 3600);

  return page;
};
```

**Impact:** Reduce database load by 80% for public pages

### 11.3 Market Expansion Opportunities

**1. Templates Marketplace**
- User-contributed templates
- Premium templates ($5-20 each)
- Revenue share with creators
- **Effort:** 3-4 weeks
- **Revenue Potential:** $500-2000/month

**2. White-Label Solution**
- Remove all ShareKit branding
- Custom domain + email sending domain
- API access for embedding
- **Pricing:** $199-499/month
- **Target:** Agencies, course platforms
- **Effort:** 2-3 weeks

**3. Affiliate Program**
- Give $20, Get $20 credit
- Dashboard for tracking referrals
- Automatic payouts via PayPal/Stripe
- **Growth Potential:** 30-40% of new signups via referrals
- **Effort:** 1-2 weeks

### 11.4 Integration Opportunities

**High-Value Integrations:**

1. **ConvertKit/Mailchimp Integration**
   - Auto-sync email captures to their lists
   - **Value:** Keep their existing email provider
   - **Effort:** 1 week per integration

2. **Teachable/Thinkific Integration**
   - Share course resources via ShareKit
   - Embed on course platform
   - **Value:** Tap into course creator market
   - **Effort:** 2 weeks per integration

3. **Zapier Official Integration**
   - Triggers: New signup, new download
   - Actions: Create resource, update page
   - **Value:** Connect to 5000+ apps
   - **Effort:** 2-3 weeks (Zapier certification process)

4. **Canva Integration**
   - Create resource covers in Canva
   - Export directly to ShareKit
   - **Value:** Designer-friendly workflow
   - **Effort:** 2-3 weeks (Canva API)

---

## 12. Deployment & Infrastructure

### 12.1 Current Deployment

**Platform:** Lovable.dev
**Underlying Infrastructure:** Cloudflare Pages (auto-detected from docs)
**Domain:** sharekit-prd-playbook.lovable.app
**Build Command:** `npm run build`
**Output Directory:** `dist/`

**Environment Variables (Production):**
```bash
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (public anon key)
```

### 12.2 Recommended Infrastructure (Future)

**For Production Launch:**

```
┌─────────────────────────────────────────────────┐
│              Cloudflare (DNS + CDN)             │
│          sharekit.net → 1.1.1.1                 │
└─────────────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────┐
│        Vercel / Cloudflare Pages (Frontend)     │
│        - Static site generation                 │
│        - Edge functions                         │
│        - Automatic deployments                  │
└─────────────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────┐
│              Supabase (Backend)                 │
│        - PostgreSQL database                    │
│        - Authentication                         │
│        - Storage                                │
│        - Edge Functions                         │
└─────────────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────┐
│           Third-Party Services                  │
│        - Resend (email)                         │
│        - Stripe (payments)                      │
│        - Sentry (error tracking)                │
└─────────────────────────────────────────────────┘
```

### 12.3 CI/CD Pipeline

**Current:** Manual deployments via Lovable.dev UI

**Recommended GitHub Actions Workflow:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 12.4 Monitoring & Observability

**Current:** ❌ No monitoring

**Recommended Setup:**

1. **Sentry (Error Tracking)**
```typescript
// src/lib/sentry.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
});
```

2. **Plausible Analytics (Privacy-Friendly)**
```html
<!-- index.html -->
<script defer data-domain="sharekit.net" src="https://plausible.io/js/script.js"></script>
```

3. **Better Uptime (Status Page)**
- Monitor: API endpoints, Supabase, Email delivery
- Status page: status.sharekit.net
- Incident alerts via Slack/email

---

## 13. Testing Strategy

### 13.1 Current Testing Status

**Unit Tests:** ❌ None
**Integration Tests:** ❌ None
**E2E Tests:** ❌ None
**Manual Testing:** ✅ Ongoing during development

### 13.2 Recommended Testing Approach

**Priority 1: Critical Path Tests**

```typescript
// tests/email-capture.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmailCaptureForm } from '@/components/EmailCaptureForm';

describe('EmailCaptureForm', () => {
  it('submits valid email successfully', async () => {
    render(<EmailCaptureForm pageId="test-page" />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /get access/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/check your inbox/i)).toBeInTheDocument();
    });
  });

  it('shows error for invalid email', async () => {
    render(<EmailCaptureForm pageId="test-page" />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });
});
```

**Priority 2: E2E Tests (Playwright)**

```typescript
// e2e/signup-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete signup and resource delivery flow', async ({ page }) => {
  // 1. Navigate to public page
  await page.goto('/p/test-resource');

  // 2. Fill email form
  await page.fill('input[type="email"]', 'test@example.com');
  await page.click('button:has-text("Get Access")');

  // 3. Verify success message
  await expect(page.locator('text=Check your inbox')).toBeVisible();

  // 4. Check database (via API)
  const response = await page.request.get('/api/test/email-captures');
  const data = await response.json();
  expect(data).toContainEqual(
    expect.objectContaining({ email: 'test@example.com' })
  );
});
```

### 13.3 Testing Tools Recommendation

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@playwright/test": "^1.40.0"
  }
}
```

**Test Coverage Goals:**
- **Critical paths:** 80%+ coverage (auth, email capture, payment)
- **UI components:** 60%+ coverage
- **Utility functions:** 90%+ coverage

---

## 14. Development Workflow

### 14.1 Git Branching Strategy

**Current Approach:** Feature branches merged to main

```
main (production)
  ├── feature/onboarding-wizard
  ├── feature/stripe-integration
  ├── bugfix/sidebar-styling
  └── claude/* (AI-generated branches)
```

**Recommended:** Git Flow

```
main (production, always deployable)
  ↓
develop (integration branch)
  ├── feature/onboarding-wizard
  ├── feature/stripe-integration
  └── bugfix/email-delivery
```

### 14.2 Commit Message Convention

**Current:** Inconsistent
**Recommended:** Conventional Commits

```bash
# Format
<type>(<scope>): <subject>

# Examples
feat(auth): add magic link login
fix(email): retry failed deliveries
docs(readme): update installation steps
refactor(dashboard): extract stats component
test(email): add capture form tests
```

### 14.3 Code Review Checklist

```markdown
## Pre-Merge Checklist

- [ ] Code follows TypeScript best practices
- [ ] No console.log() or debugging code
- [ ] Error handling in place
- [ ] Loading states for async operations
- [ ] Mobile-responsive (tested on small screen)
- [ ] Accessibility: keyboard navigation works
- [ ] No new ESLint warnings
- [ ] Environment variables documented
- [ ] Database migrations included (if needed)
- [ ] Tests added for new features
```

### 14.4 Local Development Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd sharekit-prd-playbook

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Run development server
npm run dev

# 5. Access locally
# http://localhost:5173
```

**Required Environment Variables:**
```bash
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 15. Key Decisions & Rationale

### 15.1 Why Vite over Next.js?

**Decision:** Use Vite + React Router instead of Next.js
**Rationale:**
- Faster development experience (HMR)
- Simpler deployment (static site)
- Supabase handles backend (don't need Next.js API routes)
- Lovable.dev platform optimized for Vite

**Trade-offs:**
- ❌ No SSR (worse initial SEO)
- ❌ No API routes (using Edge Functions instead)
- ✅ Faster builds
- ✅ Simpler mental model

**Recommendation:** Consider Next.js for v2 when SEO becomes critical

### 15.2 Why Supabase over Custom Backend?

**Decision:** Use Supabase (BaaS) instead of custom Node.js/Express backend
**Rationale:**
- Faster development (auth, storage, database included)
- Built-in Row Level Security
- Realtime subscriptions out of the box
- Generous free tier
- PostgreSQL (can migrate off later if needed)

**Trade-offs:**
- ❌ Vendor lock-in (mitigated: PostgreSQL is portable)
- ❌ Limited customization of auth flow
- ✅ 10x faster development
- ✅ Production-ready infrastructure

### 15.3 Why shadcn/ui over Material-UI?

**Decision:** Use shadcn/ui instead of Material-UI or Chakra UI
**Rationale:**
- Copy-paste components (full ownership)
- Built on Radix UI (accessible by default)
- Tailwind-based (consistent with design system)
- No runtime dependency (smaller bundle)

**Trade-offs:**
- ❌ No component library updates (must update manually)
- ✅ Full customization
- ✅ Smaller bundle size
- ✅ Tailwind consistency

---

## 16. Conclusion & Next Steps

### 16.1 Current State Summary

**Strengths:**
- ✅ Solid technical foundation (React + TypeScript + Supabase)
- ✅ Core MVP features working (60-70% complete)
- ✅ Modern, maintainable codebase
- ✅ Scalable database schema
- ✅ Good component architecture

**Weaknesses:**
- ⚠️ No testing infrastructure
- ⚠️ Missing monetization (Stripe not integrated)
- ⚠️ Incomplete features (onboarding, realtime, etc.)
- ⚠️ No performance monitoring
- ⚠️ GDPR compliance gaps

### 16.2 Recommended Priorities (Next 30 Days)

**Week 1: Complete Core Features**
1. Integrate OnboardingWizard into signup flow
2. Connect RealtimeActivityFeed to Supabase
3. Implement CSV export for analytics
4. Add error boundaries and loading states

**Week 2: Stripe Integration**
5. Set up Stripe products (Free/Pro/Business)
6. Implement Stripe Checkout
7. Handle webhook events (subscription.created, etc.)
8. Enforce plan limits

**Week 3: Polish & Compliance**
9. Add GDPR cookie consent banner
10. Implement data export/deletion
11. Add comprehensive error tracking (Sentry)
12. Performance audit with Lighthouse

**Week 4: Testing & Launch Prep**
13. Write tests for critical paths
14. Set up CI/CD pipeline
15. Create production deployment
16. Prepare launch materials

### 16.3 Long-Term Vision

**3-Month Goals:**
- 100 paying customers
- 95%+ uptime
- <2s page load times
- 80% test coverage on critical paths

**6-Month Goals:**
- Advanced features: A/B testing, custom domains, email sequences
- Mobile app (React Native)
- Zapier integration
- 300-500 paying customers

**12-Month Goals:**
- Templates marketplace
- White-label solution
- AI-powered features
- International expansion (multi-language)

---

## Appendix

### A. Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking

# Database
supabase migration new <name>  # Create new migration
supabase db reset              # Reset local database
supabase gen types typescript  # Generate TypeScript types
```

### B. Key File Locations

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main routing and providers |
| `src/integrations/supabase/client.ts` | Supabase client |
| `src/integrations/supabase/types.ts` | Generated database types |
| `src/components/DashboardLayout.tsx` | Dashboard shell |
| `src/components/EmailCaptureForm.tsx` | Email signup form |
| `supabase/migrations/` | Database migrations |
| `package.json` | Dependencies and scripts |

### C. External Resources

- **Supabase Docs:** https://supabase.com/docs
- **React Query Docs:** https://tanstack.com/query/latest
- **shadcn/ui Docs:** https://ui.shadcn.com
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **PRD Document:** `/PRD.md`

---

**Document Maintained By:** Development Team
**Next Review Date:** December 11, 2025
**Questions/Updates:** Create GitHub issue or update this doc directly

🚀 **This is a living document - update as the system evolves!**
