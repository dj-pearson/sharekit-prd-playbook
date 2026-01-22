import { useState, useEffect, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Download, Mail, BarChart3, Sparkles, Users, Zap, Quote, Star, X, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import Hero3DFallback from "@/components/Hero3DFallback";
import { SEOHead } from "@/components/SEOHead";

// Lazy load the heavy Three.js component
const Hero3D = lazy(() => import("@/components/Hero3D"));
import { organizationSchema, softwareAppSchema, faqSchema } from "@/lib/structured-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Home = () => {
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [dismissedStickyCTA, setDismissedStickyCTA] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling past 600px (past hero section)
      setShowStickyCTA(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen" role="document">
      {/* Main content landmark for skip navigation */}
      <a id="main-content" tabIndex={-1} className="sr-only">Main content start</a>
      <SEOHead
        title="Simple Resource Delivery Platform for Creators, Coaches & Consultants"
        description="ShareKit enables you to share digital resources (PDFs, guides, checklists) through beautiful landing pages with automated email delivery—without the complexity of ConvertKit or Mailchimp. Setup in 5 minutes, not hours."
        canonical="https://sharekit.net"
        keywords={[
          'resource delivery platform',
          'lead magnet tool',
          'email capture landing page',
          'ConvertKit alternative',
          'share PDF with email capture',
          'automated resource delivery',
          'creator tools',
          'coach resource sharing',
          'consultant digital resources'
        ]}
        structuredData={[organizationSchema, softwareAppSchema, faqSchema]}
      />

      {/* Navigation */}
      <nav id="navigation" aria-label="Main navigation" className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <Link to="/">
            <Logo size="sm" />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-foreground/70 hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-foreground/70 hover:text-foreground transition-colors">Pricing</a>
            <a href="#how-it-works" className="text-foreground/70 hover:text-foreground transition-colors">How it works</a>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/auth" className="hidden sm:block">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth" className="hidden sm:block">
              <Button className="bg-gradient-ocean hover:opacity-90 transition-opacity">
                Start Sharing Free
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-10 w-10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6">
                  <a
                    href="#features"
                    className="text-lg font-medium py-2 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                  </a>
                  <a
                    href="#pricing"
                    className="text-lg font-medium py-2 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </a>
                  <a
                    href="#how-it-works"
                    className="text-lg font-medium py-2 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    How it works
                  </a>
                  <a
                    href="#faq"
                    className="text-lg font-medium py-2 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    FAQ
                  </a>
                  <div className="border-t pt-4 mt-4 space-y-3">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-ocean hover:opacity-90 transition-opacity">
                        Start Sharing Free
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-subtle overflow-hidden">
        {/* 3D Background Element - Lazy loaded with lightweight CSS fallback */}
        <div className="absolute inset-0 w-full h-full opacity-60 pointer-events-none">
          <div className="w-full h-full pointer-events-auto">
            <Suspense fallback={<Hero3DFallback />}>
              <Hero3D />
            </Suspense>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 mb-8 rounded-full bg-primary/10 text-primary text-sm font-medium drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <Sparkles className="w-4 h-4 mr-2" />
              Beautiful by design, simple by default
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-foreground drop-shadow-[0_4px_20px_rgba(255,255,255,0.8)] [text-shadow:_2px_2px_8px_rgb(255_255_255_/_60%),_0_0_40px_rgb(255_255_255_/_40%)]">
              Simple Resource Delivery Platform<br/>
              <span className="text-transparent bg-clip-text bg-gradient-ocean drop-shadow-[0_4px_16px_rgba(8,145,178,0.6)] [text-shadow:_0_0_30px_rgb(8_145_178_/_50%)]">for Creators, Coaches & Consultants</span>
            </h1>

            <p className="text-lg md:text-xl text-foreground/95 mb-12 max-w-3xl mx-auto font-medium [text-shadow:_0_1px_1px_rgb(0_0_0_/_35%),_0_0_8px_rgb(255_255_255_/_20%)]">
              ShareKit enables you to share digital resources (PDFs, guides, checklists) through beautiful landing pages with automated email delivery—<strong>without the complexity of ConvertKit or Mailchimp</strong>. Setup in 5 minutes, not hours.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-ocean hover:opacity-90 transition-opacity text-lg px-8">
                  Start Sharing Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto pt-8 border-t">
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">3 min</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Setup time, not hours</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">Real-time</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Live signup notifications</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">$0-19</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Start free forever</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-primary mb-4">
              <Users className="w-5 h-5" />
              <span className="font-semibold">Trusted by Creators</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join 2,000+ creators sharing resources</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Coaches, consultants, and course creators use ShareKit to share their expertise and grow their audience.
            </p>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardContent className="pt-6">
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-ocean flex items-center justify-center text-white font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple as 1-2-3</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              No complex setup, no tech skills required. Just share your knowledge.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:shadow-medium transition-shadow">
              <CardContent className="pt-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold mb-2">1. Upload</div>
                <p className="text-muted-foreground">
                  Upload your PDF, checklist, or guide. We'll handle the rest.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-medium transition-shadow">
              <CardContent className="pt-8">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-2xl font-bold mb-2">2. Customize</div>
                <p className="text-muted-foreground">
                  Choose a beautiful template and make it yours in minutes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-medium transition-shadow">
              <CardContent className="pt-8">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <div className="text-2xl font-bold mb-2">3. Share</div>
                <p className="text-muted-foreground">
                  Get your link and share. We deliver instantly to anyone who signs up.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything you need</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Focus on creating great content. We handle the delivery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border hover:shadow-medium transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, honest pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              No hidden fees. No surprises. Just straightforward pricing that grows with you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <Card className="border-2">
              <CardContent className="pt-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Free</h3>
                  <div className="text-4xl font-bold mb-2">$0</div>
                  <p className="text-muted-foreground">Perfect to get started</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-success mr-2 shrink-0 mt-0.5" />
                    <span>1 share page</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-success mr-2 shrink-0 mt-0.5" />
                    <span>100 signups/month</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-success mr-2 shrink-0 mt-0.5" />
                    <span>3 templates</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-success mr-2 shrink-0 mt-0.5" />
                    <span>Basic analytics</span>
                  </li>
                </ul>
                <Link to="/auth" className="block">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="border-2 border-primary shadow-medium relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-ocean text-white text-sm font-medium rounded-full">
                Most Popular
              </div>
              <CardContent className="pt-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Pro</h3>
                  <div className="text-4xl font-bold mb-2">$19</div>
                  <p className="text-muted-foreground">For growing creators</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-success mr-2 shrink-0 mt-0.5" />
                    <span>Unlimited pages</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-success mr-2 shrink-0 mt-0.5" />
                    <span>1,000 signups/month</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-success mr-2 shrink-0 mt-0.5" />
                    <span>All 5 templates</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-success mr-2 shrink-0 mt-0.5" />
                    <span>Remove branding</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-success mr-2 shrink-0 mt-0.5" />
                    <span>Advanced analytics</span>
                  </li>
                </ul>
                <Link to="/auth" className="block">
                  <Button className="w-full bg-gradient-ocean hover:opacity-90">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Business */}
            <Card className="border-2">
              <CardContent className="pt-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Business</h3>
                  <div className="text-4xl font-bold mb-2">$49</div>
                  <p className="text-muted-foreground">For power users</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-success mr-2 shrink-0 mt-0.5" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-success mr-2 shrink-0 mt-0.5" />
                    <span>10,000 signups/month</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-success mr-2 shrink-0 mt-0.5" />
                    <span>Custom domain</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-success mr-2 shrink-0 mt-0.5" />
                    <span>Team collaboration</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-success mr-2 shrink-0 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Link to="/auth" className="block">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Perfect for Life Coaches, Course Creators & Consultants</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ShareKit is built for creators who want to share their expertise without technical complexity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="border hover:shadow-medium transition-shadow">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-3">Life & Business Coaches</h3>
                <p className="text-muted-foreground text-sm">Share client worksheets, frameworks, assessments, and coaching guides with automated delivery.</p>
              </CardContent>
            </Card>

            <Card className="border hover:shadow-medium transition-shadow">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-3">Course Creators</h3>
                <p className="text-muted-foreground text-sm">Deliver lead magnets to build your audience before launch. Perfect for pre-course engagement.</p>
              </CardContent>
            </Card>

            <Card className="border hover:shadow-medium transition-shadow">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-3">Consultants</h3>
                <p className="text-muted-foreground text-sm">Share case studies, industry reports, proposal templates, and professional resources.</p>
              </CardContent>
            </Card>

            <Card className="border hover:shadow-medium transition-shadow">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-3">Wellness Creators</h3>
                <p className="text-muted-foreground text-sm">Deliver meditation guides, meal plans, workout PDFs, and wellness resources instantly.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why ShareKit Over ConvertKit */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Creators Choose ShareKit Over ConvertKit</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Do ONE thing exceptionally well, instead of everything mediocrely
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">10x</div>
                <div className="text-lg font-semibold mb-2">Faster Setup</div>
                <p className="text-muted-foreground">5 minutes with ShareKit vs 2+ hours with ConvertKit. Start sharing immediately.</p>
              </div>

              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">60%</div>
                <div className="text-lg font-semibold mb-2">Lower Cost</div>
                <p className="text-muted-foreground">$19/month vs ConvertKit's $29-79/month. Same results, less complexity.</p>
              </div>

              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">Zero</div>
                <div className="text-lg font-semibold mb-2">Learning Curve</div>
                <p className="text-muted-foreground">No automation builders, no complex workflows. Just upload, customize, share.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about ShareKit
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  <h3 className="text-lg font-semibold">What is ShareKit used for?</h3>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  ShareKit enables coaches, consultants, and course creators to share digital resources (PDFs, guides, checklists) through beautiful landing pages. It captures emails and delivers resources automatically—without needing a full email marketing platform like ConvertKit or Mailchimp.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  <h3 className="text-lg font-semibold">How is ShareKit different from ConvertKit?</h3>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  ShareKit focuses exclusively on resource delivery, making it simpler and 40% cheaper than ConvertKit ($19/month vs $29-79/month). While ConvertKit is a full email marketing platform, ShareKit does ONE thing exceptionally well: deliver digital resources to people who want them.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  <h3 className="text-lg font-semibold">Can I use ShareKit to grow my email list?</h3>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. ShareKit captures emails when people sign up for your resources. You can then export this list or connect ShareKit to your email marketing platform via integrations.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  <h3 className="text-lg font-semibold">How long does it take to set up ShareKit?</h3>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  ShareKit takes approximately 3-5 minutes to set up. Upload your PDF or guide, choose a template, customize your page, and publish. You'll have your shareable link ready in minutes, not hours.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  <h3 className="text-lg font-semibold">What file formats does ShareKit support?</h3>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  ShareKit supports PDFs, guides, checklists, ebooks, worksheets, and other digital resources. If you can upload it, we can deliver it automatically to your audience.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  <h3 className="text-lg font-semibold">Is there a free trial?</h3>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. ShareKit offers a free plan with 1 published page and 100 signups per month. Perfect for testing before upgrading to Pro ($19/month) or Business ($49/month).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-left">
                  <h3 className="text-lg font-semibold">Can I remove ShareKit branding?</h3>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. The Pro plan ($19/month) and Business plan ($49/month) allow you to remove ShareKit branding from your pages. The free plan includes ShareKit attribution.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger className="text-left">
                  <h3 className="text-lg font-semibold">Does ShareKit work with my email marketing platform?</h3>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. ShareKit integrates with popular email marketing platforms through webhooks and Zapier. You can automatically sync new signups to your existing email list.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9">
                <AccordionTrigger className="text-left">
                  <h3 className="text-lg font-semibold">What happens when someone signs up?</h3>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  When someone enters their email on your ShareKit page, they instantly receive a welcome email with a download link to your resource. You receive a real-time notification about the new signup.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10">
                <AccordionTrigger className="text-left">
                  <h3 className="text-lg font-semibold">Can I use my own domain?</h3>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. The Business plan ($49/month) includes custom domain support. You can use your own domain (like resources.yourdomain.com) instead of sharekit.net URLs.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-11">
                <AccordionTrigger className="text-left">
                  <h3 className="text-lg font-semibold">Who is ShareKit for?</h3>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  ShareKit is perfect for life coaches, business coaches, course creators, consultants, wellness creators, and anyone who wants to share digital resources with email capture. If you have a guide, PDF, or checklist to share, ShareKit makes it simple.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-12">
                <AccordionTrigger className="text-left">
                  <h3 className="text-lg font-semibold">Do I need technical skills to use ShareKit?</h3>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. ShareKit requires zero technical skills or design experience. Upload your resource, choose a template, and you're done. Everything is point-and-click simple.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-13">
                <AccordionTrigger className="text-left">
                  <h3 className="text-lg font-semibold">Can I track analytics and conversions?</h3>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. ShareKit includes analytics for page views, signup conversions, and real-time notifications. Pro and Business plans include advanced analytics with detailed insights.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-14">
                <AccordionTrigger className="text-left">
                  <h3 className="text-lg font-semibold">What if I exceed my signup limit?</h3>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  You'll receive an email notification at 80% capacity. You can upgrade anytime or purchase additional signups for $10 per 500 signups. No signups are ever lost.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-15">
                <AccordionTrigger className="text-left">
                  <h3 className="text-lg font-semibold">Why should I choose ShareKit over ConvertKit or Mailchimp?</h3>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Choose ShareKit if you want to share resources without the complexity and cost of full email marketing platforms. ShareKit is 60% cheaper ($19 vs $29-79), 10x faster to set up (5 minutes vs 2 hours), and does ONE thing exceptionally well: deliver digital resources to people who want them.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-ocean text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to share what matters?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join creators who are sharing their expertise generously and growing their communities.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Sharing Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background" role="contentinfo" aria-label="Site footer">
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
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Get Started</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link to="/dmca" className="hover:text-foreground transition-colors">DMCA Policy</Link></li>
                <li><Link to="/accessibility" className="hover:text-foreground transition-colors">Accessibility</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-muted-foreground space-y-2">
            <p>&copy; 2025 ShareKit. All rights reserved.</p>
            <p className="text-sm">
              Operated by <span className="font-semibold">Pearson Media LLC</span> | DMCA Designated Agent: Registration Number DMCA-1065636
            </p>
          </div>
        </div>
      </footer>

      {/* Sticky CTA Bar */}
      {showStickyCTA && !dismissedStickyCTA && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-ocean text-white py-3 px-4 shadow-lg transform transition-transform duration-300">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 hidden sm:block" />
              <span className="text-sm sm:text-base font-medium">
                Ready to share your resources? Start free, no credit card required.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button size="sm" variant="secondary" className="whitespace-nowrap">
                  Start Free
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 p-1 h-10 w-10"
                onClick={() => setDismissedStickyCTA(true)}
                aria-label="Dismiss promotional banner"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const testimonials = [
  {
    quote: "I was spending hours on ConvertKit. ShareKit got me set up in 5 minutes. My first signup came within an hour!",
    name: "Sarah Mitchell",
    role: "Life Coach"
  },
  {
    quote: "The real-time notifications are addictive. Watching signups come in while I'm on a coaching call is the best feeling.",
    name: "Marcus Chen",
    role: "Business Consultant"
  },
  {
    quote: "Finally, a simple way to share my resources without the complexity. My clients love how easy it is to download.",
    name: "Emily Rodriguez",
    role: "Course Creator"
  }
];

const features = [
  {
    icon: Zap,
    title: "3-minute setup (not 5)",
    description: "While ConvertKit users spend 2 hours in tutorials, you're already getting signups. Lightning-fast, zero learning curve."
  },
  {
    icon: BarChart3,
    title: "Real-time dopamine",
    description: "Watch signups happen live with instant notifications. Every signup creates a moment of celebration. Addictive to check."
  },
  {
    icon: CheckCircle,
    title: "Generous positioning",
    description: "Language that shares, not sells. 'Get my guide' not 'Buy now'. Your audience feels respected, not pressured."
  },
  {
    icon: Sparkles,
    title: "Beautiful by default",
    description: "No design skills needed. Every template is stunning. Your page looks professional in 3 clicks. Zero customization required."
  },
  {
    icon: Users,
    title: "Viral attribution built-in",
    description: "Every free page promotes ShareKit. Built-in word-of-mouth. Your success drives our growth. Remove branding on Pro."
  },
  {
    icon: Mail,
    title: "Instant delivery",
    description: "People enter their email and get your resource in seconds. We handle everything: delivery, retries, tracking."
  }
];

export default Home;
