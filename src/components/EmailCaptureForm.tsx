import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailCaptureFormProps {
  pageId: string;
  pageTitle: string;
  onSuccess: () => void;
}

export const EmailCaptureForm = ({ pageId, pageTitle, onSuccess }: EmailCaptureFormProps) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save email capture
      const { error } = await supabase
        .from('email_captures')
        .insert({
          page_id: pageId,
          email,
          full_name: fullName || null,
        });

      if (error) throw error;

      // Track analytics event
      await supabase
        .from('analytics_events')
        .insert({
          page_id: pageId,
          event_type: 'signup',
          metadata: { email, full_name: fullName },
        });

      toast({
        title: "Success!",
        description: "Check your email for the download links.",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 shadow-large">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Get Instant Access</CardTitle>
        <CardDescription>
          Enter your email to download {pageTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name (Optional)</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-ocean hover:opacity-90 transition-opacity"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Get Free Access
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
