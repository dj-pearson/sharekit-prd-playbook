# Lighthouse Performance Report

**Date:** 2026-01-02
**Analysis Type:** Build output analysis & code review

## Critical Performance Issues Found

### 1. Massive Main Bundle Size (Critical)
- **Main bundle:** 1,525.57 KB (432.69 KB gzipped) - **Over 3x the recommended 500 KB limit**
- **Analytics chunk:** 417.50 KB (114.50 KB gzipped)
- Vite warning: "Some chunks are larger than 500 kB after minification"

### 2. Three.js Loaded on Critical Path (Critical)
- `Hero3D.tsx` component imports Three.js, @react-three/fiber, and @react-three/drei
- Home page eagerly imports Hero3D, loading ~400KB+ of 3D libraries on initial page load
- **Impact:** Blocks main thread, delays First Contentful Paint (FCP) and Largest Contentful Paint (LCP)

### 3. Eagerly Loaded Critical Pages (High)
- `Home.tsx` - Contains heavy 3D component
- `PublicPage.tsx` - Critical for SEO but loads full Supabase client
- `Auth.tsx`, `DownloadPage.tsx`, `NotFound.tsx` - All in main bundle

### 4. No Vendor Code Splitting (High)
- No `manualChunks` configuration in Vite
- React, React DOM, React Router, TanStack Query, Supabase, Radix UI all in single chunk
- Heavy charting library (recharts) creating 417KB chunk for Analytics

### 5. Heavy Dependencies in Main Bundle
| Dependency | Estimated Size | Location |
|------------|---------------|----------|
| Three.js | ~400 KB | Home page 3D hero |
| recharts | ~200 KB | Analytics pages |
| @supabase/supabase-js | ~100 KB | All authenticated pages |
| Radix UI components | ~150 KB | Throughout app |
| framer-motion | ~50 KB | Animations |

## Recommended Fixes

### Priority 1: Lazy Load Hero3D Component
```tsx
// Before (in Home.tsx)
import Hero3D from "@/components/Hero3D";

// After
const Hero3D = lazy(() => import("@/components/Hero3D"));
```

### Priority 2: Configure Vite Manual Chunks
Add to vite.config.ts:
```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'three': ['three', '@react-three/fiber', '@react-three/drei'],
        'vendor': ['react', 'react-dom', 'react-router-dom'],
        'charts': ['recharts'],
        'supabase': ['@supabase/supabase-js'],
        'ui': [/* radix components */],
      }
    }
  }
}
```

### Priority 3: Lazy Load Home Page 3D Section
Only load 3D component when visible in viewport using Intersection Observer

### Priority 4: Add Preload Hints
For critical resources like fonts, critical CSS

## Expected Improvements After Fixes

| Metric | Current (Estimated) | Target |
|--------|---------------------|--------|
| Main Bundle | 1,525 KB | < 300 KB |
| First Contentful Paint | > 3s | < 1.5s |
| Time to Interactive | > 5s | < 3s |
| Largest Contentful Paint | > 4s | < 2.5s |

## Implementation Status

- [x] Lazy load Hero3D component with Suspense fallback
- [x] Configure Vite manual chunks for code splitting
- [x] Add lightweight CSS-based fallback for 3D hero
- [ ] Lazy load heavy pages that aren't critical path
- [ ] Add resource preloading hints

## Results After Optimization

### Bundle Size Comparison

| Chunk | Before | After | Improvement |
|-------|--------|-------|-------------|
| **Main bundle** | 1,525 KB (432 KB gz) | 292 KB (87 KB gz) | **81% reduction** |
| Three.js | (in main) | 1,004 KB (separate, lazy) | Now lazy-loaded |
| Charts (recharts) | (in main) | 382 KB (separate) | Only loaded on Analytics |
| Supabase | (in main) | 176 KB (separate) | Separate chunk |
| React vendor | (in main) | 22 KB (separate) | Separate chunk |
| Hero3D component | (in main) | 4 KB (lazy) | Now lazy-loaded |

### Key Improvements

1. **Initial page load reduced by 81%** - Main bundle from 1.5MB to 292KB
2. **Three.js deferred** - Heavy 3D library now loads asynchronously after initial paint
3. **Lightweight fallback** - CSS-based animation shows immediately while 3D loads
4. **Better caching** - Vendor chunks cached separately from app code
5. **Faster Time to Interactive** - Less JavaScript to parse on initial load

### Expected Lighthouse Score Improvements

| Metric | Before (Est.) | After (Est.) |
|--------|---------------|--------------|
| Performance | 40-50 | 70-85 |
| First Contentful Paint | 2.5-3.5s | 1.0-1.5s |
| Largest Contentful Paint | 4-5s | 2-3s |
| Time to Interactive | 5-7s | 2-4s |
| Total Blocking Time | 1000ms+ | 200-500ms |
