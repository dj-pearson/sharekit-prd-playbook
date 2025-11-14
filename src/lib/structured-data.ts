// Structured Data (JSON-LD) Library for ShareKit

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ShareKit",
  "url": "https://sharekit.net",
  "logo": "https://sharekit.net/logo.png",
  "description": "Simple platform for creators to share digital resources through beautiful landing pages with automated email delivery",
  "sameAs": [
    "https://twitter.com/sharekit",
    "https://www.linkedin.com/company/sharekit"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "hello@sharekit.net",
    "contactType": "Customer Support"
  },
  "founder": {
    "@type": "Person",
    "name": "Dan Pearson"
  }
};

export const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ShareKit",
  "description": "Simple platform for coaches and creators to share digital resources through beautiful landing pages with automated email delivery",
  "url": "https://sharekit.net",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "0",
    "highPrice": "49",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "127"
  },
  "featureList": [
    "Email capture forms",
    "Automated resource delivery",
    "Landing page builder",
    "Analytics dashboard",
    "Template library"
  ],
  "screenshot": "https://sharekit.net/og-image.png",
  "softwareVersion": "1.0"
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is ShareKit used for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ShareKit enables coaches, consultants, and course creators to share digital resources (PDFs, guides, checklists) through beautiful landing pages. It captures emails and delivers resources automatically—without needing a full email marketing platform like ConvertKit or Mailchimp."
      }
    },
    {
      "@type": "Question",
      "name": "How is ShareKit different from ConvertKit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ShareKit focuses exclusively on resource delivery, making it simpler and 40% cheaper than ConvertKit ($19/month vs $29-79/month). While ConvertKit is a full email marketing platform, ShareKit does ONE thing exceptionally well: deliver digital resources to people who want them."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use ShareKit to grow my email list?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. ShareKit captures emails when people sign up for your resources. You can then export this list or connect ShareKit to your email marketing platform via integrations."
      }
    },
    {
      "@type": "Question",
      "name": "How long does it take to set up ShareKit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ShareKit takes approximately 3-5 minutes to set up. Upload your PDF or guide, choose a template, customize your page, and publish. You'll have your shareable link ready in minutes, not hours."
      }
    },
    {
      "@type": "Question",
      "name": "What file formats does ShareKit support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ShareKit supports PDFs, guides, checklists, ebooks, worksheets, and other digital resources. If you can upload it, we can deliver it automatically to your audience."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a free trial?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. ShareKit offers a free plan with 1 published page and 100 signups per month. Perfect for testing before upgrading to Pro ($19/month) or Business ($49/month)."
      }
    },
    {
      "@type": "Question",
      "name": "Can I remove ShareKit branding?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The Pro plan ($19/month) and Business plan ($49/month) allow you to remove ShareKit branding from your pages. The free plan includes ShareKit attribution."
      }
    },
    {
      "@type": "Question",
      "name": "Does ShareKit work with my email marketing platform?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. ShareKit integrates with popular email marketing platforms through webhooks and Zapier. You can automatically sync new signups to your existing email list."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when someone signs up?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When someone enters their email on your ShareKit page, they instantly receive a welcome email with a download link to your resource. You receive a real-time notification about the new signup."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use my own domain?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The Business plan ($49/month) includes custom domain support. You can use your own domain (like resources.yourdomain.com) instead of sharekit.net URLs."
      }
    },
    {
      "@type": "Question",
      "name": "Who is ShareKit for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ShareKit is perfect for life coaches, business coaches, course creators, consultants, wellness creators, and anyone who wants to share digital resources with email capture. If you have a guide, PDF, or checklist to share, ShareKit makes it simple."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need technical skills to use ShareKit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. ShareKit requires zero technical skills or design experience. Upload your resource, choose a template, and you're done. Everything is point-and-click simple."
      }
    },
    {
      "@type": "Question",
      "name": "Can I track analytics and conversions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. ShareKit includes analytics for page views, signup conversions, and real-time notifications. Pro and Business plans include advanced analytics with detailed insights."
      }
    },
    {
      "@type": "Question",
      "name": "What if I exceed my signup limit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You'll receive an email notification at 80% capacity. You can upgrade anytime or purchase additional signups for $10 per 500 signups. No signups are ever lost."
      }
    },
    {
      "@type": "Question",
      "name": "Why should I choose ShareKit over ConvertKit or Mailchimp?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Choose ShareKit if you want to share resources without the complexity and cost of full email marketing platforms. ShareKit is 60% cheaper ($19 vs $29-79), 10x faster to set up (5 minutes vs 2 hours), and does ONE thing exceptionally well: deliver digital resources to people who want them."
      }
    }
  ]
};

export const blogPostSchema = (post: {
  title: string;
  excerpt: string;
  featuredImage?: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": post.title,
  "description": post.excerpt,
  "image": post.featuredImage || "https://sharekit.net/og-default.png",
  "datePublished": post.publishedAt,
  "dateModified": post.updatedAt,
  "author": {
    "@type": "Person",
    "name": post.author
  },
  "publisher": organizationSchema
});

export const howToSchema = (howTo: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; image?: string }>;
  totalTime?: string;
  estimatedCost?: { currency: string; value: string };
}) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": howTo.name,
  "description": howTo.description,
  "totalTime": howTo.totalTime || "PT5M",
  "estimatedCost": howTo.estimatedCost || {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "step": howTo.steps.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "name": step.name,
    "text": step.text,
    "image": step.image,
  }))
});

export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});
