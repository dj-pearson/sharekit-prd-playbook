import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailCaptureFormProps {
  pageId: string;
  pageTitle: string;
  resources: Array<{
    title: string;
    description: string | null;
    file_url: string;
    file_name: string;
  }>;
  onSuccess: () => void;
}

export const EmailCaptureForm = ({ pageId, pageTitle, resources, onSuccess }: EmailCaptureFormProps) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email before submission
    if (!validateEmail(email)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Build full name from first and last name for backwards compatibility
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || null;

      // Save email capture with expanded fields
      const { data, error } = await supabase
        .from('email_captures')
        .insert({
          page_id: pageId,
          email,
          full_name: fullName,
          first_name: firstName || null,
          last_name: lastName || null,
          phone: phone || null,
          company: company || null,
        })
        .select('id, download_token')
        .single();

      if (error) throw error;

      if (!data?.download_token) {
        throw new Error('Failed to generate download token');
      }

      // Track analytics event
      await supabase
        .from('analytics_events')
        .insert({
          page_id: pageId,
          event_type: 'signup',
          metadata: { email, first_name: firstName, last_name: lastName, phone, company },
        });

      // Send email with resources (including download token URL)
      const { error: emailError } = await supabase.functions.invoke('send-resource-email', {
        body: {
          email,
          fullName: fullName || null,
          firstName: firstName || null,
          lastName: lastName || null,
          pageTitle,
          resources,
          downloadToken: data.download_token,
        },
      });

      if (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the whole process if email fails
      }

      // Trigger webhooks
      await supabase.functions.invoke('trigger-webhooks', {
        body: {
          event_type: 'signup',
          page_id: pageId,
          data: {
            email,
            full_name: fullName,
            first_name: firstName || null,
            last_name: lastName || null,
            phone: phone || null,
            company: company || null,
            page_title: pageTitle,
          },
        },
      });

      // Schedule email sequences
      if (data?.id) {
        await supabase.functions.invoke('schedule-email-sequences', {
          body: { emailCaptureId: data.id }
        });
      }

      toast({
        title: "Success!",
        description: "Redirecting to your download page...",
      });

      // Redirect to download page with token
      setTimeout(() => {
        navigate(`/d/${data.download_token}`);
      }, 1000);
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                onBlur={() => validateEmail(email)}
                required
                className={emailError ? "border-red-500" : ""}
              />
              {emailError && (
                <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3" />
              )}
            </div>
            {emailError && (
              <p className="text-xs text-red-500">{emailError}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                type="text"
                placeholder="Acme Inc."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-ocean hover:opacity-90 transition-opacity"
            disabled={isSubmitting || !!emailError}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Preparing your download...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Get Instant Access
              </>
            )}
          </Button>

          <div className="space-y-2">
            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to receive emails from us.
            </p>
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
