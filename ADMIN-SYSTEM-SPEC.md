# ShareKit Admin System Specification

**Document Version:** 1.0  
**Created:** November 12, 2025  
**Status:** Design Phase  
**Integration:** Complements existing ShareKit platform

---

## Executive Summary

The ShareKit Admin System provides platform administrators with comprehensive tools for monitoring, moderating, managing, and growing the platform. This system operates separately from user-facing features while maintaining tight integration with core platform data.

**Core Capabilities:**
- Real-time platform monitoring and health metrics
- User and content moderation tools
- Platform configuration and feature flags
- Content management (blog, marketing, docs)
- Analytics and business intelligence
- Support ticket management
- Financial and subscription oversight

---

## Table of Contents

1. [Admin Architecture](#1-admin-architecture)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Dashboard Overview](#3-dashboard-overview)
4. [Platform Monitoring](#4-platform-monitoring)
5. [User Management](#5-user-management)
6. [Content Moderation](#6-content-moderation)
7. [Subscription Management](#7-subscription-management)
8. [Support System](#8-support-system)
9. [Content Management](#9-content-management)
10. [Marketing Tools](#10-marketing-tools)
11. [Analytics & Reporting](#11-analytics--reporting)
12. [System Configuration](#12-system-configuration)
13. [Technical Implementation](#13-technical-implementation)

---

## 1. Admin Architecture

### 1.1 Access Structure

```
/admin (Protected Route - Admins Only)
├── /dashboard              # Overview metrics
├── /monitoring             # System health
├── /users                  # User management
├── /content                # Content moderation
├── /subscriptions          # Billing oversight
├── /support                # Customer support
├── /cms                    # Content management
├── /marketing              # Marketing tools
├── /analytics              # Business intelligence
└── /settings               # Platform configuration
```

### 1.2 Admin Roles

**Super Admin (Level 5)**
- Full system access
- Platform configuration
- Admin user management
- Financial data access

**Admin (Level 4)**
- User management
- Content moderation
- Support management
- Analytics access

**Support Manager (Level 3)**
- Support ticket handling
- Basic user management
- Read-only analytics

**Content Manager (Level 2)**
- CMS access
- Blog/marketing content
- Help center management

**Read-Only (Level 1)**
- View-only access to dashboards
- Analytics viewing
- No modification rights

### 1.3 Database Schema Additions

```sql
-- ADMIN USERS TABLE
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'support_manager', 'content_manager', 'read_only')),
  permissions JSONB DEFAULT '{}',
  last_login_at TIMESTAMPTZ,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ADMIN ACTIVITY LOG
CREATE TABLE admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admin_users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FEATURE FLAGS TABLE
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  rules JSONB,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPORT TICKETS TABLE
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES admin_users(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category TEXT CHECK (category IN ('billing', 'technical', 'feature', 'bug', 'account', 'other')),
  metadata JSONB,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPORT TICKET MESSAGES
CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  is_admin BOOLEAN DEFAULT false,
  message TEXT NOT NULL,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BLOG POSTS TABLE
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES admin_users(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HELP CENTER ARTICLES
CREATE TABLE help_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES admin_users(id),
  order_index INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SYSTEM METRICS (Time-series data)
CREATE TABLE system_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL NOT NULL,
  dimensions JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- MODERATION QUEUE
CREATE TABLE moderation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('resource', 'page', 'user', 'signup')),
  resource_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'escalated')),
  reviewed_by UUID REFERENCES admin_users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLATFORM ANNOUNCEMENTS
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'free', 'pro', 'business')),
  active BOOLEAN DEFAULT true,
  dismissible BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX idx_admin_activity_log_created_at ON admin_activity_log(created_at);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_help_articles_category ON help_articles(category);
CREATE INDEX idx_system_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX idx_moderation_queue_status ON moderation_queue(status);
```

---

## 2. Authentication & Authorization

### 2.1 Admin Access Control

**Access Method:**
```typescript
// Middleware: /src/middleware/adminAuth.ts
export async function adminAuthMiddleware(req: Request) {
  const user = await getUser(req);
  
  if (!user) {
    return redirect('/admin/login');
  }
  
  const adminUser = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single();
    
  if (!adminUser) {
    return error('Unauthorized', 403);
  }
  
  // Check role-based access
  const requiredRole = getRequiredRole(req.path);
  if (!hasPermission(adminUser.role, requiredRole)) {
    return error('Insufficient permissions', 403);
  }
  
  // Log admin activity
  await logAdminActivity({
    admin_id: adminUser.id,
    action: 'page_view',
    resource_type: 'admin_page',
    metadata: { path: req.path }
  });
  
  return next();
}
```

### 2.2 Permission Matrix

```typescript
const ROLE_PERMISSIONS = {
  super_admin: ['*'], // All permissions
  
  admin: [
    'users.view', 'users.edit', 'users.delete',
    'content.view', 'content.moderate',
    'subscriptions.view', 'subscriptions.manage',
    'support.view', 'support.manage',
    'analytics.view',
    'cms.view', 'cms.edit'
  ],
  
  support_manager: [
    'users.view',
    'support.view', 'support.manage',
    'analytics.view'
  ],
  
  content_manager: [
    'cms.view', 'cms.edit', 'cms.publish',
    'help.view', 'help.edit', 'help.publish'
  ],
  
  read_only: [
    'dashboard.view',
    'analytics.view'
  ]
};
```

---

## 3. Dashboard Overview

### 3.1 Main Admin Dashboard

```typescript
// /admin/dashboard/page.tsx

interface AdminDashboardData {
  platformHealth: {
    status: 'healthy' | 'degraded' | 'critical';
    uptime: number;
    responseTime: number;
    errorRate: number;
  };
  
  userMetrics: {
    totalUsers: number;
    activeUsers: number; // Last 30 days
    newUsersToday: number;
    newUsersThisWeek: number;
    churnRate: number;
  };
  
  revenueMetrics: {
    mrr: number;
    mrrGrowth: number; // Percentage
    arr: number;
    totalRevenue: number;
    revenueToday: number;
  };
  
  subscriptionBreakdown: {
    free: number;
    pro: number;
    business: number;
  };
  
  contentMetrics: {
    totalResources: number;
    totalPages: number;
    totalSignups: number; // End users
    totalDownloads: number;
  };
  
  supportMetrics: {
    openTickets: number;
    avgResponseTime: number; // Hours
    satisfaction: number; // Percentage
    ticketsToday: number;
  };
  
  moderationQueue: {
    pendingItems: number;
    flaggedUsers: number;
    flaggedContent: number;
  };
}
```

**Dashboard UI Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  ShareKit Admin                    [Last Updated: 2s ago]    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Platform Health: ● Healthy                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ Uptime      │ │ Resp. Time  │ │ Error Rate  │            │
│  │ 99.97%      │ │ 124ms       │ │ 0.02%       │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                               │
│  Quick Stats                                                 │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐      │
│  │ Active Users  │ │ MRR           │ │ Open Tickets  │      │
│  │ 324           │ │ $4,850        │ │ 12            │      │
│  │ ↑ 8% this wk  │ │ ↑ 14%         │ │ ⚠ 3 urgent     │      │
│  └───────────────┘ └───────────────┘ └───────────────┘      │
│                                                               │
│  📊 Revenue Trend (Last 30 Days)                             │
│  [Line chart showing daily MRR]                              │
│                                                               │
│  🚨 Alerts & Actions Required                                │
│  • 3 urgent support tickets need attention                   │
│  • 8 items in moderation queue                               │
│  • Stripe webhook failed 2x today (investigate)              │
│                                                               │
│  📈 Recent Activity                                          │
│  • New user signup: sarah@example.com (Pro plan)             │
│  • Subscription canceled: john@example.com                   │
│  • Support ticket #1234 resolved                             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Platform Monitoring

### 4.1 System Health Monitor

**Real-time Metrics Dashboard:**

```typescript
interface SystemHealthMetrics {
  infrastructure: {
    supabase: {
      status: 'operational' | 'degraded' | 'down';
      dbConnections: number;
      queryLatency: number; // ms
      storageUsed: number; // GB
    };
    
    vercel: {
      status: 'operational' | 'degraded' | 'down';
      deploymentStatus: string;
      edgeFunctions: {
        active: number;
        failed: number;
      };
    };
    
    stripe: {
      status: 'operational' | 'degraded' | 'down';
      webhooksProcessed: number;
      webhooksFailed: number;
    };
    
    resend: {
      status: 'operational' | 'degraded' | 'down';
      emailsSent: number;
      bounceRate: number;
      deliveryRate: number;
    };
  };
  
  application: {
    errorRate: number;
    avgResponseTime: number;
    slowQueries: Array<{
      query: string;
      duration: number;
      count: number;
    }>;
    
    apiEndpoints: Array<{
      path: string;
      requests: number;
      errors: number;
      avgLatency: number;
    }>;
  };
  
  usage: {
    fileStorage: {
      used: number; // GB
      total: number; // GB
      largestFiles: Array<{
        filename: string;
        size: number;
        user: string;
      }>;
    };
    
    bandwidth: {
      total: number; // GB this month
      cdn: number;
      api: number;
    };
    
    database: {
      size: number; // GB
      tablesBySize: Array<{
        table: string;
        size: number;
        rowCount: number;
      }>;
    };
  };
}
```

**Monitoring UI:**
```
┌──────────────────────────────────────────────────────────────┐
│  System Health Monitor                                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Infrastructure Status                                       │
│  ✅ Supabase      Operational    DB: 45ms    99.98% uptime   │
│  ✅ Vercel        Operational    Edge: 32ms                  │
│  ✅ Stripe        Operational    0 failed webhooks           │
│  ⚠️  Resend        Degraded      Bounce rate: 3.2%           │
│                                                               │
│  Application Performance                                     │
│  [Real-time chart: Response times]                           │
│  Avg: 124ms    P95: 342ms    P99: 1.2s                       │
│                                                               │
│  Slow Queries (>1s)                                          │
│  • SELECT * FROM analytics_events... (1.4s, 23 times)        │
│  • Complex join on pages + resources (2.1s, 5 times)         │
│                                                               │
│  Error Log (Last Hour)                                       │
│  • 2x 500 errors on /api/resources/upload                    │
│  • 1x Stripe webhook timeout                                 │
│                                                               │
│  Resource Usage                                              │
│  Storage: 42.3 GB / 100 GB (42%)                             │
│  Bandwidth: 128 GB this month                                │
│  DB Size: 2.1 GB (largest: analytics_events)                 │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Alert Configuration

```typescript
interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals';
  threshold: number;
  duration: number; // minutes
  severity: 'info' | 'warning' | 'critical';
  notifyChannels: Array<'email' | 'slack' | 'sms'>;
  enabled: boolean;
}

// Example alerts
const DEFAULT_ALERTS: AlertRule[] = [
  {
    id: 'high_error_rate',
    name: 'High Error Rate',
    metric: 'error_rate',
    condition: 'greater_than',
    threshold: 1, // 1%
    duration: 5,
    severity: 'critical',
    notifyChannels: ['email', 'slack'],
    enabled: true
  },
  {
    id: 'slow_response',
    name: 'Slow Response Times',
    metric: 'avg_response_time',
    condition: 'greater_than',
    threshold: 500, // 500ms
    duration: 10,
    severity: 'warning',
    notifyChannels: ['slack'],
    enabled: true
  },
  {
    id: 'storage_capacity',
    name: 'Storage Near Capacity',
    metric: 'storage_used_percent',
    condition: 'greater_than',
    threshold: 85,
    duration: 60,
    severity: 'warning',
    notifyChannels: ['email'],
    enabled: true
  }
];
```

---

## 5. User Management

### 5.1 User Search & Filtering

```typescript
interface UserManagementFilters {
  searchQuery?: string; // Email, name, username
  plan?: 'free' | 'pro' | 'business';
  status?: 'active' | 'inactive' | 'suspended';
  signupDateRange?: { start: Date; end: Date };
  hasSubscription?: boolean;
  resourceCount?: { min: number; max: number };
  signupCount?: { min: number; max: number };
  lastActiveRange?: { start: Date; end: Date };
}

interface UserListItem {
  id: string;
  email: string;
  displayName: string;
  username: string;
  plan: string;
  subscriptionStatus: string;
  resourceCount: number;
  pageCount: number;
  totalSignups: number; // End users who downloaded
  mrr: number;
  signedUpAt: Date;
  lastActiveAt: Date;
  flags: Array<'suspended' | 'flagged' | 'verified' | 'vip'>;
}
```

**User List UI:**
```
┌──────────────────────────────────────────────────────────────┐
│  User Management                                             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  [Search: Email, name, username]  [Filters ▾]  [Export CSV]  │
│                                                               │
│  Filters Active: Plan: Pro, Signed up: Last 30 days          │
│  [Clear Filters]                                             │
│                                                               │
│  Found 127 users                                             │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ sarah@example.com                                      │  │
│  │ Sarah Johnson                    @sarah-coach          │  │
│  │ Pro • $19/mo • 3 resources • 127 signups              │  │
│  │ Joined: Oct 15, 2025            Last active: 2h ago   │  │
│  │ [View Details] [Impersonate] [Suspend] [...]          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ mike@example.com                           🚩 Flagged  │  │
│  │ Mike Thompson                    @mike-dev             │  │
│  │ Pro • $19/mo • 12 resources • 43 signups              │  │
│  │ Joined: Oct 10, 2025            Last active: 5d ago   │  │
│  │ [View Details] [Impersonate] [Suspend] [...]          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  [Load More]                                                 │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 User Detail View

```typescript
interface UserDetailView {
  profile: {
    id: string;
    email: string;
    displayName: string;
    username: string;
    bio: string;
    websiteUrl: string;
    avatarUrl: string;
    signedUpAt: Date;
    emailVerified: boolean;
    onboardingCompleted: boolean;
  };
  
  subscription: {
    plan: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    stripeCustomerId: string;
    mrr: number;
    totalRevenue: number;
    lifetimeValue: number;
  };
  
  usage: {
    resourceCount: number;
    pageCount: number;
    signupsThisMonth: number;
    signupsTotal: number;
    storageUsed: number; // MB
    monthlySignupLimit: number;
  };
  
  activity: {
    lastLoginAt: Date;
    loginCount: number;
    resourcesCreated: number;
    pagesPublished: number;
    avgSessionDuration: number; // minutes
  };
  
  moderation: {
    flags: string[];
    moderationNotes: string;
    suspendedAt?: Date;
    suspensionReason?: string;
  };
  
  support: {
    ticketCount: number;
    openTickets: number;
    avgResponseTime: number;
    satisfactionRating: number;
  };
}
```

**User Actions:**
- View full profile
- Impersonate user (for support debugging)
- Edit user details
- Reset password
- Suspend account
- Delete account (with confirmation)
- Add internal notes
- View activity timeline
- Refund subscription
- Change subscription plan

---

## 6. Content Moderation

### 6.1 Moderation Queue

```typescript
interface ModerationItem {
  id: string;
  type: 'resource' | 'page' | 'user' | 'signup';
  resourceId: string;
  userId: string;
  userName: string;
  userEmail: string;
  reason: string;
  flaggedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  priority: 'low' | 'medium' | 'high';
  
  // Content preview
  preview: {
    title?: string;
    description?: string;
    imageUrl?: string;
    fileUrl?: string;
  };
  
  // Context
  userHistory: {
    previousFlags: number;
    accountAge: number; // days
    subscriptionStatus: string;
  };
}
```

**Moderation UI:**
```
┌──────────────────────────────────────────────────────────────┐
│  Moderation Queue                                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  [All] [Resources] [Pages] [Users] [Signups]                 │
│  [Pending: 8] [Escalated: 2] [Today: 12]                     │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🚩 HIGH PRIORITY                                        │  │
│  │                                                         │  │
│  │ Resource: "Get Rich Quick Guide.pdf"                   │  │
│  │ By: john@example.com (Free plan, 2 days old)           │  │
│  │ Flagged: Spam/Scam keywords detected                   │  │
│  │ Flagged: 15 minutes ago                                │  │
│  │                                                         │  │
│  │ [Preview File] [View User]                             │  │
│  │                                                         │  │
│  │ Actions:                                               │  │
│  │ [✅ Approve] [❌ Reject] [⚠️ Escalate] [Add Note]       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Page: "Free Money Landing Page"                        │  │
│  │ By: sarah@example.com (Pro plan, 45 days old)          │  │
│  │ Flagged: Suspicious conversion rate (85%)              │  │
│  │ Flagged: 2 hours ago                                   │  │
│  │                                                         │  │
│  │ [View Page] [View User] [View Analytics]               │  │
│  │                                                         │  │
│  │ [✅ Approve] [❌ Reject] [⚠️ Escalate] [Add Note]       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Auto-Moderation Rules

```typescript
interface ModerationRule {
  id: string;
  name: string;
  type: 'resource' | 'page' | 'user' | 'signup';
  enabled: boolean;
  action: 'flag' | 'block' | 'suspend';
  priority: 'low' | 'medium' | 'high';
  
  conditions: {
    keywordMatch?: string[];
    fileType?: string[];
    fileSize?: { min?: number; max?: number };
    accountAge?: { lessThan: number }; // days
    signupRate?: { moreThan: number; within: number }; // signups per hour
    conversionRate?: { moreThan: number }; // percentage
    domainBlacklist?: string[];
  };
}

// Example rules
const AUTO_MODERATION_RULES: ModerationRule[] = [
  {
    id: 'spam_keywords',
    name: 'Spam/Scam Keywords',
    type: 'resource',
    enabled: true,
    action: 'flag',
    priority: 'high',
    conditions: {
      keywordMatch: [
        'get rich quick',
        'make money fast',
        'guaranteed income',
        'MLM',
        'pyramid scheme'
      ]
    }
  },
  {
    id: 'suspicious_files',
    name: 'Suspicious File Types',
    type: 'resource',
    enabled: true,
    action: 'block',
    priority: 'high',
    conditions: {
      fileType: ['.exe', '.bat', '.sh', '.scr']
    }
  },
  {
    id: 'new_user_high_volume',
    name: 'New User High Signup Volume',
    type: 'user',
    enabled: true,
    action: 'flag',
    priority: 'medium',
    conditions: {
      accountAge: { lessThan: 7 },
      signupRate: { moreThan: 100, within: 24 }
    }
  },
  {
    id: 'suspicious_conversion',
    name: 'Abnormally High Conversion',
    type: 'page',
    enabled: true,
    action: 'flag',
    priority: 'medium',
    conditions: {
      conversionRate: { moreThan: 75 }
    }
  }
];
```

### 6.3 Bulk Moderation Actions

- Approve selected items
- Reject selected items
- Suspend multiple users
- Delete flagged content
- Add to auto-block list
- Export moderation report

---

## 7. Subscription Management

### 7.1 Subscription Overview Dashboard

```typescript
interface SubscriptionMetrics {
  overview: {
    totalMRR: number;
    mrrGrowth: number; // Percentage
    totalARR: number;
    newMRR: number; // This month
    churnedMRR: number; // This month
    netNewMRR: number;
  };
  
  planBreakdown: {
    free: {
      count: number;
      percentage: number;
    };
    pro: {
      count: number;
      mrr: number;
      avgLifetime: number; // months
    };
    business: {
      count: number;
      mrr: number;
      avgLifetime: number;
    };
  };
  
  billing: {
    collectionsThisMonth: number;
    failedPayments: number;
    refundsIssued: number;
    dunningInProgress: number;
  };
  
  churn: {
    monthlyChurnRate: number;
    canceledThisMonth: number;
    cancelReasons: Record<string, number>;
    avgLifetime: number; // months before canceling
  };
}
```

**Subscription Dashboard UI:**
```
┌──────────────────────────────────────────────────────────────┐
│  Subscription Management                                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Revenue Overview                                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ MRR         │ │ ARR         │ │ Growth      │            │
│  │ $4,850      │ │ $58,200     │ │ +14%        │            │
│  │ ↑ $650      │ │             │ │ this month  │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                               │
│  📊 MRR Breakdown                                            │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Free: 423 (60%)         $0                           │    │
│  │ Pro: 247 (35%)          $4,693                       │    │
│  │ Business: 35 (5%)       $1,715                       │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  🚨 Action Required                                          │
│  • 12 failed payments (retry in progress)                    │
│  • 5 cancellations pending (end of period)                   │
│  • 3 refund requests awaiting review                         │
│                                                               │
│  📈 Churn Analysis                                           │
│  Monthly Churn: 3.2%                                         │
│  Canceled this month: 8 ($152 MRR lost)                      │
│                                                               │
│  Top Cancel Reasons:                                         │
│  1. Too expensive (3)                                        │
│  2. Not using enough (2)                                     │
│  3. Technical issues (2)                                     │
│  4. Found alternative (1)                                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 Subscription Management Actions

**For Individual Subscriptions:**
- View Stripe customer portal
- Change plan (upgrade/downgrade)
- Apply discount code
- Issue refund (full/partial)
- Cancel subscription (immediate/end of period)
- Reactivate canceled subscription
- Add subscription note
- View payment history
- Resend invoice
- Update billing email

**Bulk Operations:**
- Export subscription data (CSV)
- Apply discount to cohort
- Send billing reminder emails
- Migrate plans (e.g., Price increase)

### 7.3 Failed Payment Management

```typescript
interface FailedPayment {
  id: string;
  userId: string;
  userEmail: string;
  subscriptionId: string;
  amount: number;
  plan: string;
  failureReason: string;
  attemptCount: number;
  nextRetryAt: Date;
  status: 'retrying' | 'failed' | 'resolved';
  createdAt: Date;
}
```

**Dunning Management:**
- Automatic retry schedule (Day 3, 7, 14)
- Email reminders to customer
- Temporary grace period (7 days)
- Downgrade to free after failed payment
- Re-enable after successful payment

---

## 8. Support System

### 8.1 Support Ticket Management

```typescript
interface SupportTicket {
  id: string;
  ticketNumber: string; // e.g., #1234
  userId: string;
  userEmail: string;
  userName: string;
  userPlan: string;
  
  subject: string;
  description: string;
  category: 'billing' | 'technical' | 'feature' | 'bug' | 'account' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  
  assignedTo?: {
    id: string;
    name: string;
    avatar: string;
  };
  
  tags: string[];
  
  firstResponseTime?: number; // minutes
  resolutionTime?: number; // minutes
  
  messages: Array<{
    id: string;
    senderId: string;
    senderName: string;
    isAdmin: boolean;
    message: string;
    attachments?: string[];
    createdAt: Date;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}
```

**Support Dashboard:**
```
┌──────────────────────────────────────────────────────────────┐
│  Support Tickets                                             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  [All] [Open: 12] [In Progress: 5] [Waiting: 3] [Resolved]   │
│                                                               │
│  Quick Stats                                                 │
│  Avg Response Time: 2.3 hours                                │
│  Avg Resolution Time: 18.5 hours                             │
│  Satisfaction: 94%                                           │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ #1234 • URGENT                                         │  │
│  │ Billing: Double charged for subscription               │  │
│  │                                                         │  │
│  │ sarah@example.com • Pro plan                           │  │
│  │ Created: 2 hours ago • Unassigned                      │  │
│  │                                                         │  │
│  │ [Assign to me] [View Details]                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ #1233 • Normal                                         │  │
│  │ Technical: Email delivery not working                  │  │
│  │                                                         │  │
│  │ mike@example.com • Business plan                       │  │
│  │ Created: 5 hours ago • Assigned to: John               │  │
│  │ Status: In Progress • Last reply: 1 hour ago           │  │
│  │                                                         │  │
│  │ [View Details]                                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 Support Features

**Ticket Management:**
- Create ticket on behalf of user
- Assign to team member
- Change priority
- Add internal notes (not visible to user)
- Add tags
- Merge duplicate tickets
- Set status (open/in progress/waiting/resolved)
- Track response times
- Add to knowledge base (convert to help article)

**Communication:**
- Reply to ticket (user gets email)
- Internal comments (team only)
- Canned responses (templates)
- Rich text editor
- File attachments
- Email signatures
- CC other team members

**Integrations:**
- Slack notifications for new tickets
- Email forwarding (support@sharekit.net → tickets)
- User impersonation link (view as user)
- Quick links to user profile, subscription, resources

### 8.3 Canned Responses

```typescript
interface CannedResponse {
  id: string;
  title: string;
  category: string;
  shortcut: string; // e.g., /billing-refund
  content: string;
  variables: string[]; // e.g., {user_name}, {refund_amount}
  usageCount: number;
}

// Example canned responses
const CANNED_RESPONSES: CannedResponse[] = [
  {
    id: '1',
    title: 'Billing - Refund Issued',
    category: 'billing',
    shortcut: '/refund',
    content: `Hi {user_name},

I've processed a refund of {refund_amount} to your original payment method. You should see this in 5-7 business days.

Is there anything else I can help with?`,
    variables: ['user_name', 'refund_amount'],
    usageCount: 45
  },
  {
    id: '2',
    title: 'Technical - Email Not Sending',
    category: 'technical',
    shortcut: '/email-debug',
    content: `Hi {user_name},

I see the issue with your email delivery. Let's troubleshoot:

1. Check your Resend API key in Settings
2. Verify your sending domain is authenticated
3. Check the email delivery logs in your dashboard

Can you let me know what you see?`,
    variables: ['user_name'],
    usageCount: 32
  }
];
```

---

## 9. Content Management System (CMS)

### 9.1 Blog Management

```typescript
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  
  content: string; // Rich text (Markdown or HTML)
  excerpt: string;
  coverImage: string;
  
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  publishedAt?: Date;
  scheduledFor?: Date;
  
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
  };
  
  tags: string[];
  category: string;
  
  stats: {
    views: number;
    shares: number;
    avgReadTime: number; // minutes
  };
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Blog Post Editor:**
```
┌──────────────────────────────────────────────────────────────┐
│  Blog Post Editor                                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  [Title: How to Grow Your Email List...]                     │
│  [Slug: how-to-grow-email-list] [Auto-generate]             │
│                                                               │
│  [Cover Image Upload]                                        │
│  [Current: blog-cover.jpg] [Change]                          │
│                                                               │
│  Content                                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ [Bold] [Italic] [Link] [Image] [Code] [H1-H6]         │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │ # Introduction                                          │  │
│  │                                                         │  │
│  │ Growing your email list is crucial...                  │  │
│  │                                                         │  │
│  │ ## Step 1: Create Valuable Content                     │  │
│  │                                                         │  │
│  │ ...                                                    │  │
│  │                                                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  SEO Settings                                                │
│  [Meta Title: .........................]                     │
│  [Meta Description: ...................]                     │
│  [Tags: email, marketing, growth]                            │
│  [Category: Marketing Tips]                                  │
│                                                               │
│  Publishing                                                  │
│  Status: [Draft ▾]                                           │
│  [Schedule for later] [Date/Time picker]                     │
│                                                               │
│  [Save Draft] [Preview] [Publish Now]                        │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Blog Features:**
- Rich text editor (TipTap or similar)
- Image upload and management
- SEO optimization
- Scheduled publishing
- Categories and tags
- Author management
- Analytics integration
- Social media preview
- Related posts
- Comments (optional)

### 9.2 Help Center Management

```typescript
interface HelpArticle {
  id: string;
  category: string;
  title: string;
  slug: string;
  content: string;
  
  author: {
    id: string;
    name: string;
  };
  
  orderIndex: number; // For sorting within category
  
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  
  feedback: {
    helpfulCount: number;
    notHelpfulCount: number;
    helpfulPercentage: number;
  };
  
  relatedArticles: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Help article categories
const HELP_CATEGORIES = [
  'Getting Started',
  'Resource Management',
  'Page Builder',
  'Email Delivery',
  'Analytics',
  'Billing & Plans',
  'Troubleshooting',
  'API Documentation'
];
```

**Help Center Management:**
- Organize articles by category
- Drag-and-drop reordering
- Search optimization
- Related articles suggestions
- Helpful/Not Helpful voting
- Article analytics (views, search terms)
- Video embeds
- Code examples with syntax highlighting
- Multi-language support (future)

### 9.3 Marketing Page Management

**Editable Marketing Content:**
- Homepage hero section
- Features list
- Pricing table
- Testimonials
- FAQ section
- Footer content
- Legal pages (Terms, Privacy)

**Visual Page Builder:**
- Pre-built sections/blocks
- Drag-and-drop interface
- Live preview
- Responsive design controls
- A/B testing variants
- Analytics integration

---

## 10. Marketing Tools

### 10.1 Email Campaigns

```typescript
interface EmailCampaign {
  id: string;
  name: string;
  type: 'one-time' | 'recurring' | 'automated';
  
  audience: {
    segmentType: 'all' | 'plan' | 'activity' | 'custom';
    filters: {
      plan?: string[];
      signupDateRange?: { start: Date; end: Date };
      lastActiveRange?: { start: Date; end: Date };
      resourceCount?: { min?: number; max?: number };
      customQuery?: string;
    };
    recipientCount: number;
  };
  
  email: {
    subject: string;
    preheader: string;
    fromName: string;
    replyTo: string;
    content: string; // HTML
    plainText: string;
  };
  
  schedule: {
    sendAt?: Date;
    timezone: string;
  };
  
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
  
  createdAt: Date;
  sentAt?: Date;
}
```

**Email Campaign Builder:**
```
┌──────────────────────────────────────────────────────────────┐
│  New Email Campaign                                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Campaign Details                                            │
│  [Name: Black Friday Special Offer]                          │
│  [Type: One-time ▾]                                          │
│                                                               │
│  Audience                                                    │
│  Target: [Pro plan users ▾]                                  │
│  Filters:                                                    │
│    • Plan: Pro                                              │
│    • Signed up: Before Oct 1, 2025                          │
│    • Last active: Within 30 days                            │
│                                                               │
│  Estimated recipients: 247 users                             │
│  [Preview List]                                              │
│                                                               │
│  Email Content                                               │
│  [Subject: 🎉 Black Friday: 40% off Business plan]          │
│  [Preheader: Upgrade and save...]                            │
│                                                               │
│  [Template: Promotional ▾]                                   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ [Visual Editor] | [HTML] | [Plain Text]               │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │ Hi {{first_name}},                                      │  │
│  │                                                         │  │
│  │ This Black Friday, upgrade to Business plan and        │  │
│  │ save 40%!                                              │  │
│  │                                                         │  │
│  │ [Upgrade Now]                                          │  │
│  │                                                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Schedule                                                    │
│  ○ Send now                                                  │
│  ● Schedule for later: [Nov 29, 2025 9:00 AM PST]           │
│                                                               │
│  [Save Draft] [Send Test Email] [Schedule]                   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Campaign Features:**
- Audience segmentation
- Email templates
- Visual email builder
- Personalization tokens
- A/B testing (subject lines)
- Scheduled sending
- Test emails
- Analytics tracking
- Unsubscribe management

### 10.2 Announcements & In-App Messages

```typescript
interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  
  display: {
    location: 'banner' | 'modal' | 'toast';
    dismissible: boolean;
    ctaText?: string;
    ctaUrl?: string;
  };
  
  targeting: {
    audience: 'all' | 'free' | 'pro' | 'business';
    conditions?: {
      newUsersOnly?: boolean;
      daysSinceSignup?: { min?: number; max?: number };
    };
  };
  
  schedule: {
    startsAt: Date;
    endsAt?: Date;
  };
  
  active: boolean;
  
  stats: {
    views: number;
    clicks: number;
    dismissals: number;
  };
  
  createdBy: string;
  createdAt: Date;
}
```

**Use Cases:**
- New feature announcements
- Maintenance notifications
- Special promotions
- Policy updates
- Tips and tutorials
- Survey requests

### 10.3 Referral Program Management

```typescript
interface ReferralProgram {
  enabled: boolean;
  
  rewards: {
    referrer: {
      type: 'credit' | 'discount' | 'free_months';
      amount: number;
    };
    referee: {
      type: 'credit' | 'discount' | 'free_months';
      amount: number;
    };
  };
  
  terms: {
    minPlanRequired?: string;
    expirationDays?: number;
    maxRedemptions?: number;
  };
}

interface ReferralStats {
  totalReferrals: number;
  successfulSignups: number;
  conversionRate: number;
  topReferrers: Array<{
    userId: string;
    userName: string;
    referrals: number;
    conversions: number;
  }>;
}
```

---

## 11. Analytics & Reporting

### 11.1 Business Intelligence Dashboard

```typescript
interface BusinessMetrics {
  revenue: {
    mrr: number;
    mrrGrowth: number;
    arr: number;
    newMRR: number;
    churnedMRR: number;
    reactivatedMRR: number;
    expansionMRR: number; // Upgrades
    contractionMRR: number; // Downgrades
  };
  
  customers: {
    total: number;
    active: number;
    new: number;
    churned: number;
    reactivated: number;
  };
  
  acquisition: {
    signups: number;
    activationRate: number; // Published first page
    paidConversion: number;
    avgTimeToUpgrade: number; // days
    costPerAcquisition: number;
  };
  
  engagement: {
    dau: number; // Daily active users
    mau: number; // Monthly active users
    dauMauRatio: number;
    avgSessionDuration: number;
    avgResourcesPerUser: number;
  };
  
  content: {
    totalResources: number;
    totalPages: number;
    publishedPages: number;
    avgResourcesPerUser: number;
    topCategories: Array<{ category: string; count: number }>;
  };
  
  endUsers: {
    totalSignups: number; // People who downloaded
    signupsThisMonth: number;
    avgSignupsPerPage: number;
    avgConversionRate: number; // Page view → signup
  };
}
```

**Analytics Dashboard:**
```
┌──────────────────────────────────────────────────────────────┐
│  Business Analytics                 [Last 30 Days ▾]         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Key Metrics                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ MRR      │ │ Customers│ │ Churn    │ │ LTV      │        │
│  │ $4,850   │ │ 282      │ │ 3.2%     │ │ $450     │        │
│  │ ↑ 14%    │ │ ↑ 12     │ │ ↓ 0.5%   │ │          │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                               │
│  📊 Revenue Breakdown                                        │
│  [Stacked bar chart: New MRR, Expansion, Contraction, Churn] │
│                                                               │
│  👥 User Cohort Analysis                                     │
│  [Cohort table showing retention by signup month]            │
│                                                               │
│  📈 Conversion Funnel                                        │
│  Signup → Published Page → First Signup → Paid               │
│  1000 →   650 (65%) →       420 (65%) →   105 (25%)         │
│                                                               │
│  🎯 Acquisition Channels                                     │
│  Product Hunt: 45% (135 signups)                             │
│  Organic: 30% (90 signups)                                   │
│  Twitter: 15% (45 signups)                                   │
│  Direct: 10% (30 signups)                                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 11.2 Custom Reports

**Report Types:**
- Revenue reports (MRR breakdown, churn analysis)
- User reports (growth, activation, retention)
- Content reports (most popular resources, categories)
- Support reports (response times, satisfaction)
- Marketing reports (campaign performance)

**Export Options:**
- CSV
- Excel
- PDF
- Scheduled email delivery

### 11.3 Data Studio Integration

**Connect to:**
- Google Data Studio
- Metabase
- Tableau
- Custom BI tools via API

---

## 12. System Configuration

### 12.1 Feature Flags

```typescript
interface FeatureFlag {
  id: string;
  name: string;
  key: string; // e.g., 'enable_ab_testing'
  description: string;
  enabled: boolean;
  
  rollout: {
    type: 'all' | 'percentage' | 'users' | 'plans';
    percentage?: number; // 0-100
    userIds?: string[];
    plans?: string[];
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Example feature flags
const FEATURE_FLAGS = {
  ENABLE_AB_TESTING: {
    key: 'enable_ab_testing',
    name: 'A/B Testing',
    description: 'Enable A/B testing for share pages',
    enabled: false,
    rollout: { type: 'percentage', percentage: 10 }
  },
  
  ENABLE_CUSTOM_DOMAINS: {
    key: 'enable_custom_domains',
    name: 'Custom Domains',
    description: 'Allow Business plan users to add custom domains',
    enabled: true,
    rollout: { type: 'plans', plans: ['business'] }
  },
  
  NEW_DASHBOARD_UI: {
    key: 'new_dashboard_ui',
    name: 'New Dashboard Design',
    description: 'Test new dashboard layout',
    enabled: true,
    rollout: { type: 'percentage', percentage: 25 }
  }
};
```

**Feature Flag UI:**
- Toggle features on/off
- Gradual rollout (percentage-based)
- Target specific users or plans
- A/B test variants
- Emergency kill switch
- Audit log of changes

### 12.2 Platform Settings

```typescript
interface PlatformSettings {
  branding: {
    appName: string;
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    supportEmail: string;
  };
  
  limits: {
    free: {
      resources: number;
      pages: number;
      signupsPerMonth: number;
      fileSize: number; // MB
    };
    pro: {
      resources: number;
      pages: number;
      signupsPerMonth: number;
      fileSize: number;
    };
    business: {
      resources: number;
      pages: number;
      signupsPerMonth: number;
      fileSize: number;
    };
  };
  
  features: {
    allowSignups: boolean;
    maintenanceMode: boolean;
    requireEmailVerification: boolean;
    enableReferralProgram: boolean;
    enableHelp Chat: boolean;
  };
  
  integrations: {
    stripe: {
      enabled: boolean;
      publicKey: string;
      webhookSecret: string;
    };
    resend: {
      enabled: boolean;
      apiKey: string;
      fromEmail: string;
    };
    analytics: {
      plausible: {
        enabled: boolean;
        domain: string;
      };
    };
  };
  
  security: {
    maxLoginAttempts: number;
    sessionTimeout: number; // minutes
    enforcePasswordPolicy: boolean;
    allowedFileTypes: string[];
    maxFileSize: number; // MB
  };
}
```

**Settings UI:**
- Organized by category
- Real-time validation
- Audit trail for changes
- Reset to defaults
- Import/export configuration

### 12.3 API Management

**API Keys:**
- Generate API keys for users
- Set rate limits
- Track usage
- Revoke keys
- View API logs

**Webhooks:**
- View all registered webhooks
- Test webhook delivery
- View delivery logs
- Retry failed webhooks

**Rate Limiting:**
- Set global rate limits
- Per-endpoint limits
- User-specific limits
- IP-based limiting

---

## 13. Technical Implementation

### 13.1 Admin Routes Structure

```typescript
// /admin layout with auth check
export default function AdminLayout({ children }) {
  const { user, adminRole } = useAdminAuth();
  
  if (!user || !adminRole) {
    return <Navigate to="/admin/login" />;
  }
  
  return (
    <div className="flex h-screen">
      <AdminSidebar role={adminRole} />
      <main className="flex-1 overflow-auto">
        <AdminHeader user={user} />
        {children}
      </main>
    </div>
  );
}
```

### 13.2 Admin API Routes

```
POST /api/admin/auth/login          # Admin login
POST /api/admin/auth/logout         # Admin logout

# Users
GET  /api/admin/users               # List users
GET  /api/admin/users/:id           # Get user details
PUT  /api/admin/users/:id           # Update user
POST /api/admin/users/:id/suspend   # Suspend user
POST /api/admin/users/:id/impersonate # Impersonate user
DELETE /api/admin/users/:id         # Delete user

# Content Moderation
GET  /api/admin/moderation          # Moderation queue
POST /api/admin/moderation/:id/approve
POST /api/admin/moderation/:id/reject

# Subscriptions
GET  /api/admin/subscriptions       # List subscriptions
POST /api/admin/subscriptions/:id/refund
POST /api/admin/subscriptions/:id/cancel

# Support
GET  /api/admin/support/tickets     # List tickets
GET  /api/admin/support/tickets/:id # Get ticket
POST /api/admin/support/tickets/:id/reply
PUT  /api/admin/support/tickets/:id/status

# CMS
GET  /api/admin/blog/posts          # List blog posts
POST /api/admin/blog/posts          # Create post
PUT  /api/admin/blog/posts/:id      # Update post
DELETE /api/admin/blog/posts/:id    # Delete post

# Analytics
GET  /api/admin/analytics/dashboard # Dashboard metrics
GET  /api/admin/analytics/export    # Export data

# Settings
GET  /api/admin/settings            # Get settings
PUT  /api/admin/settings            # Update settings
GET  /api/admin/feature-flags       # List flags
PUT  /api/admin/feature-flags/:id   # Toggle flag
```

### 13.3 Security Implementation

**Admin Authentication:**
```typescript
// Separate admin auth from user auth
// Admin users have both regular user account + admin role

async function checkAdminAccess(userId: string, requiredRole: string) {
  const adminUser = await supabase
    .from('admin_users')
    .select('role, permissions')
    .eq('user_id', userId)
    .single();
    
  if (!adminUser) {
    throw new Error('Not an admin user');
  }
  
  if (!hasPermission(adminUser.role, requiredRole)) {
    throw new Error('Insufficient permissions');
  }
  
  return adminUser;
}
```

**Activity Logging:**
```typescript
async function logAdminActivity(activity: {
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: any;
}) {
  await supabase.from('admin_activity_log').insert({
    ...activity,
    ip_address: getClientIP(),
    user_agent: getUserAgent(),
    created_at: new Date()
  });
}
```

**Rate Limiting:**
```typescript
// Protect admin endpoints from abuse
const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP'
});
```

### 13.4 Performance Considerations

**Caching:**
- Cache frequently accessed data (user counts, MRR)
- Invalidate cache on data changes
- Use Redis for session storage

**Database Optimization:**
- Index admin query patterns
- Materialized views for analytics
- Connection pooling
- Query optimization

**Real-time Updates:**
- WebSocket for live dashboard metrics
- Server-sent events for notifications
- Polling fallback for older browsers

---

## 14. Development Roadmap

### Phase 1: Core Admin (Week 1-2)
- [ ] Admin authentication and roles
- [ ] Dashboard overview
- [ ] User management (list, view, basic actions)
- [ ] Platform monitoring basics
- [ ] Activity logging

### Phase 2: Support & Moderation (Week 3-4)
- [ ] Support ticket system
- [ ] Moderation queue
- [ ] Content flagging
- [ ] Canned responses

### Phase 3: Subscriptions & Finance (Week 5-6)
- [ ] Subscription management
- [ ] Refund handling
- [ ] Failed payment management
- [ ] Revenue analytics

### Phase 4: Content Management (Week 7-8)
- [ ] Blog post editor
- [ ] Help article management
- [ ] Marketing page editor
- [ ] SEO tools

### Phase 5: Analytics & Reporting (Week 9-10)
- [ ] Business intelligence dashboard
- [ ] Custom reports
- [ ] Export functionality
- [ ] Cohort analysis

### Phase 6: Advanced Features (Week 11-12)
- [ ] Feature flags
- [ ] A/B testing management
- [ ] Email campaigns
- [ ] API management

---

## 15. Success Metrics

**Admin System Goals:**

**Efficiency:**
- Reduce support response time by 50%
- Handle moderation queue in <30 minutes daily
- Platform health checks automated

**Visibility:**
- Real-time view of all critical metrics
- Proactive alerts before issues become critical
- Full audit trail for compliance

**Scale:**
- Support 10,000+ users without additional admin staff
- Handle 100+ support tickets daily
- Moderate 50+ content items daily

**Security:**
- Zero unauthorized access incidents
- Complete activity logging
- GDPR/compliance ready

---

## Appendix A: UI Component Library

All admin UI should use the existing shadcn/ui components for consistency:

**Key Components:**
- Data tables (for user lists, subscriptions)
- Cards (for metrics, stats)
- Dialogs (for confirmations, modals)
- Forms (for editing, settings)
- Charts (Recharts for analytics)
- Alerts (for notifications)
- Badges (for status indicators)
- Tabs (for organizing sections)

---

## Appendix B: Security Checklist

- [x] RLS policies for admin tables
- [ ] Admin role-based access control
- [ ] Activity logging for all admin actions
- [ ] Rate limiting on admin endpoints
- [ ] IP whitelisting (optional)
- [ ] Two-factor authentication for admins
- [ ] Session timeout for admin users
- [ ] Encryption for sensitive data
- [ ] Regular security audits
- [ ] Penetration testing

---

## Conclusion

This admin system provides comprehensive oversight and management capabilities for the ShareKit platform. It balances power with usability, enabling efficient platform operations while maintaining security and scalability.

**Next Steps:**
1. Review and approve admin system design
2. Prioritize features for Phase 1 implementation
3. Set up admin database schema
4. Begin development of core admin dashboard

**Document Status:** ✅ Ready for Development Review  
**Created:** November 12, 2025  
**For:** ShareKit Platform Administration
