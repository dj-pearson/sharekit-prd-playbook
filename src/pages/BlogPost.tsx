import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { SEOHead } from "@/components/SEOHead";
import { organizationSchema, blogPostSchema } from "@/lib/structured-data";
import { ArrowLeft, ArrowRight, Clock, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const BlogPost = () => {
  const { slug } = useParams();

  // This will be replaced with actual data from Supabase
  // For now, using mock data
  const post = {
    id: 1,
    slug: "how-to-share-pdf-with-email-capture",
    title: "How to Share a PDF with Email Capture (5-Minute Guide)",
    excerpt: "Learn how to create professional landing pages that capture emails before delivering your PDF resources. Step-by-step guide with ShareKit.",
    content: `
## Quick Answer

The simplest way to share a PDF with email capture is to use a dedicated resource delivery platform like ShareKit. Upload your PDF, choose a template, customize your landing page, and publish. When someone enters their email, they instantly receive your PDF.

## What You'll Learn

- How to create an email capture landing page for PDFs
- Best practices for converting visitors to subscribers
- Step-by-step setup with ShareKit (5 minutes)
- Common mistakes to avoid

## Why Email Capture Matters for PDF Sharing

Before we dive into the how-to, let's understand why email capture is essential:

1. **Build Your Audience**: Every PDF download becomes a potential customer or follower
2. **Measure Interest**: Track how many people actually want your content
3. **Follow Up**: Nurture relationships with people who engage with your work
4. **Monetize**: Convert free content consumers into paying customers

According to ShareKit's 2025 Creator Survey, creators who use email capture for resource sharing see 3x higher engagement rates compared to those who share resources publicly without capture.

## Step-by-Step: Share a PDF with Email Capture

### Step 1: Choose Your Platform

You have several options for sharing PDFs with email capture:

**Option 1: ShareKit** (Recommended)
- ✅ 5-minute setup
- ✅ Beautiful templates included
- ✅ Automated delivery
- ✅ Analytics included
- ✅ $19/month (or free for 1 page)

**Option 2: ConvertKit + Landing Page**
- ⏰ 2+ hour setup
- 💰 $29-79/month
- 🛠️ Requires technical knowledge
- ✅ Full email marketing suite (if you need it)

**Option 3: Google Drive + Manual Email**
- ⏰ 30 minutes per setup
- 💰 Free
- ❌ No automation
- ❌ Manual email sending
- ❌ No analytics

For most creators, coaches, and consultants, ShareKit provides the best balance of simplicity and functionality.

### Step 2: Upload Your PDF

Once you've chosen ShareKit:

1. Log into your ShareKit dashboard
2. Click "Upload Resource"
3. Drag and drop your PDF (or select from your computer)
4. Add a title and description for internal reference
5. Click "Save"

**Pro Tip**: Optimize your PDF before uploading. Keep file sizes under 10MB for faster delivery. Use descriptive filenames like "Business-Plan-Template-2025.pdf" instead of "Document1.pdf".

### Step 3: Create Your Landing Page

Now create the page where people will enter their email:

1. Click "Create New Page"
2. Choose a template:
   - **Minimal**: Clean, distraction-free (best for lead magnets)
   - **Bold**: Eye-catching, colorful (best for creative content)
   - **Professional**: Corporate, trustworthy (best for consultants)
   - **Serene**: Calm, wellness-focused (best for coaches)
   - **Modern**: Tech-forward (best for course creators)

3. Customize your page:
   - **Headline**: Make it benefit-focused (e.g., "Get Your Free Business Plan Template")
   - **Description**: Explain what's inside and why it's valuable
   - **Button text**: Use action words (e.g., "Download My Template")
   - **Upload preview image**: Show a preview of your PDF

**Example of Great Headlines**:
- ❌ "PDF Guide"
- ✅ "5 Email Templates That Convert 40% Better"
- ❌ "Download Resource"
- ✅ "Free Worksheet: Discover Your Ideal Client in 10 Minutes"

### Step 4: Set Up Email Delivery

Configure what happens after someone enters their email:

1. **Welcome email**: ShareKit automatically sends this with the download link
2. **Customize the sender name**: Use your name or business name
3. **Custom message** (optional): Add a personal note
4. **Thank you page**: Redirect to a custom thank you page (Pro feature)

**Example Welcome Email**:
\`\`\`
Subject: Here's your [Resource Name] 🎉

Hi [First Name],

Thanks for downloading [Resource Name]! Here's your instant access link:

[Download Button]

This link is active for 7 days. Download it now and save it for later.

Questions? Just reply to this email.

Best,
[Your Name]
\`\`\`

### Step 5: Publish and Share

Once you're happy with your page:

1. Click "Publish"
2. Copy your shareable link (e.g., sharekit.net/yourname/guide)
3. Share it:
   - Social media posts
   - Email signature
   - Website
   - YouTube descriptions
   - LinkedIn profile

**Pro Tip**: Use UTM parameters to track which channels drive the most signups. ShareKit automatically tracks source data for you.

## Common Mistakes to Avoid

### Mistake 1: Asking for Too Much Information

❌ Don't ask for:
- Phone number (unless absolutely necessary)
- Company name
- Job title
- Address

✅ Just ask for:
- First name (optional)
- Email address (required)

The more fields you add, the lower your conversion rate. According to ShareKit data, forms with just email have 68% higher conversion rates than forms with 3+ fields.

### Mistake 2: Generic Headlines

❌ "Download My PDF"
✅ "Get the 5-Day Email Course That Converts"

Be specific about the benefit, not just the format.

### Mistake 3: No Preview

Always show a preview image of your PDF. People want to see what they're getting before entering their email. Pages with preview images convert 2.3x better.

### Mistake 4: Complicated Setup

Don't overcomplicate it. You don't need:
- Complex email sequences
- Multiple opt-in forms
- A/B testing (initially)
- Advanced automation

Start simple. Get it live. Improve based on real data.

## FAQ

### How long should my PDF be?

For lead magnets, 5-10 pages is ideal. Long enough to provide value, short enough that people actually read it.

### Should I gate all my content behind email capture?

No. Share 80% of your content freely. Reserve your best, most comprehensive resources for email capture.

### What's a good conversion rate?

- 10-15%: Average
- 20-30%: Good
- 30-40%: Excellent
- 40%+: Outstanding

### Can I use ShareKit with my email marketing platform?

Yes. ShareKit integrates with:
- ConvertKit
- Mailchimp
- ActiveCampaign
- Any platform via Zapier or webhooks

### What if someone doesn't receive the email?

ShareKit automatically handles:
- Email deliverability
- Retry logic (if delivery fails)
- Spam filter optimization

If someone still doesn't receive it, they can request a new link on the thank you page.

## Conclusion

Sharing PDFs with email capture doesn't have to be complicated. With ShareKit, you can:

1. Upload your PDF (1 minute)
2. Choose a template (1 minute)
3. Customize your page (2 minutes)
4. Publish and share (1 minute)

**Total time: 5 minutes.**

No coding, no complex setup, no technical knowledge required.

Ready to start? [Try ShareKit free →](https://sharekit.net/auth)

---

**Next Steps:**
- [The Simple Way to Deliver Digital Resources →](/blog/simple-way-to-deliver-digital-resources)
- [ConvertKit Alternatives for Lead Magnet Delivery →](/blog/convertkit-alternatives-for-lead-magnet-delivery)
    `,
    publishedAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
    author: "Dan Pearson",
    category: "How-To Guides",
    readTime: "7 min read",
    featuredImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200"
  };

  const relatedPosts = [
    {
      id: 2,
      slug: "simple-way-to-deliver-digital-resources",
      title: "The Simple Way to Deliver Digital Resources to Clients",
      category: "How-To Guides",
    },
    {
      id: 3,
      slug: "convertkit-alternatives-for-lead-magnet-delivery",
      title: "ConvertKit Alternatives for Simple Lead Magnet Delivery",
      category: "Comparisons",
    },
  ];

  return (
    <div className="min-h-screen">
      <SEOHead
        title={post.title}
        description={post.excerpt}
        canonical={`https://sharekit.net/blog/${post.slug}`}
        ogType="article"
        ogImage={post.featuredImage}
        publishedTime={post.publishedAt}
        modifiedTime={post.updatedAt}
        author={post.author}
        keywords={[
          'share PDF with email capture',
          'PDF landing page',
          'email capture for PDFs',
          'lead magnet delivery',
          'resource sharing'
        ]}
        structuredData={[
          organizationSchema,
          blogPostSchema({
            title: post.title,
            excerpt: post.excerpt,
            featuredImage: post.featuredImage,
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
            author: post.author
          })
        ]}
      />

      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo size="sm" />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground/70 hover:text-foreground transition-colors">Home</Link>
            <Link to="/pricing" className="text-foreground/70 hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/blog" className="text-foreground/70 hover:text-foreground transition-colors">Blog</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-ocean hover:opacity-90 transition-opacity">
                Start Sharing Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Article Header */}
      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/blog" className="inline-flex items-center text-primary hover:underline mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>

            <div className="mb-8">
              <span className="text-sm font-semibold text-primary mb-4 inline-block">{post.category}</span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>

              <div className="flex items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime}</span>
                </div>
                <span>By {post.author}</span>
              </div>
            </div>

            <div className="aspect-video overflow-hidden rounded-lg mb-12">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content.split('\n').map(line => {
                if (line.startsWith('## ')) return `<h2 class="text-3xl font-bold mt-12 mb-4">${line.slice(3)}</h2>`;
                if (line.startsWith('### ')) return `<h3 class="text-2xl font-bold mt-8 mb-4">${line.slice(4)}</h3>`;
                if (line.startsWith('**') && line.endsWith('**')) return `<p class="font-semibold">${line.slice(2, -2)}</p>`;
                if (line.startsWith('- ')) return `<li class="ml-6">${line.slice(2)}</li>`;
                if (line.trim() === '') return '<br />';
                return `<p class="mb-4 text-foreground/90 leading-relaxed">${line}</p>`;
              }).join('') }} />
            </div>

            {/* CTA Box */}
            <div className="mt-12 p-8 bg-gradient-ocean text-white rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Ready to start sharing PDFs with email capture?</h3>
              <p className="mb-6 opacity-90">
                Create beautiful landing pages in 5 minutes. No coding required.
              </p>
              <Link to="/auth">
                <Button size="lg" variant="secondary">
                  Start Sharing Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Related Posts */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold mb-8">Related Articles</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <span className="text-xs font-semibold text-primary mb-2 inline-block">{relatedPost.category}</span>
                        <h4 className="text-lg font-bold">{relatedPost.title}</h4>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <Logo size="sm" />
              </div>
              <p className="text-muted-foreground">Share what matters</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link to="/dmca" className="hover:text-foreground transition-colors">DMCA Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
            <p>&copy; 2025 ShareKit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPost;
