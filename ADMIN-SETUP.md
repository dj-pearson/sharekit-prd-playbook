# ShareKit Admin System Setup Guide

## Overview

The ShareKit Admin System provides comprehensive platform administration capabilities including:
- User management
- Content moderation
- Support ticket system
- Platform monitoring
- Business analytics
- CMS and marketing tools

## Phase 1 Implementation Status

✅ **Completed:**
- Database schema (all admin tables)
- Admin authentication & authorization
- Admin dashboard with metrics
- User management (list, search, filter, view)
- Admin layout and navigation
- Role-based access control
- Activity logging foundation

🚧 **Pending (Future Phases):**
- Platform monitoring (Phase 1)
- Content moderation (Phase 2)
- Support system (Phase 2)
- Subscription management (Phase 3)
- CMS/Blog management (Phase 4)
- Marketing tools (Phase 5)
- Advanced analytics (Phase 5)

## Database Setup

### 1. Apply the Admin System Migration

The migration file creates all necessary tables for the admin system:

```bash
# If using Supabase CLI
supabase db push

# Or apply the migration directly in Supabase Dashboard
# SQL Editor → Run the contents of:
# supabase/migrations/20251112220000_create_admin_system.sql
```

### 2. Create Your First Admin User

After the migration is applied, you need to manually add your first admin user:

```sql
-- Replace 'your-user-id' with your actual Supabase Auth user ID
INSERT INTO admin_users (user_id, role)
VALUES ('your-user-id', 'super_admin');
```

To find your user ID:
1. Log in to your ShareKit account normally
2. Go to Supabase Dashboard → Authentication → Users
3. Find your user and copy the UUID
4. Run the SQL above with your UUID

## Admin Roles & Permissions

### Role Hierarchy

1. **Super Admin** (`super_admin`)
   - Full system access
   - Can manage other admin users
   - Platform configuration
   - All permissions (*)

2. **Admin** (`admin`)
   - User management
   - Content moderation
   - Subscription management
   - Support management
   - Analytics access
   - CMS editing

3. **Support Manager** (`support_manager`)
   - View users (limited)
   - Manage support tickets
   - View analytics

4. **Content Manager** (`content_manager`)
   - CMS access
   - Blog/help article management
   - Marketing content

5. **Read-Only** (`read_only`)
   - View-only access to dashboards
   - Analytics viewing
   - No modification rights

### Permission System

Permissions are checked using the `useAdmin` hook:

```typescript
const { hasPermission, hasRole } = useAdmin();

// Check specific permission
if (hasPermission('users.edit')) {
  // Show edit button
}

// Check role
if (hasRole(['super_admin', 'admin'])) {
  // Show admin actions
}
```

## Accessing the Admin Panel

### URL Structure

All admin routes are under `/admin/*`:

```
/admin/dashboard      - Main dashboard with metrics
/admin/users          - User management
/admin/monitoring     - Platform health (coming soon)
/admin/content        - Content moderation (coming soon)
/admin/subscriptions  - Subscription management (coming soon)
/admin/support        - Support tickets (coming soon)
/admin/cms            - Blog & help articles (coming soon)
/admin/marketing      - Email campaigns (coming soon)
/admin/analytics      - Business analytics (coming soon)
/admin/settings       - Platform settings (coming soon)
```

### Access Control

1. User must be authenticated
2. User must have an entry in `admin_users` table
3. Role-based access is enforced on each page
4. All admin actions are logged

## Admin Dashboard Features

### Metrics Displayed

- **Active Users**: Users who logged in within last 30 days
- **New Users Today**: Signups from today
- **MRR**: Monthly Recurring Revenue (when Stripe integration is active)
- **Open Support Tickets**: Tickets needing attention
- **Content Statistics**: Resources, pages, and downloads
- **Platform Health**: System status overview

### Real-time Updates

The dashboard refreshes data on load and can be manually refreshed.

## User Management Features

### Current Features (Phase 1)

- ✅ View all users with pagination
- ✅ Search by email, name, or username
- ✅ Filter by plan (free/pro/business)
- ✅ Filter by status (active/inactive)
- ✅ View user details
- ✅ Export to CSV
- ✅ See resource and page counts

### Coming Soon (Future Phases)

- Edit user details
- Suspend/unsuspend accounts
- Delete accounts
- Impersonate user (for debugging)
- Reset passwords
- View user activity timeline
- Manage subscriptions directly

## Activity Logging

All admin actions are logged to `admin_activity_log` table:

```typescript
// Automatically logs when viewing pages
logActivity('page_view', 'admin_dashboard');

// Log specific actions
logActivity('view_user', 'user', userId);
logActivity('export_users', 'user', undefined, { count: 100 });
```

Logged information includes:
- Admin user ID
- Action performed
- Resource type and ID
- Metadata (context-specific)
- Timestamp
- IP address (future)
- User agent (future)

## Development Guidelines

### Adding New Admin Pages

1. Create page component in `src/pages/admin/`
2. Wrap with `AdminLayout` component
3. Use `useAdmin()` hook for auth and permissions
4. Add route to `App.tsx`
5. Update navigation in `AdminLayout.tsx` if needed

Example:

```typescript
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdmin } from '@/hooks/useAdmin';

export default function AdminNewFeature() {
  const { hasPermission, logActivity } = useAdmin();

  useEffect(() => {
    logActivity('page_view', 'admin_new_feature');
  }, []);

  if (!hasPermission('feature.view')) {
    return <AdminLayout>Access Denied</AdminLayout>;
  }

  return (
    <AdminLayout>
      <h1>New Feature</h1>
      {/* Your content */}
    </AdminLayout>
  );
}
```

### Permission Naming Convention

Use dot notation: `resource.action`

Examples:
- `users.view`
- `users.edit`
- `users.delete`
- `content.moderate`
- `support.manage`
- `cms.publish`

### Testing Admin Features

1. Create a test admin user in development
2. Test with different roles to verify permissions
3. Check activity logs after actions
4. Verify RLS policies work correctly

## Security Considerations

### Row Level Security (RLS)

All admin tables have RLS policies:
- Only admins can access admin data
- Super admins can manage other admins
- Activity logs are write-only (system inserts)
- Public tables (blog, help) have separate policies

### Best Practices

1. **Never disable RLS** on admin tables
2. **Always use parameterized queries** to prevent SQL injection
3. **Log all admin actions** for audit trail
4. **Validate permissions** on both frontend and backend
5. **Rotate admin passwords** regularly
6. **Review activity logs** periodically

### Future Security Enhancements

- Two-factor authentication for admins
- IP whitelisting
- Session timeout management
- Failed login tracking
- Suspicious activity alerts

## Troubleshooting

### "You do not have admin access"

1. Check if user exists in `admin_users` table:
   ```sql
   SELECT * FROM admin_users WHERE user_id = 'your-user-id';
   ```

2. If not, add the user:
   ```sql
   INSERT INTO admin_users (user_id, role)
   VALUES ('your-user-id', 'admin');
   ```

### "Access Denied" on specific pages

1. Check your role:
   ```sql
   SELECT role FROM admin_users WHERE user_id = 'your-user-id';
   ```

2. Verify the required permission for that page
3. Check if your role has that permission in `src/hooks/useAdmin.ts`

### Activity logs not recording

1. Check if `logActivity` is being called
2. Verify RLS policies allow inserts
3. Check browser console for errors

### Navigation items missing

1. Check if your role has the required permission
2. Verify permission in `ROLE_PERMISSIONS` object
3. Check `AdminLayout.tsx` navigation filter

## Next Steps

### Phase 2 (Weeks 3-4)

- [ ] Platform monitoring dashboard
- [ ] System health metrics
- [ ] Content moderation queue
- [ ] Support ticket system
- [ ] Canned responses

### Phase 3 (Weeks 5-6)

- [ ] Subscription management
- [ ] Refund handling
- [ ] Failed payment recovery
- [ ] Revenue analytics

### Phase 4 (Weeks 7-8)

- [ ] Blog post editor
- [ ] Help article management
- [ ] SEO tools
- [ ] Rich text editing

### Phase 5 (Weeks 9-10)

- [ ] Email campaign builder
- [ ] Announcement system
- [ ] Advanced analytics
- [ ] Business intelligence

### Phase 6 (Weeks 11-12)

- [ ] Feature flags UI
- [ ] A/B testing management
- [ ] API key management
- [ ] Webhook management

## Support

For questions or issues:
1. Check this documentation
2. Review the ADMIN-SYSTEM-SPEC.md for detailed specifications
3. Check the code comments in admin components
4. Create an issue in the project repository

---

**Last Updated**: November 12, 2025
**Version**: 1.0 (Phase 1 Complete)
