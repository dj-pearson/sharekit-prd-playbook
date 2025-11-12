import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, TrendingUp, Lock } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeDialog } from "@/components/UpgradeDialog";

export default function ABTesting() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { subscription, hasFeature } = useSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const hasABTesting = hasFeature("ai_features"); // A/B testing is part of AI features in Pro+
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newVariant, setNewVariant] = useState({
    name: "",
    slug: "",
    template: "minimal",
    trafficPercentage: 50,
  });

  const { data: page } = useQuery({
    queryKey: ["page", pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("id", pageId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: variants } = useQuery({
    queryKey: ["variants", pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_variants")
        .select("*")
        .eq("page_id", pageId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: variantStats } = useQuery({
    queryKey: ["variant-stats", pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("variant_analytics")
        .select("variant_id, event_type")
        .in("variant_id", variants?.map(v => v.id) || []);
      if (error) throw error;
      
      const stats: Record<string, { views: number; conversions: number }> = {};
      data?.forEach(event => {
        if (!stats[event.variant_id]) {
          stats[event.variant_id] = { views: 0, conversions: 0 };
        }
        if (event.event_type === "view") stats[event.variant_id].views++;
        if (event.event_type === "conversion") stats[event.variant_id].conversions++;
      });
      
      return stats;
    },
    enabled: !!variants && variants.length > 0,
  });

  const createVariant = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("page_variants").insert({
        page_id: pageId,
        name: newVariant.name,
        slug: newVariant.slug,
        template: newVariant.template,
        traffic_percentage: newVariant.trafficPercentage,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants", pageId] });
      setIsCreating(false);
      setNewVariant({ name: "", slug: "", template: "minimal", trafficPercentage: 50 });
      toast.success("Variant created successfully");
    },
    onError: () => toast.error("Failed to create variant"),
  });

  const toggleVariant = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("page_variants")
        .update({ is_active: isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants", pageId] });
      toast.success("Variant updated");
    },
  });

  const deleteVariant = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("page_variants").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants", pageId] });
      toast.success("Variant deleted");
    },
  });

  const updateTraffic = useMutation({
    mutationFn: async ({ id, percentage }: { id: string; percentage: number }) => {
      const { error } = await supabase
        .from("page_variants")
        .update({ traffic_percentage: percentage })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants", pageId] });
    },
  });

  // Show locked state if user doesn't have access
  if (!hasABTesting) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">A/B Testing</h1>
            <p className="text-muted-foreground">{page?.title}</p>
          </div>
        </div>

        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">A/B Testing is a Pro Feature</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Test multiple variations of your landing pages to optimize conversions and maximize your results.
            </p>
            <Button
              onClick={() => setShowUpgradeDialog(true)}
              className="bg-gradient-ocean hover:opacity-90"
              size="lg"
            >
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>

        <UpgradeDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
          requiredPlan="pro"
          feature="A/B Testing"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">A/B Testing</h1>
          <p className="text-muted-foreground">{page?.title}</p>
        </div>
      </div>

      <div className="mb-6">
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Variant
        </Button>
      </div>

      {isCreating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Variant</CardTitle>
            <CardDescription>Create a new page variant for A/B testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Variant Name</Label>
              <Input
                id="name"
                value={newVariant.name}
                onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                placeholder="Variant B"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={newVariant.slug}
                onChange={(e) => setNewVariant({ ...newVariant, slug: e.target.value })}
                placeholder="variant-b"
              />
            </div>
            <div>
              <Label>Traffic Percentage: {newVariant.trafficPercentage}%</Label>
              <Slider
                value={[newVariant.trafficPercentage]}
                onValueChange={([value]) => setNewVariant({ ...newVariant, trafficPercentage: value })}
                max={100}
                step={5}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createVariant.mutate()}>Create</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {variants?.map((variant) => {
          const stats = variantStats?.[variant.id] || { views: 0, conversions: 0 };
          const conversionRate = stats.views > 0 ? ((stats.conversions / stats.views) * 100).toFixed(2) : "0.00";

          return (
            <Card key={variant.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{variant.name}</CardTitle>
                    <CardDescription>/{variant.slug}</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={variant.is_active}
                      onCheckedChange={(checked) =>
                        toggleVariant.mutate({ id: variant.id, isActive: checked })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteVariant.mutate(variant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{stats.views}</div>
                    <div className="text-sm text-muted-foreground">Views</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.conversions}</div>
                    <div className="text-sm text-muted-foreground">Conversions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold flex items-center justify-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {conversionRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">Conversion Rate</div>
                  </div>
                </div>
                <div>
                  <Label>Traffic Allocation: {variant.traffic_percentage}%</Label>
                  <Slider
                    value={[variant.traffic_percentage]}
                    onValueChange={([value]) =>
                      updateTraffic.mutate({ id: variant.id, percentage: value })
                    }
                    max={100}
                    step={5}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
