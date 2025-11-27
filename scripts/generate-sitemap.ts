import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

// Initialize Supabase client for sitemap generation
const supabaseUrl = process.env.SUPABASE_URL || 'https://tvjgpqmqybtlazabzszo.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2amdwcW1xeWJ0bGF6YWJ6c3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MjQyNTgsImV4cCI6MjA3ODQwMDI1OH0.vvqlkJy7OfaBUHgZBlQVLZrCkz6FTydza35Wn03fxSQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Static routes that should always be in the sitemap
const staticRoutes: SitemapUrl[] = [
  {
    loc: '/',
    changefreq: 'weekly',
    priority: 1.0
  },
  {
    loc: '/pricing',
    changefreq: 'monthly',
    priority: 0.9
  },
  {
    loc: '/pricing/compare',
    changefreq: 'monthly',
    priority: 0.8
  },
  {
    loc: '/blog',
    changefreq: 'daily',
    priority: 0.9
  },
  {
    loc: '/terms',
    changefreq: 'yearly',
    priority: 0.3
  },
  {
    loc: '/privacy',
    changefreq: 'yearly',
    priority: 0.3
  },
  {
    loc: '/dmca',
    changefreq: 'yearly',
    priority: 0.3
  }
];

// Fetch blog posts from Supabase
async function fetchBlogPosts(): Promise<SitemapUrl[]> {
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }

    return (posts || []).map(post => ({
      loc: `/blog/${post.slug}`,
      lastmod: post.updated_at || post.published_at || new Date().toISOString(),
      changefreq: 'monthly' as const,
      priority: 0.8
    }));
  } catch (err) {
    console.error('Failed to fetch blog posts for sitemap:', err);
    return [];
  }
}

// Fetch published public pages from Supabase
async function fetchPublicPages(): Promise<SitemapUrl[]> {
  try {
    const { data: pages, error } = await supabase
      .from('pages')
      .select('slug, updated_at, user_id')
      .eq('is_published', true);

    if (error) {
      console.error('Error fetching public pages:', error);
      return [];
    }

    // For public pages, we need to get the username to build the URL
    // Since we can't easily join here, we'll return pages with just the slug
    // In a more complete implementation, you'd join with profiles to get usernames
    return (pages || []).map(page => ({
      loc: `/p/${page.slug}`,
      lastmod: page.updated_at || new Date().toISOString(),
      changefreq: 'weekly' as const,
      priority: 0.6
    }));
  } catch (err) {
    console.error('Failed to fetch public pages for sitemap:', err);
    return [];
  }
}

function generateSitemapXML(urls: SitemapUrl[], hostname: string): string {
  const urlsXml = urls.map(url => {
    const loc = `${hostname}${url.loc}`;
    const lastmod = url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : '';
    const changefreq = url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : '';
    const priority = url.priority !== undefined ? `<priority>${url.priority}</priority>` : '';

    return `  <url>
    <loc>${loc}</loc>${lastmod ? '\n    ' + lastmod : ''}${changefreq ? '\n    ' + changefreq : ''}${priority ? '\n    ' + priority : ''}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
}

export async function generateSitemap(outDir: string, hostname = 'https://sharekit.net') {
  console.log('🔄 Fetching dynamic content from Supabase...');

  // Fetch dynamic content from Supabase
  const [blogPosts, publicPages] = await Promise.all([
    fetchBlogPosts(),
    fetchPublicPages()
  ]);

  console.log(`  📝 Found ${blogPosts.length} blog posts`);
  console.log(`  📄 Found ${publicPages.length} public pages`);

  const allUrls = [...staticRoutes, ...blogPosts, ...publicPages];
  const sitemapXml = generateSitemapXML(allUrls, hostname);

  const sitemapPath = path.join(outDir, 'sitemap.xml');

  // Ensure the directory exists
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(sitemapPath, sitemapXml);

  console.log(`✅ Sitemap generated with ${allUrls.length} URLs at ${sitemapPath}`);

  return sitemapPath;
}

// When running directly as a script
if (import.meta.url === `file://${process.argv[1]}`) {
  const outDir = process.argv[2] || './dist';
  generateSitemap(outDir).catch(console.error);
}
