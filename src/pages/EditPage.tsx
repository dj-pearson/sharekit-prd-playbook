import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Loader2, GripVertical, TestTube2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
}

interface PageResource {
  resource_id: string;
  display_order: number;
}

const EditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [template, setTemplate] = useState("minimal");
  const [isPublished, setIsPublished] = useState(false);
  const [availableResources, setAvailableResources] = useState<Resource[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [resourceOrder, setResourceOrder] = useState<PageResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (id) {
      fetchPageData();
      fetchResources();
      fetchUsername();
    }
  }, [id]);

  const fetchPageData = async () => {
    try {
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('title, description, slug, template, is_published')
        .eq('id', id)
        .single();

      if (pageError) throw pageError;

      setTitle(pageData.title);
      setDescription(pageData.description || "");
      setSlug(pageData.slug);
      setTemplate(pageData.template);
      setIsPublished(pageData.is_published);

      // Fetch assigned resources
      const { data: pageResources, error: resourcesError } = await supabase
        .from('page_resources')
        .select('resource_id, display_order')
        .eq('page_id', id)
        .order('display_order', { ascending: true });

      if (resourcesError) throw resourcesError;

      const resourceIds = pageResources.map(pr => pr.resource_id);
      setSelectedResources(resourceIds);
      setResourceOrder(pageResources);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load page",
        variant: "destructive",
      });
      navigate('/dashboard/pages');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('id, title, description, file_name')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableResources(data || []);
    } catch (error: any) {
      console.error('Error fetching resources:', error);
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

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  };

  const handleResourceToggle = (resourceId: string) => {
    setSelectedResources(prev => {
      if (prev.includes(resourceId)) {
        return prev.filter(id => id !== resourceId);
      } else {
        return [...prev, resourceId];
      }
    });
  };

  const moveResource = (resourceId: string, direction: 'up' | 'down') => {
    const currentIndex = selectedResources.indexOf(resourceId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === selectedResources.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newOrder = [...selectedResources];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
    setSelectedResources(newOrder);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Update page
      const { error: pageError } = await supabase
        .from('pages')
        .update({
          title,
          description: description || null,
          slug,
          template,
          is_published: isPublished,
        })
        .eq('id', id);

      if (pageError) throw pageError;

      // Delete existing page resources
      const { error: deleteError } = await supabase
        .from('page_resources')
        .delete()
        .eq('page_id', id);

      if (deleteError) throw deleteError;

      // Insert new page resources
      if (selectedResources.length > 0) {
        const pageResources = selectedResources.map((resourceId, index) => ({
          page_id: id,
          resource_id: resourceId,
          display_order: index,
        }));

        const { error: insertError } = await supabase
          .from('page_resources')
          .insert(pageResources);

        if (insertError) throw insertError;
      }

      toast({
        title: "Success!",
        description: "Page updated successfully",
      });

      navigate('/dashboard/pages');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update page",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/pages')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pages
        </Button>

        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Edit Page</h1>
              <p className="text-muted-foreground">
                Update your landing page settings and resources
              </p>
            </div>
            <div className="flex gap-2">
              <Link to={`/dashboard/pages/${id}/sequences`}>
                <Button variant="outline">
                  Email Sequences
                </Button>
              </Link>
              <Link to={`/dashboard/pages/${id}/ab-testing`}>
                <Button variant="outline" className="gap-2">
                  <TestTube2 className="h-4 w-4" />
                  A/B Testing
                </Button>
              </Link>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update the title, description, and URL of your page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Page Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="My Awesome Resource"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description of what this page offers..."
                    rows={3}
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
                      value={slug}
                      onChange={(e) => setSlug(generateSlug(e.target.value))}
                      placeholder="my-awesome-resource"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {username ? (
                      <>Your page URL: <span className="font-mono">{username}/{slug}</span></>
                    ) : (
                      <>Set your username in Settings to see your full page URL</>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Template</CardTitle>
                <CardDescription>
                  Choose the design template for your page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Resource Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
                <CardDescription>
                  Select and order the resources to include on this page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableResources.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No resources available. Create resources first.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {availableResources.map((resource) => {
                      const isSelected = selectedResources.includes(resource.id);
                      const index = selectedResources.indexOf(resource.id);
                      
                      return (
                        <div
                          key={resource.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            isSelected ? 'bg-accent/50 border-primary' : 'bg-background'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleResourceToggle(resource.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{resource.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {resource.file_name}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => moveResource(resource.id, 'up')}
                                disabled={index === 0}
                              >
                                ↑
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => moveResource(resource.id, 'down')}
                                disabled={index === selectedResources.length - 1}
                              >
                                ↓
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Publishing */}
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
                <CardDescription>
                  Control whether your page is live
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="published"
                    checked={isPublished}
                    onCheckedChange={(checked) => setIsPublished(checked as boolean)}
                  />
                  <Label htmlFor="published" className="font-normal cursor-pointer">
                    Publish this page (make it publicly accessible)
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/pages')}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !title || !slug || selectedResources.length === 0}
                className="bg-gradient-ocean hover:opacity-90 transition-opacity"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPage;
