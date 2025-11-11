# ShareKit Execution Roadmap
## Strategic Implementation Plan: Building The Unfair Advantage

**Document Version:** 1.0  
**Created:** November 11, 2025  
**Timeline:** 14 Days to Competitive Dominance  
**Goal:** Transform ShareKit from "good MVP" to "platform leaders chase"

---

## Executive Summary

This roadmap transforms ShareKit's 60% complete MVP into a category-defining platform by focusing on three strategic pillars:

1. **Speed to Value**: 3-minute setup (industry-leading)
2. **Instant Gratification**: Real-time notifications that create addiction
3. **Viral Attribution**: Built-in growth loops

**Current State:** Functional MVP with gaps  
**Target State:** Platform with unfair competitive advantage  
**Key Metric:** 60% activation rate (signup → published page)

---

## Table of Contents

1. [Week 1: Complete The Experience](#week-1-complete-the-experience)
2. [Week 2: Add The Magic](#week-2-add-the-magic)
3. [Month 2: AI-Powered Differentiation](#month-2-ai-powered-differentiation)
4. [Month 3: Network Effects](#month-3-network-effects)
5. [Ongoing: Optimization & Growth](#ongoing-optimization--growth)

---

## Week 1: Complete The Experience

### Day 1-2: Integrate Onboarding Wizard

**Objective:** Guide new users from signup to published page in <3 minutes

**Status:** Component exists (`OnboardingWizard.tsx`) but not integrated

#### Task 1.1: Connect Wizard to Auth Flow

**Location:** `src/App.tsx` and auth pages

**Implementation:**

```typescript
// PROMPT FOR IMPLEMENTATION:

I need to integrate the existing OnboardingWizard component into the signup flow.

Current state:
- OnboardingWizard.tsx exists in /src/components/
- Not connected to signup flow
- User lands on blank dashboard after signup

Required changes:

1. After successful signup, redirect to /onboarding (new route)
2. Show OnboardingWizard component
3. Track progress in profiles.onboarding_step (database field exists)
4. On completion, mark profiles.onboarding_completed = true
5. Only show wizard if onboarding_completed = false

Steps breakdown:

Step 1: Create onboarding route
- Create /src/pages/Onboarding.tsx
- Import OnboardingWizard component
- Wrap in auth guard (must be logged in)
- Check if already completed, redirect to dashboard

Step 2: Update signup redirect
- In signup success handler, check profiles.onboarding_completed
- If false: redirect to /onboarding
- If true: redirect to /dashboard

Step 3: Update OnboardingWizard to save progress
- On each step completion, update profiles.onboarding_step
- On final step, set onboarding_completed = true
- Show progress indicator (Step 1 of 4)

Step 4: Add skip option
- "I'll do this later" button on each step
- Still creates default resource/page
- Marks onboarding as "skipped" for metrics

Database queries needed:
- Update profiles.onboarding_step
- Update profiles.onboarding_completed
- Insert into resources table
- Insert into pages table

Please provide complete implementation with:
- All file changes
- Supabase queries
- Error handling
- Loading states
- TypeScript types
```

**Acceptance Criteria:**
- [ ] New users see wizard immediately after signup
- [ ] Progress persists if user closes browser
- [ ] Skip option works but still creates starter page
- [ ] Completion time tracked in analytics
- [ ] Dashboard shows "Complete Setup" if skipped

**Metrics to Track:**
- Wizard start rate (signup → wizard shown)
- Step completion rates (identify drop-off)
- Time to complete each step
- Skip vs complete percentage

---

#### Task 1.2: Optimize Wizard Flow

**Objective:** Reduce completion time from 5 minutes to 3 minutes

**Implementation:**

```typescript
// PROMPT FOR OPTIMIZATION:

The OnboardingWizard needs to be faster and more encouraging.

Current wizard steps (from component):
1. Welcome
2. Upload resource
3. Choose template  
4. Customize page
5. Publish

Optimization requirements:

1. Reduce to 3 essential steps:
   - Step 1: "What will you share?" (title + file upload)
   - Step 2: "Pick your style" (template selection)
   - Step 3: "You're live! 🎉" (instant publish with shareable link)

2. Add smart defaults:
   - Auto-generate slug from file name
   - Default headline: "Get my [filename without extension]"
   - Default button text: "Send me the guide"
   - Default template: Minimal (fastest)

3. Add progress encouragement:
   - "Almost there! 30 seconds left"
   - "You're faster than 80% of users! 🚀"
   - Celebration animation on completion

4. Instant preview:
   - Show live page preview on right side (desktop)
   - Updates as user types
   - "This is what people will see" label

5. Skip upload option:
   - "Start with example resource" button
   - Creates sample page immediately
   - User can upload real resource later

Implementation details:
- Use Framer Motion for step transitions
- Auto-save progress every 10 seconds
- Prefetch templates while user uploads
- Optimize file upload (show progress immediately)
- Celebrate with confetti animation on publish

Please implement with:
- Reduced step count
- Smart defaults
- Encouraging copy
- Performance optimizations
```

**Acceptance Criteria:**
- [ ] 80% of users complete in <3 minutes
- [ ] No step takes more than 45 seconds
- [ ] Preview updates in <200ms
- [ ] Celebration moment on completion
- [ ] Analytics track completion time

---

#### Task 1.3: Add Success State

**Objective:** Create memorable "first publish" moment

**Implementation:**

```typescript
// PROMPT FOR SUCCESS STATE:

After onboarding completion, show a celebration screen before dashboard.

Requirements:

1. Success Modal/Page:
   - Confetti animation (use canvas-confetti library)
   - "🎉 Your page is live!"
   - Big display of shareable link
   - Social share buttons (Twitter, LinkedIn, Copy)
   - "View Your Page" CTA
   - "Go to Dashboard" secondary button

2. Pre-filled social shares:
   Twitter: "I just published my first resource page with @ShareKit! 
   Check it out: [link] #CreatorTools"
   
   LinkedIn: "Excited to share my latest resource using ShareKit. 
   Clean, simple, and beautifully designed. [link]"

3. Copy link behavior:
   - One-click copy
   - Toast: "Link copied! Ready to share 🚀"
   - Haptic feedback (mobile)

4. Track shares:
   - Log which social platform clicked
   - Insert into analytics_events
   - Show in dashboard: "Your page was shared 3 times"

5. Auto-redirect:
   - After 15 seconds, auto-redirect to dashboard
   - Unless user interacts with modal

Implementation notes:
- Use Dialog component from shadcn
- canvas-confetti for celebration
- Clipboard API for copy
- Track share button clicks
- Responsive design (mobile-first)

Please provide:
- SuccessModal component
- Social share logic
- Analytics tracking
- Mobile-optimized layout
```

**Acceptance Criteria:**
- [ ] Confetti animates on mount
- [ ] Share buttons work on all platforms
- [ ] Copy provides instant feedback
- [ ] Shares tracked in analytics
- [ ] Mobile responsive

---

### Day 3-4: Connect Real-time Activity Feed

**Objective:** Show live signup notifications to create dashboard addiction

**Status:** Component exists (`RealtimeActivityFeed.tsx`) but Supabase Realtime not connected

#### Task 1.4: Enable Supabase Realtime Subscriptions

**Implementation:**

```typescript
// PROMPT FOR REALTIME INTEGRATION:

Connect the existing RealtimeActivityFeed component to Supabase Realtime.

Current state:
- RealtimeActivityFeed.tsx component exists
- Not connected to database
- No subscriptions active

Requirements:

1. Subscribe to email_captures table:
   - Listen for INSERT events
   - Filter by current user's pages only
   - Real-time notifications within 3 seconds

2. Subscribe to analytics_events table:
   - Listen for 'download' events
   - Show when someone downloads a resource

3. Component updates:
   ```typescript
   useEffect(() => {
     // Create Supabase Realtime channel
     const channel = supabase
       .channel('activity-feed')
       .on(
         'postgres_changes',
         {
           event: 'INSERT',
           schema: 'public',
           table: 'email_captures',
           filter: `page_id=in.(${userPageIds.join(',')})`
         },
         (payload) => {
           // Add to feed
           // Show toast notification
           // Play sound (optional)
         }
       )
       .subscribe();

     return () => {
       supabase.removeChannel(channel);
     };
   }, [userPageIds]);
   ```

4. Toast notifications:
   - "🎉 Sarah just signed up for Productivity Guide!"
   - Click toast to view signup details
   - Sound effect (enable in settings)
   - Limit to 1 per 5 seconds (avoid spam)

5. Feed display:
   - Show last 10 activities
   - Auto-scroll to top on new item
   - Slide-in animation (Framer Motion)
   - Time ago (e.g., "2 minutes ago")

6. Settings toggle:
   - Enable/disable real-time notifications
   - Enable/disable sound
   - Save to profiles.settings (jsonb field)

Edge cases:
- Unsubscribe on component unmount
- Handle reconnection if websocket drops
- Rate limit notifications (no more than 10/minute)
- Graceful degradation if Realtime fails

Performance:
- Only subscribe if dashboard is visible (tab focus)
- Unsubscribe when tab inactive
- Batch updates if multiple signups at once

Please implement:
- Supabase channel subscription
- Toast notifications with sound
- Feed UI updates
- Settings persistence
- Error handling
```

**Acceptance Criteria:**
- [ ] Notifications appear within 3 seconds of signup
- [ ] No duplicate notifications
- [ ] Toast click navigates to signup details
- [ ] Settings persist across sessions
- [ ] Graceful fallback if Realtime unavailable

---

#### Task 1.5: Activity Feed UI Polish

**Implementation:**

```typescript
// PROMPT FOR UI POLISH:

Enhance the RealtimeActivityFeed component with delightful interactions.

Current component needs:

1. Activity cards:
   ```jsx
   <div className="flex items-start gap-3 p-3 rounded-lg bg-white 
                   border border-slate-200 hover:border-cyan-500 
                   transition-colors cursor-pointer">
     <Avatar>
       {/* First initial or generated avatar */}
     </Avatar>
     <div className="flex-1">
       <p className="text-sm font-medium text-slate-900">
         {name || email} signed up
       </p>
       <p className="text-xs text-slate-500">
         for {resourceTitle}
       </p>
       <p className="text-xs text-slate-400 mt-1">
         {timeAgo(createdAt)}
       </p>
     </div>
     <Badge variant="outline" className="text-xs">
       {source || 'Direct'}
     </Badge>
   </div>
   ```

2. Empty state:
   - Show when no recent activity
   - "Waiting for your first signup! 🚀"
   - Helpful tip: "Share your page to get started"
   - Link to copy page URL

3. Animation:
   - Slide in from top (Framer Motion)
   - Subtle bounce effect
   - Fade out old items after 10 visible

4. Interaction:
   - Click card to open signup details modal
   - Show email, source, timestamp, IP country
   - "Send follow-up email" button
   - "View on page" link

5. Filter options:
   - All activity
   - Signups only
   - Downloads only
   - Last 24 hours / 7 days / 30 days

6. Sound:
   - Subtle notification sound (positive, not annoying)
   - Use Web Audio API
   - Toggle in user settings

7. Mobile optimization:
   - Scrollable feed
   - Swipe to dismiss notification
   - Haptic feedback on iOS

Please implement:
- Animated activity cards
- Empty state with CTA
- Click-through to details
- Filter functionality
- Sound effects
- Mobile gestures
```

**Acceptance Criteria:**
- [ ] Smooth slide-in animations
- [ ] Empty state encourages sharing
- [ ] Click opens detailed view
- [ ] Filters work correctly
- [ ] Sound is pleasant, not jarring
- [ ] Mobile swipe dismisses notifications

---

### Day 5-7: Polish Core Experience

#### Task 1.6: Add Loading States Everywhere

**Implementation:**

```typescript
// PROMPT FOR LOADING STATES:

Add skeleton loaders and loading states to all data-fetching components.

Locations to update:

1. Dashboard main view:
   - Stats cards: Use Skeleton component
   - Activity feed: Show 3 skeleton cards
   - Resource list: Show 2 skeleton resource cards

2. Resource pages:
   - Resource list: Grid of skeleton cards
   - Resource detail: Full page skeleton
   - Upload progress: Progress bar with percentage

3. Analytics pages:
   - Charts: Skeleton rectangles matching chart dimensions
   - Tables: Skeleton rows (5 rows)
   - Stats cards: Skeleton matching layout

4. Page builder:
   - Template selector: Skeleton thumbnails
   - Editor: Skeleton form fields
   - Preview: Skeleton page layout

Implementation pattern:
```typescript
const ResourceList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['resources'],
    queryFn: fetchResources
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ... rest of component
};
```

Requirements:
- Use shadcn Skeleton component
- Match actual content layout
- Animate pulse effect
- Show immediately (no delay)
- Accessible (aria-busy="true")

Global loading states:
- Top progress bar for page transitions (nprogress)
- Button loading states (spinner + disabled)
- Form submission states

Error states:
- Error boundaries at route level
- Friendly error messages
- Retry buttons
- Report error option

Please implement:
- Skeleton loaders for all lists
- Progress indicators for actions
- Error boundaries with recovery
- Consistent loading patterns
```

**Acceptance Criteria:**
- [ ] No "flash of unstyled content"
- [ ] Loading states match final layout
- [ ] Smooth transitions to content
- [ ] Error states allow recovery
- [ ] Accessible loading indicators

---

#### Task 1.7: Add Error Boundary

**Implementation:**

```typescript
// PROMPT FOR ERROR BOUNDARY:

Add React Error Boundary to catch and handle runtime errors gracefully.

Requirements:

1. Create ErrorBoundary component:
   ```typescript
   // src/components/ErrorBoundary.tsx
   class ErrorBoundary extends React.Component {
     state = { hasError: false, error: null };
     
     static getDerivedStateFromError(error) {
       return { hasError: true, error };
     }
     
     componentDidCatch(error, errorInfo) {
       // Log to Sentry (when integrated)
       console.error('Error caught:', error, errorInfo);
     }
     
     render() {
       if (this.state.hasError) {
         return (
           <ErrorFallback 
             error={this.state.error}
             resetError={() => this.setState({ hasError: false })}
           />
         );
       }
       
       return this.props.children;
     }
   }
   ```

2. ErrorFallback UI:
   ```jsx
   <div className="min-h-screen flex items-center justify-center">
     <Card className="max-w-md">
       <CardHeader>
         <div className="text-red-500 text-4xl mb-4">⚠️</div>
         <CardTitle>Something went wrong</CardTitle>
         <CardDescription>
           Don't worry, your data is safe. This has been reported.
         </CardDescription>
       </CardHeader>
       <CardContent>
         <p className="text-sm text-slate-600 mb-4">
           {error.message}
         </p>
         <div className="flex gap-2">
           <Button onClick={resetError}>
             Try Again
           </Button>
           <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
             Go to Dashboard
           </Button>
         </div>
       </CardContent>
     </Card>
   </div>
   ```

3. Wrap routes:
   - Wrap entire App in ErrorBoundary
   - Wrap each major route in nested boundaries
   - Different fallbacks for different sections

4. Error reporting:
   - Log to console in development
   - Send to Sentry in production (prepare for integration)
   - Include user ID, route, timestamp
   - Include error stack trace

5. Recovery strategies:
   - "Try Again" clears error state
   - "Go Home" resets to dashboard
   - "Report Bug" opens feedback form
   - Automatic retry for network errors

Edge cases:
- Async boundary errors (React 18+)
- Errors in event handlers (not caught by boundary)
- Errors during SSR (Next.js specific)

Please implement:
- ErrorBoundary component
- ErrorFallback UI
- Nested boundaries for routes
- Error logging system
- Recovery actions
```

**Acceptance Criteria:**
- [ ] App doesn't crash on errors
- [ ] Friendly error messages shown
- [ ] Users can recover without refresh
- [ ] Errors logged for debugging
- [ ] Different fallbacks for different routes

---

## Week 2: Add The Magic

### Day 8-9: Social Proof Automation

**Objective:** Build trust and FOMO with real-time social proof

#### Task 2.1: Download Counter Display

**Implementation:**

```typescript
// PROMPT FOR SOCIAL PROOF:

Add dynamic social proof to share pages showing signup/download counts.

Requirements:

1. Database query optimization:
   ```sql
   -- Add to page query
   SELECT 
     pages.*,
     COUNT(DISTINCT email_captures.id) as signup_count,
     COUNT(DISTINCT analytics_events.id) FILTER (
       WHERE event_type = 'download'
     ) as download_count
   FROM pages
   LEFT JOIN email_captures ON email_captures.page_id = pages.id
   LEFT JOIN analytics_events ON analytics_events.page_id = pages.id 
     AND analytics_events.event_type = 'download'
   WHERE pages.slug = $1
   GROUP BY pages.id;
   ```

2. Display on share page:
   ```jsx
   <div className="flex items-center justify-center gap-2 text-sm text-slate-600 mb-6">
     <Users className="w-4 h-4" />
     <span>
       Join <strong className="text-slate-900">{signupCount}</strong> people 
       who got this guide
       {signupCount > 50 && (
         <span className="text-green-600 ml-1">
           ✓ Popular resource
         </span>
       )}
     </span>
   </div>
   ```

3. Real-time updates:
   - Increment count immediately after signup
   - Use optimistic UI updates
   - Supabase Realtime subscription for live count
   - Animate number change (count up effect)

4. Milestone badges:
   - 10+ signups: "🔥 Trending"
   - 50+ signups: "⭐ Popular"
   - 100+ signups: "👑 Top Resource"
   - 500+ signups: "🚀 Viral"

5. Recent activity (privacy-friendly):
   ```jsx
   <div className="text-xs text-slate-500 text-center mb-4">
     Someone in <strong>California</strong> downloaded this 
     <strong className="text-slate-700"> 3 minutes ago</strong>
   </div>
   ```
   - Show city/state only (no names)
   - Rotate through last 5 signups
   - Update every 10 seconds
   - Fade transition between items

6. Settings control:
   - Creator can enable/disable in page settings
   - "Show signup count" toggle
   - "Show recent activity" toggle
   - Privacy: Never show actual emails

Implementation:
- Query optimization for counts
- Real-time subscription
- Count-up animation (react-countup)
- Activity rotation logic
- Privacy controls

Please implement:
- Optimized count queries
- Social proof components
- Real-time updates
- Privacy-friendly activity feed
- Creator controls
```

**Acceptance Criteria:**
- [ ] Counts update in real-time
- [ ] Milestone badges appear automatically
- [ ] Recent activity rotates smoothly
- [ ] No PII exposed
- [ ] Creator can toggle visibility
- [ ] Performance: <100ms query time

---

#### Task 2.2: Trust Indicators

**Implementation:**

```typescript
// PROMPT FOR TRUST INDICATORS:

Add trust-building elements to share pages and dashboard.

Share page trust elements:

1. Verified creator badge:
   ```jsx
   {creator.emailVerified && (
     <div className="flex items-center gap-1 text-sm text-slate-600">
       <CheckCircle className="w-4 h-4 text-green-500" />
       <span>Verified Creator</span>
     </div>
   )}
   ```

2. Security reassurance:
   ```jsx
   <div className="flex items-center justify-center gap-6 text-xs text-slate-500 mt-8">
     <div className="flex items-center gap-1">
       <Lock className="w-3 h-3" />
       <span>Secure delivery</span>
     </div>
     <div className="flex items-center gap-1">
       <Shield className="w-3 h-3" />
       <span>No spam, ever</span>
     </div>
     <div className="flex items-center gap-1">
       <Mail className="w-3 h-3" />
       <span>Unsubscribe anytime</span>
     </div>
   </div>
   ```

3. Creator credibility:
   - Show creator's website (if provided)
   - Show avatar/logo
   - Total resources shared count
   - "Creator since [date]" label

4. Resource quality indicators:
   - File size display (e.g., "2.4 MB PDF")
   - Page count (extract from PDF)
   - Last updated date
   - Preview thumbnail

Dashboard trust elements:

1. Platform stats:
   ```jsx
   <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
     <p className="text-sm text-slate-600">
       Join <strong>2,847 creators</strong> sharing resources on ShareKit
     </p>
     <div className="flex gap-4 mt-2 text-xs text-slate-500">
       <span>47,392 resources shared</span>
       <span>•</span>
       <span>1.2M signups delivered</span>
     </div>
   </div>
   ```

2. Success stories:
   - Featured creator spotlight
   - "Sarah grew her list by 500 in 30 days"
   - Rotating testimonials

3. Progress celebrations:
   - "You just got your 10th signup! 🎉"
   - "Your resources have been downloaded 100 times!"
   - Achievement badges in profile

Implementation:
- Verified badge logic (email verified)
- PDF metadata extraction (page count, size)
- Platform-wide stats calculation
- Achievement system
- Testimonial rotation

Please implement:
- Trust badges and indicators
- Security reassurance messaging
- Creator credibility displays
- Platform stats component
- Achievement notifications
```

**Acceptance Criteria:**
- [ ] Trust indicators on all share pages
- [ ] No fake/inflated numbers
- [ ] Security messaging clear
- [ ] Creator profiles show credibility
- [ ] Platform stats update daily

---

### Day 10-11: Viral Attribution System

**Objective:** Turn every share page into a ShareKit advertisement

#### Task 2.3: Attribution Footer

**Implementation:**

```typescript
// PROMPT FOR VIRAL ATTRIBUTION:

Add ShareKit attribution to every share page that drives viral growth.

Requirements:

1. Footer on Free plan pages:
   ```jsx
   <footer className="mt-12 pt-8 border-t border-slate-200 text-center">
     <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
       <span>Shared with</span>
       <Heart className="w-4 h-4 text-red-500 fill-red-500" />
       <span>by</span>
       <a 
         href={`/${creator.username}`}
         className="font-medium text-slate-900 hover:text-cyan-600"
       >
         {creator.displayName}
       </a>
       <span>using</span>
       <a 
         href="https://sharekit.net?ref=page-footer"
         target="_blank"
         className="font-semibold text-cyan-600 hover:text-cyan-700 
                    inline-flex items-center gap-1"
       >
         ShareKit
         <ExternalLink className="w-3 h-3" />
       </a>
     </div>
     
     {/* Call to action */}
     <div className="mt-4">
       <a 
         href="https://sharekit.net?ref=page-footer-cta"
         target="_blank"
         className="text-xs text-slate-500 hover:text-cyan-600 underline"
       >
         Create your own share page in 3 minutes →
       </a>
     </div>
   </footer>
   ```

2. Branding removal upgrade prompt:
   - Show in dashboard: "Remove ShareKit branding"
   - Upgrade to Pro CTA
   - Preview with/without branding
   - "Join 247 Pro creators" social proof

3. Powered by badge (Pro plan - optional):
   ```jsx
   {creator.plan === 'pro' && creator.settings.showAttribution && (
     <div className="text-xs text-slate-400 text-center mt-8">
       <a 
         href="https://sharekit.net?ref=powered-by"
         target="_blank"
         className="hover:text-slate-600"
       >
         Powered by ShareKit
       </a>
     </div>
   )}
   ```

4. Referral tracking:
   - UTM parameters: ref=page-footer, ref=powered-by
   - Cookie-based attribution (30 days)
   - Dashboard shows: "3 signups from your attribution"
   - Reward: "You helped 3 creators get started! 🎉"

5. Creator directory:
   - Username links go to: sharekit.net/{username}
   - Show all creator's public resources
   - Bio, website, social links
   - "Follow" button (coming soon)

6. Settings:
   ```typescript
   // Pro users can optionally keep attribution
   settings: {
     showAttribution: boolean, // Default false for Pro
     attributionStyle: 'minimal' | 'standard' | 'prominent'
   }
   ```

Implementation:
- Footer component with plan detection
- Referral cookie tracking
- Creator profile pages
- Attribution analytics
- A/B test footer variations

Please implement:
- Attribution footer (Free plan)
- Optional badge (Pro plan)
- Referral tracking system
- Creator profile pages
- Analytics for attribution clicks
```

**Acceptance Criteria:**
- [ ] Footer appears on all Free plan pages
- [ ] Links track referrals correctly
- [ ] Pro plan can remove branding
- [ ] Creator profiles are public
- [ ] Attribution drives measurable signups

---

#### Task 2.4: Social Share Optimization

**Implementation:**

```typescript
// PROMPT FOR SOCIAL SHARING:

Optimize social sharing to maximize viral coefficient.

Requirements:

1. Pre-filled share text (context-aware):
   
   **Twitter:**
   ```typescript
   const twitterText = `I just got this helpful guide: "${resourceTitle}"
   
   ${resourceDescription ? `${resourceDescription.slice(0, 100)}...` : ''}
   
   Get yours here: ${shareUrl}
   
   Thanks @${creatorTwitterHandle || 'creator'}!`;
   ```
   
   **LinkedIn:**
   ```typescript
   const linkedInText = `I just downloaded a valuable resource: "${resourceTitle}"
   
   ${resourceDescription}
   
   If you're interested in ${category}, check it out: ${shareUrl}
   
   Credit to ${creatorName} for sharing this.`;
   ```
   
   **Email:**
   ```typescript
   Subject: Check out this resource: ${resourceTitle}
   
   Body: 
   Hi,
   
   I just found this helpful resource that I thought you'd be interested in:
   
   "${resourceTitle}"
   ${resourceDescription}
   
   You can get it here: ${shareUrl}
   
   Worth checking out!
   ```

2. Share buttons on download page:
   ```jsx
   <div className="mt-8 p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
     <h3 className="text-lg font-semibold text-slate-900 mb-2">
       Found this helpful?
     </h3>
     <p className="text-sm text-slate-600 mb-4">
       Share it with someone who'd benefit from it
     </p>
     
     <div className="flex gap-2">
       <Button 
         variant="outline" 
         size="sm"
         onClick={() => shareToTwitter()}
       >
         <Twitter className="w-4 h-4 mr-2" />
         Tweet
       </Button>
       
       <Button 
         variant="outline" 
         size="sm"
         onClick={() => shareToLinkedIn()}
       >
         <Linkedin className="w-4 h-4 mr-2" />
         Share
       </Button>
       
       <Button 
         variant="outline" 
         size="sm"
         onClick={() => copyShareLink()}
       >
         <Copy className="w-4 h-4 mr-2" />
         Copy Link
       </Button>
     </div>
   </div>
   ```

3. Share incentive (gamification):
   ```jsx
   {shareCount === 0 && (
     <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
       <p className="text-sm text-amber-900">
         💡 <strong>Pro tip:</strong> Creators who share their resources 
         get 3x more signups. Help others discover this!
       </p>
     </div>
   )}
   ```

4. Track shares:
   ```sql
   CREATE TABLE share_events (
     id uuid PRIMARY KEY,
     page_id uuid REFERENCES pages,
     platform text, -- 'twitter', 'linkedin', 'email', 'copy'
     shared_by_signup_id uuid REFERENCES signups,
     referral_signups integer DEFAULT 0, -- tracked via UTM
     created_at timestamptz DEFAULT NOW()
   );
   ```

5. Referral attribution:
   - Add UTM to shared links: ?ref={signup_id}
   - Track signups from shared links
   - Show referrer: "Thanks to Sarah for sharing!"
   - Creator sees: "5 signups came from shares"

6. Open Graph optimization:
   ```html
   <meta property="og:title" content="${headline}" />
   <meta property="og:description" content="${description}" />
   <meta property="og:image" content="${coverImageUrl}" />
   <meta property="og:url" content="${shareUrl}" />
   <meta property="og:type" content="website" />
   <meta name="twitter:card" content="summary_large_image" />
   <meta name="twitter:title" content="${headline}" />
   <meta name="twitter:description" content="${description}" />
   <meta name="twitter:image" content="${coverImageUrl}" />
   ```

Implementation:
- Share button components
- Pre-filled share text generator
- Share tracking system
- Referral attribution logic
- OG tag generation
- Analytics for share conversion

Please implement:
- Social share buttons with pre-filled text
- Share tracking and analytics
- Referral attribution system
- OG tag optimization
- Share incentive messaging
```

**Acceptance Criteria:**
- [ ] Share buttons work on all platforms
- [ ] Pre-filled text is compelling
- [ ] Shares tracked accurately
- [ ] Referrals attributed to sharers
- [ ] OG tags show rich previews
- [ ] Share-to-signup conversion tracked

---

### Day 12-14: Stripe Integration & Launch Prep

#### Task 2.5: Stripe Checkout Integration

**Implementation:**

```typescript
// PROMPT FOR STRIPE INTEGRATION:

Integrate Stripe for subscription payments with 3-tier pricing.

Setup requirements:

1. Stripe account setup:
   - Create products in Stripe Dashboard:
     * Free: $0 (no Stripe needed, just tracking)
     * Pro: $19/month or $182/year (save $46)
     * Business: $49/month or $470/year (save $118)
   
   - Get price IDs for each plan:
     * PRICE_PRO_MONTHLY=price_xxx
     * PRICE_PRO_YEARLY=price_xxx
     * PRICE_BUSINESS_MONTHLY=price_xxx
     * PRICE_BUSINESS_YEARLY=price_xxx

2. Environment variables:
   ```bash
   VITE_STRIPE_PUBLISHABLE_KEY=pk_xxx
   STRIPE_SECRET_KEY=sk_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

3. Checkout flow:
   ```typescript
   // src/lib/stripe.ts
   import Stripe from 'stripe';
   
   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
     apiVersion: '2023-10-16'
   });
   
   // Create checkout session
   export async function createCheckoutSession(
     userId: string,
     priceId: string,
     successUrl: string,
     cancelUrl: string
   ) {
     const session = await stripe.checkout.sessions.create({
       customer_email: userEmail,
       client_reference_id: userId,
       line_items: [{ price: priceId, quantity: 1 }],
       mode: 'subscription',
       success_url: successUrl,
       cancel_url: cancelUrl,
       subscription_data: {
         trial_period_days: 7, // 7-day free trial
         metadata: { userId }
       }
     });
     
     return session;
   }
   ```

4. Pricing page with Stripe buttons:
   ```jsx
   const PricingCard = ({ plan, price, features, priceId }) => {
     const [isLoading, setIsLoading] = useState(false);
     
     const handleUpgrade = async () => {
       setIsLoading(true);
       
       const response = await fetch('/api/create-checkout-session', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           priceId,
           successUrl: window.location.origin + '/dashboard?upgrade=success',
           cancelUrl: window.location.origin + '/pricing?upgrade=cancelled'
         })
       });
       
       const { sessionId } = await response.json();
       
       // Redirect to Stripe Checkout
       const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
       await stripe.redirectToCheckout({ sessionId });
     };
     
     return (
       <Card>
         <CardHeader>
           <h3>{plan}</h3>
           <div className="text-3xl font-bold">${price}/mo</div>
         </CardHeader>
         <CardContent>
           <ul>{features.map(f => <li key={f}>{f}</li>)}</ul>
           <Button 
             onClick={handleUpgrade}
             disabled={isLoading}
           >
             {isLoading ? 'Loading...' : 'Upgrade to ' + plan}
           </Button>
         </CardContent>
       </Card>
     );
   };
   ```

5. Webhook handler:
   ```typescript
   // src/app/api/webhooks/stripe/route.ts
   export async function POST(request: Request) {
     const body = await request.text();
     const sig = request.headers.get('stripe-signature');
     
     let event;
     try {
       event = stripe.webhooks.constructEvent(
         body,
         sig,
         STRIPE_WEBHOOK_SECRET
       );
     } catch (err) {
       return new Response(`Webhook Error: ${err.message}`, { 
         status: 400 
       });
     }
     
     // Handle events
     switch (event.type) {
       case 'checkout.session.completed':
         await handleCheckoutCompleted(event.data.object);
         break;
       
       case 'customer.subscription.updated':
         await handleSubscriptionUpdated(event.data.object);
         break;
       
       case 'customer.subscription.deleted':
         await handleSubscriptionCancelled(event.data.object);
         break;
       
       case 'invoice.payment_failed':
         await handlePaymentFailed(event.data.object);
         break;
     }
     
     return new Response(JSON.stringify({ received: true }), {
       status: 200
     });
   }
   
   async function handleCheckoutCompleted(session) {
     const userId = session.client_reference_id;
     const subscriptionId = session.subscription;
     
     // Update user's subscription in database
     await supabase
       .from('subscriptions')
       .upsert({
         user_id: userId,
         stripe_customer_id: session.customer,
         stripe_subscription_id: subscriptionId,
         plan_name: getPlanFromPriceId(session.line_items[0].price.id),
         status: 'active',
         current_period_end: new Date(session.expires_at * 1000)
       });
   }
   ```

6. Subscription management:
   - Customer Portal link in settings
   - "Manage Billing" button
   - Redirect to Stripe Customer Portal
   - Handle cancellation, plan changes

7. Usage limit enforcement:
   ```typescript
   // Middleware to check limits
   export async function checkPlanLimits(userId: string) {
     const subscription = await getSubscription(userId);
     const usage = await getCurrentUsage(userId);
     
     const limits = {
       free: { pages: 1, signups: 100, fileSize: 10 },
       pro: { pages: Infinity, signups: 1000, fileSize: 50 },
       business: { pages: Infinity, signups: 10000, fileSize: 100 }
     };
     
     const plan = subscription?.plan_name || 'free';
     const planLimits = limits[plan];
     
     return {
       canCreatePage: usage.pages < planLimits.pages,
       canReceiveSignup: usage.signups < planLimits.signups,
       canUploadFile: fileSize <= planLimits.fileSize,
       usage,
       limits: planLimits
     };
   }
   ```

8. Upgrade prompts:
   ```jsx
   {!canCreatePage && (
     <Alert>
       <AlertTitle>Upgrade to create more pages</AlertTitle>
       <AlertDescription>
         You've reached the limit of 1 page on the Free plan.
         <Button onClick={() => router.push('/pricing')}>
           Upgrade to Pro
         </Button>
       </AlertDescription>
     </Alert>
   )}
   ```

Please implement:
- Stripe SDK setup
- Checkout session creation
- Webhook handler for all events
- Customer Portal integration
- Usage limit checks
- Upgrade prompts throughout app
- Billing page in settings
```

**Acceptance Criteria:**
- [ ] Checkout flow works end-to-end
- [ ] Webhooks process correctly
- [ ] Subscription synced to database
- [ ] Usage limits enforced
- [ ] Customer Portal accessible
- [ ] Cancellation handled gracefully
- [ ] Free trial works (7 days)

---

## Month 2: AI-Powered Differentiation

### Phase 3.1: Smart Content Generation

**Objective:** Use AI to help creators optimize their pages

#### Task 3.1: Headline Optimization

**Implementation:**

```typescript
// PROMPT FOR AI HEADLINES:

Integrate OpenAI API to generate compelling headlines from resource titles.

Requirements:

1. Setup:
   ```bash
   npm install openai
   ```
   
   Environment:
   ```bash
   OPENAI_API_KEY=sk-xxx
   ```

2. API route:
   ```typescript
   // src/app/api/ai/generate-headlines/route.ts
   import OpenAI from 'openai';
   
   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY
   });
   
   export async function POST(request: Request) {
     const { resourceTitle, resourceDescription, targetAudience } = 
       await request.json();
     
     const prompt = `Generate 5 compelling headlines for a resource sharing page.
     
     Resource title: ${resourceTitle}
     Description: ${resourceDescription || 'Not provided'}
     Target audience: ${targetAudience || 'creators and coaches'}
     
     Requirements:
     - Use "generous sharing" language (not salesy)
     - Emphasize value, not capture
     - 8-12 words max
     - Include emotional trigger
     - Use "Get" or "Discover" not "Download"
     
     Output format (JSON):
     {
       "headlines": [
         { "text": "...", "reasoning": "why this works" }
       ]
     }`;
     
     const completion = await openai.chat.completions.create({
       model: "gpt-4-turbo-preview",
       messages: [{ role: "user", content: prompt }],
       temperature: 0.8,
       response_format: { type: "json_object" }
     });
     
     const suggestions = JSON.parse(completion.choices[0].message.content);
     return Response.json(suggestions);
   }
   ```

3. UI component:
   ```jsx
   const HeadlineGenerator = ({ resourceTitle, onSelect }) => {
     const [suggestions, setSuggestions] = useState([]);
     const [isLoading, setIsLoading] = useState(false);
     
     const generateHeadlines = async () => {
       setIsLoading(true);
       const response = await fetch('/api/ai/generate-headlines', {
         method: 'POST',
         body: JSON.stringify({ resourceTitle })
       });
       const data = await response.json();
       setSuggestions(data.headlines);
       setIsLoading(false);
     };
     
     return (
       <div className="space-y-4">
         <Button 
           variant="outline" 
           onClick={generateHeadlines}
           disabled={isLoading}
         >
           {isLoading ? (
             <>
               <Sparkles className="w-4 h-4 mr-2 animate-spin" />
               Generating ideas...
             </>
           ) : (
             <>
               <Sparkles className="w-4 h-4 mr-2" />
               Get AI suggestions
             </>
           )}
         </Button>
         
         {suggestions.length > 0 && (
           <div className="space-y-2">
             <p className="text-sm text-slate-600">
               AI-generated headline suggestions:
             </p>
             {suggestions.map((suggestion, i) => (
               <Card key={i} className="p-3 cursor-pointer hover:border-cyan-500"
                     onClick={() => onSelect(suggestion.text)}>
                 <p className="font-medium">{suggestion.text}</p>
                 <p className="text-xs text-slate-500 mt-1">
                   {suggestion.reasoning}
                 </p>
               </Card>
             ))}
           </div>
         )}
       </div>
     );
   };
   ```

4. Usage tracking:
   - Track AI feature usage per user
   - Pro plan: 50 AI generations/month
   - Business plan: 200 AI generations/month
   - Show remaining credits

5. Fallback for errors:
   - If OpenAI fails, show manual tips
   - Cache successful generations
   - Rate limit: 10 requests/minute per user

Please implement:
- OpenAI integration
- Headline generation API
- UI component with suggestions
- Usage tracking and limits
- Error handling and fallbacks
```

**Acceptance Criteria:**
- [ ] Generates 5 relevant headlines in <5 seconds
- [ ] Suggestions are high-quality
- [ ] One-click to use suggestion
- [ ] Usage limits enforced
- [ ] Graceful error handling

---

#### Task 3.2: Email Subject Line Optimizer

**Similar implementation for email subject lines - follow same pattern as headlines**

#### Task 3.3: Description Enhancement

**Similar implementation for resource descriptions - follow same pattern**

---

## Month 3: Network Effects

### Phase 4.1: Template Marketplace

**Objective:** Enable user-submitted templates for viral growth

#### Task 4.1: Template Submission System

**Implementation:**

```typescript
// PROMPT FOR TEMPLATE MARKETPLACE:

Create a template marketplace where Pro users can submit and monetize templates.

Requirements:

1. Template submission:
   - Pro/Business users can submit templates
   - Template editor (extended page builder)
   - Preview system
   - Pricing: Free or $5-20
   - Revenue share: 70% creator, 30% ShareKit

2. Database schema:
   ```sql
   CREATE TABLE template_marketplace (
     id uuid PRIMARY KEY,
     creator_id uuid REFERENCES auth.users,
     name text NOT NULL,
     description text,
     preview_image_url text NOT NULL,
     
     -- Template data (JSON)
     template_config jsonb NOT NULL,
     
     -- Pricing
     price decimal(10,2) DEFAULT 0,
     is_free boolean DEFAULT true,
     
     -- Stats
     downloads integer DEFAULT 0,
     revenue decimal(10,2) DEFAULT 0,
     rating decimal(3,2),
     
     -- Status
     status text DEFAULT 'pending', -- pending, approved, rejected
     approved_at timestamptz,
     
     created_at timestamptz DEFAULT NOW()
   );
   ```

3. Submission flow:
   - Create template from existing page
   - Add marketplace details (name, description, price)
   - Submit for review
   - Admin approval process
   - Published to marketplace

4. Marketplace UI:
   - Browse templates by category
   - Filter: Free, Paid, Popular, New
   - Preview before purchase
   - One-click purchase (Stripe)
   - Instant download/apply

5. Revenue sharing:
   - Stripe Connect for creator payouts
   - Monthly payouts (min $25)
   - Dashboard shows earnings
   - Transaction history

Please implement:
- Template submission system
- Marketplace browse/search UI
- Purchase flow with Stripe
- Revenue share calculation
- Creator earnings dashboard
```

---

## Ongoing: Optimization & Growth

### Analytics Dashboard

**Track these KPIs weekly:**

1. **Activation Metrics:**
   - Signup → Published page: Target 60%
   - Time to first page: Target <3 minutes
   - Onboarding completion: Target 80%

2. **Engagement Metrics:**
   - DAU/MAU ratio: Target 15%
   - Pages created per user: Target 2.5
   - Signups per page: Target 50

3. **Revenue Metrics:**
   - Free → Pro conversion: Target 12%
   - MRR growth: Target 20% MoM
   - Churn rate: Target <5%

4. **Viral Metrics:**
   - Attribution click-through: Target 5%
   - Share-to-signup conversion: Target 10%
   - Referral signups: Target 15% of new users

---

## Feature Flags & A/B Tests

**Implement feature flags for testing:**

```typescript
// src/lib/feature-flags.ts

export const FLAGS = {
  // Week 1 tests
  ONBOARDING_STEPS: ['3-step', '4-step', '5-step'], // Test optimal flow
  CELEBRATION_CONFETTI: [true, false], // Test impact on retention
  
  // Week 2 tests  
  SOCIAL_PROOF_STYLE: ['counter', 'recent-activity', 'both'],
  ATTRIBUTION_CTA: ['subtle', 'prominent', 'none'],
  
  // Month 2 tests
  AI_SUGGESTIONS_DEFAULT: [true, false], // Auto-show or manual trigger
  HEADLINE_COUNT: [3, 5, 7], // Optimal number of suggestions
};

export function getFlag(userId: string, flagName: string) {
  // Deterministic based on user ID
  const options = FLAGS[flagName];
  const hash = hashUserId(userId);
  const index = hash % options.length;
  return options[index];
}
```

---

## Launch Checklist

**Pre-Launch (Days 13-14):**

- [ ] All Week 1 & 2 tasks complete
- [ ] Stripe live mode enabled
- [ ] Email delivery tested (Resend)
- [ ] Performance: Lighthouse score >90
- [ ] Mobile tested on iOS + Android
- [ ] Error tracking configured (Sentry)
- [ ] Analytics tracking verified
- [ ] Legal pages reviewed
- [ ] Demo video recorded
- [ ] Product Hunt page ready

**Launch Day:**
- [ ] Deploy to production
- [ ] Product Hunt submission (12:01am PST)
- [ ] Social media announcements
- [ ] Email waitlist
- [ ] Monitor errors in real-time
- [ ] Respond to feedback within 1 hour

**Post-Launch (Week 3+):**
- [ ] Daily metrics review
- [ ] User feedback synthesis
- [ ] Bug fixes prioritized
- [ ] Feature requests logged
- [ ] Content marketing started

---

## Success Criteria

**Week 1 Success:**
- [ ] 60% of signups complete onboarding
- [ ] Average setup time <3 minutes
- [ ] Real-time notifications working
- [ ] Zero critical bugs

**Week 2 Success:**
- [ ] 20+ paying customers ($300+ MRR)
- [ ] Social proof drives 5% more signups
- [ ] Attribution links clicked 100+ times
- [ ] Average 3 shares per published page

**Month 2 Success:**
- [ ] 100 paying customers ($1,500+ MRR)
- [ ] AI features used by 40% of Pro users
- [ ] AI suggestions improve conversion 15%+
- [ ] <5% churn rate

**Month 3 Success:**
- [ ] 300 paying customers ($4,500+ MRR)
- [ ] Template marketplace has 20+ templates
- [ ] 10% of revenue from marketplace
- [ ] Network effects visible (viral coefficient >0.5)

---

## Emergency Rollback Plan

If critical issues arise:

1. **Database Issues:**
   - Rollback to previous migration
   - Restore from backup (hourly Supabase backups)

2. **Payment Issues:**
   - Disable checkout temporarily
   - Switch to manual invoicing
   - Refund affected customers

3. **Email Delivery Issues:**
   - Fallback to backup SMTP
   - Queue failed emails for retry
   - Notify affected users

4. **Performance Issues:**
   - Scale Supabase plan up
   - Enable query caching
   - Disable non-critical features

---

## Contact & Support

**For Implementation Questions:**
- Review Living Technical Spec (LTS.md)
- Check component documentation
- Consult Supabase/Next.js docs

**For Strategic Decisions:**
- Reference this roadmap
- Check competitive analysis
- Review success metrics

**For User Feedback:**
- In-app feedback widget
- Email: support@sharekit.net
- Twitter: @sharekit

---

## Appendix: Quick Reference Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Production build
npm run lint               # Check code quality

# Database
supabase migration new <name>    # Create migration
supabase db reset                # Reset local DB
supabase gen types typescript    # Generate types

# Testing
npm test                   # Run all tests
npm run test:e2e          # E2E tests only

# Deployment
git push origin main       # Auto-deploy via CI/CD

# Monitoring
npm run logs               # View production logs
npm run sentry:check       # Check error tracking
```

---

**This roadmap is your blueprint for dominance. Execute with precision. Ship with confidence. Win the market.**

🚀 **Let's build the platform that changes the game.**
