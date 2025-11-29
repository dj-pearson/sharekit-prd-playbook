import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, X, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
}

const CreatePage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [template, setTemplate] = useState("minimal");
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, canCreatePage, getPlanName } = useSubscription();

  useEffect(() => {
    fetchResources();
    fetchUsername();
  }, []);

  useEffect(() => {
    // Auto-generate slug from title
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(generatedSlug);
  }, [title]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('id, title, description, file_name')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load resources",
        variant: "destructive",
      });
    }
  };

  const fetchUsername = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (profile?.username) {
        setUsername(profile.username);
      }
    } catch (error) {
      console.error('Failed to fetch username:', error);
    }
  };

  const toggleResource = (resourceId: string) => {
    setSelectedResources(prev =>
      prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check usage limits
    if (!canCreatePage()) {
      toast({
        title: "Page limit reached",
        description: `You've reached your page limit. Upgrade to ${getPlanName() === 'Free' ? 'Pro' : 'Business'} for unlimited pages.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in");

      // Check if slug is unique
      const { data: existing } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existing) {
        throw new Error("This slug is already taken. Please choose another.");
      }

      // Create page
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .insert({
          user_id: user.id,
          title,
          description,
          slug,
          template,
          is_published: false,
        })
        .select()
        .single();

      if (pageError) throw pageError;

      // Add resources to page
      if (selectedResources.length > 0) {
        const pageResources = selectedResources.map((resourceId, index) => ({
          page_id: page.id,
          resource_id: resourceId,
          display_order: index,
        }));

        const { error: resourceError } = await supabase
          .from('page_resources')
          .insert(pageResources);

        if (resourceError) throw resourceError;
      }

      toast({
        title: "Success!",
        description: "Your page has been created.",
      });

      navigate(`/dashboard/pages/${page.id}/edit`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create page",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const templates = [
    {
      value: "minimal",
      label: "Minimal",
      description: "Clean and simple design"
    },
    {
      value: "modern",
      label: "Modern",
      description: "Bold with vibrant colors"
    },
    {
      value: "professional",
      label: "Professional",
      description: "Corporate and elegant"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard/pages" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pages
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Landing Page</h1>
          <p className="text-muted-foreground">
            Design a beautiful page to share your resources
          </p>
        </div>

        {/* Usage Limit Check */}
        {subscription && !canCreatePage() && (
          <div className="mb-8">
            <UpgradePrompt 
              reason="pages" 
              currentPlan={getPlanName()}
              variant="card"
            />
          </div>
        )}

        {(!subscription || canCreatePage()) && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Page Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Page Details</CardTitle>
                  <CardDescription>Basic information about your page</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Page Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Free Social Media Guide"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {username ? `${username}/` : 'your-username/'}
                      </span>
                      <Input
                        id="slug"
                        placeholder="social-media-guide"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {username ? (
                        <>Your page URL will be: <span className="font-mono">{username}/{slug || 'page-slug'}</span></>
                      ) : (
                        <>Set your username in Settings to see your full page URL</>
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what visitors will get..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Template</CardTitle>
                  <CardDescription>Choose a design style</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          <div>
                            <div className="font-medium">{t.label}</div>
                            <div className="text-xs text-muted-foreground">{t.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Resources */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                  <CardDescription>
                    Select resources to include on this page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {resources.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground mb-4">
                        No resources yet. Upload some first!
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/dashboard/upload">
                          <Plus className="w-4 h-4 mr-2" />
                          Upload Resource
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {resources.map((resource) => (
                        <div
                          key={resource.id}
                          className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                          onClick={() => toggleResource(resource.id)}
                        >
                          <Checkbox
                            checked={selectedResources.includes(resource.id)}
                            onCheckedChange={() => toggleResource(resource.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{resource.title}</div>
                            {resource.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {resource.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="bg-gradient-ocean hover:opacity-90 transition-opacity"
              disabled={!title || !slug || isLoading}
            >
              {isLoading ? "Creating..." : "Create Page"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/pages")}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default CreatePage;
