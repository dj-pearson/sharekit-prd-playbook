import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Mail, Lock } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeDialog } from "@/components/UpgradeDialog";

interface EmailSequence {
  id: string;
  name: string;
  subject: string;
  body: string;
  delay_hours: number;
  is_active: boolean;
  send_order: number;
}

export default function EmailSequences() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { hasFeature } = useSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const hasEmailSequences = hasFeature("ai_features"); // Email sequences are part of Pro+
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    delay_hours: 0,
    is_active: true
  });

  useEffect(() => {
    fetchSequences();
  }, [pageId]);

  const fetchSequences = async () => {
    try {
      const { data, error } = await supabase
        .from("email_sequences")
        .select("*")
        .eq("page_id", pageId)
        .order("send_order", { ascending: true });

      if (error) throw error;
      setSequences(data || []);
    } catch (error: any) {
      toast.error("Failed to load email sequences");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const maxOrder = sequences.length > 0 
        ? Math.max(...sequences.map(s => s.send_order))
        : -1;

      const { error } = await supabase
        .from("email_sequences")
        .insert({
          page_id: pageId,
          ...formData,
          send_order: maxOrder + 1
        });

      if (error) throw error;

      toast.success("Email sequence created");
      setFormData({
        name: "",
        subject: "",
        body: "",
        delay_hours: 0,
        is_active: true
      });
      setShowForm(false);
      fetchSequences();
    } catch (error: any) {
      toast.error("Failed to create sequence");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("email_sequences")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success("Sequence updated");
      fetchSequences();
    } catch (error: any) {
      toast.error("Failed to update sequence");
    }
  };

  const deleteSequence = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sequence?")) return;

    try {
      const { error } = await supabase
        .from("email_sequences")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Sequence deleted");
      fetchSequences();
    } catch (error: any) {
      toast.error("Failed to delete sequence");
    }
  };

  // Show locked state if user doesn't have access
  if (!hasEmailSequences) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/dashboard/pages/${pageId}/edit`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Email Sequences</h1>
              <p className="text-muted-foreground">Automated follow-up emails for your leads</p>
            </div>
          </div>

          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Email Sequences is a Pro Feature</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Set up automated email campaigns to nurture your leads and boost engagement with drip sequences.
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
            feature="Email Sequences"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/dashboard/pages/${pageId}/edit`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Email Sequences</h1>
              <p className="text-muted-foreground">Automated follow-up emails for your leads</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Sequence
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>New Email Sequence</CardTitle>
              <CardDescription>Create an automated email to send to your leads</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Sequence Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Welcome Email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delay">Delay (hours)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min="0"
                    value={formData.delay_hours}
                    onChange={(e) => setFormData({ ...formData, delay_hours: parseInt(e.target.value) })}
                    placeholder="0"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Hours after signup before sending this email
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Welcome! Here's your resource"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Email Body</Label>
                  <Textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Hi {name},&#10;&#10;Thanks for signing up! Here's your resource...&#10;&#10;Variables: {name}, {email}"
                    rows={8}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Use {"{"} name{"}"} and {"{"} email{"}"} to personalize
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Create Sequence</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : sequences.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No email sequences yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sequences.map((sequence, index) => (
              <Card key={sequence.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle>{sequence.name}</CardTitle>
                        <span className="text-sm text-muted-foreground">
                          Email #{index + 1}
                        </span>
                      </div>
                      <CardDescription>
                        Sent {sequence.delay_hours} hours after signup
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={sequence.is_active}
                        onCheckedChange={() => toggleActive(sequence.id, sequence.is_active)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSequence(sequence.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Subject:</span>
                      <p className="text-sm text-muted-foreground">{sequence.subject}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Body:</span>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {sequence.body}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}