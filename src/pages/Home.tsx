import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Download, Mail, BarChart3, Sparkles, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import Hero3D from "@/components/Hero3D";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-foreground/70 hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-foreground/70 hover:text-foreground transition-colors">Pricing</a>
            <a href="#how-it-works" className="text-foreground/70 hover:text-foreground transition-colors">How it works</a>
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

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-subtle overflow-hidden">
        {/* 3D Background Element */}
        <div className="absolute inset-0 w-full h-full opacity-60 pointer-events-none">
          <div className="w-full h-full pointer-events-auto">
            <Hero3D />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 mb-8 rounded-full bg-primary/10 text-primary text-sm font-medium drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <Sparkles className="w-4 h-4 mr-2" />
              Beautiful by design, simple by default
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-foreground drop-shadow-[0_4px_20px_rgba(255,255,255,0.8)] [text-shadow:_2px_2px_8px_rgb(255_255_255_/_60%),_0_0_40px_rgb(255_255_255_/_40%)]">
              Share what matters,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-ocean drop-shadow-[0_4px_16px_rgba(8,145,178,0.6)] [text-shadow:_0_0_30px_rgb(8_145_178_/_50%)]">see signups in real-time</span>
            </h1>

            <p className="text-lg md:text-xl text-foreground/95 mb-12 max-w-2xl mx-auto font-medium [text-shadow:_0_1px_1px_rgb(0_0_0_/_35%),_0_0_8px_rgb(255_255_255_/_20%)]">
              While others spend hours on setup, you'll be watching live signups in 3 minutes. Beautiful by default. Generous, not salesy.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-ocean hover:opacity-90 transition-opacity text-lg px-8">
                  Start Sharing Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8">
                See How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t">
              <div>
                <div className="text-3xl font-bold text-primary mb-1">3 min</div>
                <div className="text-sm text-muted-foreground">Setup time, not hours</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-1">Real-time</div>
                <div className="text-sm text-muted-foreground">Live signup notifications</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-1">$0-19</div>
                <div className="text-sm text-muted-foreground">Start free forever</div>
              </div>
            </div>
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
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Templates</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
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
