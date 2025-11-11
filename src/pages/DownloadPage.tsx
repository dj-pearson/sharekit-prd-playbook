import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle2, Mail, Share2, Twitter, Linkedin, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailCapture {
  id: string;
  email: string;
  full_name: string | null;
  download_token: string;
  token_expires_at: string;
  download_count: number;
  page_id: string;
  pages: {
    title: string;
    user_id: string;
    profiles: {
      full_name: string | null;
    } | null;
  } | null;
  page_resources: Array<{
    resource_id: string;
    resources: {
      id: string;
      title: string;
      file_url: string;
      file_name: string;
      file_size: number | null;
    } | null;
  }>;
}

export default function DownloadPage() {
  const { token } = useParams<{ token: string }>();
  const [capture, setCapture] = useState<EmailCapture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailResent, setEmailResent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!token) {
      setError("Invalid download link");
      setLoading(false);
      return;
    }

    fetchCaptureData();
  }, [token]);

  const fetchCaptureData = async () => {
    try {
      const { data, error } = await supabase
        .from("email_captures")
        .select(`
          id,
          email,
          full_name,
          download_token,
          token_expires_at,
          download_count,
          page_id,
          pages (
            title,
            user_id,
            profiles (
              full_name
            )
          )
        `)
        .eq("download_token", token)
        .single();

      if (error) throw error;

      if (!data) {
        setError("Download link not found or expired");
        setLoading(false);
        return;
      }

      // Check if token is expired
      if (new Date(data.token_expires_at) < new Date()) {
        setError("This download link has expired");
        setLoading(false);
        return;
      }

      // Fetch page resources
      const { data: pageResources, error: resourcesError } = await supabase
        .from("page_resources")
        .select(`
          resource_id,
          resources (
            id,
            title,
            file_url,
            file_name,
            file_size
          )
        `)
        .eq("page_id", data.page_id)
        .order("display_order");

      if (resourcesError) throw resourcesError;

      setCapture({
        ...data,
        page_resources: pageResources || [],
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching capture data:", err);
      setError("Failed to load download page");
      setLoading(false);
    }
  };

  const handleDownload = async (resourceId: string, fileUrl: string, fileName: string) => {
    try {
      // Increment download count
      await supabase.rpc("increment_download_count", { token });

      // Track download event
      await supabase.from("analytics_events").insert({
        page_id: capture?.page_id,
        event_type: "download",
        resource_id: resourceId,
        metadata: {
          download_token: token,
          download_count: (capture?.download_count || 0) + 1,
        },
      });

      // Trigger download
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update local state
      if (capture) {
        setCapture({
          ...capture,
          download_count: capture.download_count + 1,
        });
      }

      toast({
        title: "Download started",
        description: "Your resource is being downloaded",
      });
    } catch (err) {
      console.error("Error tracking download:", err);
      toast({
        title: "Download error",
        description: "Failed to track download, but file should download anyway",
        variant: "destructive",
      });
    }
  };

  const handleResendEmail = async () => {
    try {
      // Call edge function to resend email
      const { error } = await supabase.functions.invoke("send-resource-email", {
        body: {
          emailCaptureId: capture?.id,
          resend: true,
        },
      });

      if (error) throw error;

      setEmailResent(true);
      toast({
        title: "Email resent",
        description: `We sent another copy to ${capture?.email}`,
      });
    } catch (err) {
      console.error("Error resending email:", err);
      toast({
        title: "Failed to resend",
        description: "Could not resend email. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleShare = (platform: string) => {
    const pageUrl = `${window.location.origin}/p/${capture?.pages?.title?.toLowerCase().replace(/\s+/g, "-")}`;
    const resourceTitle = capture?.pages?.title || "this resource";
    const creatorName = capture?.pages?.profiles?.full_name || "ShareKit";

    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          `I just got this helpful resource: ${resourceTitle} via @${creatorName}`
        )}&url=${encodeURIComponent(pageUrl)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(pageUrl);
        toast({
          title: "Link copied",
          description: "Share link copied to clipboard",
        });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=550,height=420");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-sky-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your download...</p>
        </div>
      </div>
    );
  }

  if (error || !capture) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-sky-100 px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Download Unavailable</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button className="w-full">Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const resources = capture.page_resources.filter((pr) => pr.resources !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-sky-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Check your inbox!
          </h1>
          <p className="text-slate-600">
            We just sent <span className="font-semibold">{capture.pages?.title}</span> to:
          </p>
          <p className="text-lg font-semibold text-cyan-600 mt-1">
            {capture.email}
          </p>
        </div>

        {/* Download Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Download Now</CardTitle>
            <CardDescription>
              You can also download your resources directly from here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resources.length === 0 ? (
              <p className="text-slate-500 text-center py-4">
                No resources available for this page
              </p>
            ) : (
              resources.map((pr) =>
                pr.resources ? (
                  <div
                    key={pr.resources.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:border-cyan-400 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {pr.resources.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {pr.resources.file_name}
                        {pr.resources.file_size && (
                          <span className="ml-2">
                            ({(pr.resources.file_size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        )}
                      </p>
                    </div>
                    <Button
                      onClick={() =>
                        handleDownload(
                          pr.resources!.id,
                          pr.resources!.file_url,
                          pr.resources!.file_name
                        )
                      }
                      className="ml-4"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ) : null
              )
            )}

            {capture.download_count > 0 && (
              <p className="text-sm text-slate-500 text-center">
                Downloaded {capture.download_count} time{capture.download_count !== 1 ? "s" : ""}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Resend Email Section */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <Mail className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 mb-4">Didn't receive the email?</p>
              {emailResent ? (
                <p className="text-emerald-600 font-semibold">
                  ✓ Email resent successfully!
                </p>
              ) : (
                <Button variant="outline" onClick={handleResendEmail}>
                  Resend Email
                </Button>
              )}
              <p className="text-xs text-slate-500 mt-2">
                Check your spam folder if you still don't see it
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Social Sharing Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Find this valuable?
            </CardTitle>
            <CardDescription>Share it with a friend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleShare("twitter")}
                className="flex-1"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleShare("linkedin")}
                className="flex-1"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleShare("copy")}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Creator Info */}
        {capture.pages?.profiles && (
          <div className="text-center text-slate-600">
            <p className="text-sm">
              Created by{" "}
              <span className="font-semibold">
                {capture.pages.profiles.full_name || "ShareKit User"}
              </span>
            </p>
            <p className="text-xs mt-2 text-slate-500">
              Token expires on{" "}
              {new Date(capture.token_expires_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
