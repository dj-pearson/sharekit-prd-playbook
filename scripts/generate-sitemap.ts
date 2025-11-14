import fs from 'fs';
import path from 'path';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

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

// Sample blog posts (in production, this would fetch from Supabase)
const blogPosts: SitemapUrl[] = [
  {
    loc: '/blog/how-to-share-pdf-with-email-capture',
    lastmod: new Date().toISOString(),
    changefreq: 'monthly',
    priority: 0.8
  },
  {
    loc: '/blog/simple-way-to-deliver-digital-resources',
    lastmod: new Date().toISOString(),
    changefreq: 'monthly',
    priority: 0.8
  },
  {
    loc: '/blog/convertkit-alternatives-for-lead-magnet-delivery',
    lastmod: new Date().toISOString(),
    changefreq: 'monthly',
    priority: 0.8
  }
];

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

export function generateSitemap(outDir: string, hostname = 'https://sharekit.net') {
  const allUrls = [...staticRoutes, ...blogPosts];
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
  generateSitemap(outDir);
}
