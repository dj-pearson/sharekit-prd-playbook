import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Download, Mail, BarChart3, Sparkles, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-ocean flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">ShareKit</span>
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
      <section className="py-20 md:py-32 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 mb-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Beautiful by design, simple by default
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Share what matters
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Beautiful pages that deliver your guides, checklists, and resources to people who want them
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
                <div className="text-3xl font-bold text-primary mb-1">5 min</div>
                <div className="text-sm text-muted-foreground">Average setup time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-1">$19/mo</div>
                <div className="text-sm text-muted-foreground">Simple pricing</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-1">20%+</div>
                <div className="text-sm text-muted-foreground">Avg. signup rate</div>
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
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-ocean flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">ShareKit</span>
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
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
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
    icon: Sparkles,
    title: "Beautiful pages in 5 minutes",
    description: "Choose from professionally designed templates. No design skills needed."
  },
  {
    icon: Mail,
    title: "Simple signup, instant delivery",
    description: "People enter their email and get your resource instantly. No friction."
  },
  {
    icon: BarChart3,
    title: "See who's downloading",
    description: "Track views, signups, and downloads with simple, clear analytics."
  },
  {
    icon: Zap,
    title: "Automatic delivery",
    description: "Emails sent within seconds. We handle retries and delivery tracking."
  },
  {
    icon: Users,
    title: "Build your community",
    description: "Stay connected with people who value your content. No spam."
  },
  {
    icon: CheckCircle,
    title: "Professional & generous",
    description: "Language that feels good, not salesy. Your brand, your values."
  }
];

export default Home;
