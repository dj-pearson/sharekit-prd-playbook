import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Globe, CheckCircle, XCircle, RefreshCw, Trash2, Copy, AlertTriangle, Lock } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeDialog } from "@/components/UpgradeDialog";

interface CustomDomain {
  id: string;
  domain: string;
  is_verified: boolean;
  verification_token: string;
  dns_verified_at: string | null;
  ssl_issued_at: string | null;
  created_at: string;
  user_id: string;
  updated_at: string;
}

export default function CustomDomains() {
  const { toast } = useToast();
  const { hasFeature } = useSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const hasCustomDomain = hasFeature("custom_domain"); // Custom domain is Business tier
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_domains')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDomains(data || []);
    } catch (error: any) {
      console.error('Error loading domains:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load custom domains",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate domain format
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(newDomain)) {
        throw new Error("Invalid domain format. Use format: subdomain.yourdomain.com");
      }

      const { data, error } = await supabase
        .from('custom_domains')
        .insert([{
          user_id: user.id,
          domain: newDomain.toLowerCase(),
          verification_token: crypto.randomUUID(),
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to create domain");

      setDomains([data as CustomDomain, ...domains]);
      setNewDomain("");

      toast({
        title: "Domain added",
        description: "Follow the DNS instructions to verify your domain",
      });
    } catch (error: any) {
      toast({
        title: "Failed to add domain",
        description: error.message || "Could not add custom domain",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerifyDomain = async (domainId: string, domain: string) => {
    setVerifying(domainId);
    try {
      // Get the verification token for this domain
      const domainRecord = domains.find(d => d.id === domainId);
      if (!domainRecord) throw new Error("Domain record not found");

      // Check TXT record using DNS-over-HTTPS (Cloudflare)
      const txtResponse = await fetch(
        `https://cloudflare-dns.com/dns-query?name=_sharekit-verification.${domain}&type=TXT`,
        {
          headers: { 'Accept': 'application/dns-json' }
        }
      );
      const txtData = await txtResponse.json();

      // Check CNAME record
      const cnameResponse = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${domain}&type=CNAME`,
        {
          headers: { 'Accept': 'application/dns-json' }
        }
      );
      const cnameData = await cnameResponse.json();

      // Verify TXT record matches verification token
      const txtRecordFound = txtData.Answer?.some((record: any) =>
        record.data?.replace(/"/g, '') === domainRecord.verification_token
      );

      // Verify CNAME points to sharekit
      const cnameRecordFound = cnameData.Answer?.some((record: any) =>
        record.data?.includes('sharekit') || record.data?.includes('cname.sharekit.app')
      );

      if (!txtRecordFound) {
        throw new Error("TXT verification record not found. Please ensure you've added the _sharekit-verification TXT record.");
      }

      if (!cnameRecordFound) {
        throw new Error("CNAME record not found or incorrect. Please ensure your CNAME points to cname.sharekit.app");
      }

      // Both records verified - update domain status
      const { error } = await supabase
        .from('custom_domains')
        .update({
          is_verified: true,
          dns_verified_at: new Date().toISOString(),
        })
        .eq('id', domainId);

      if (error) throw error;

      // Reload domains
      await loadDomains();

      toast({
        title: "Domain verified",
        description: `${domain} has been successfully verified! DNS records are configured correctly.`,
      });
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "DNS records not found. Please check your configuration and try again.",
        variant: "destructive",
      });
    } finally {
      setVerifying(null);
    }
  };

  const handleDeleteDomain = async (domainId: string, domain: string) => {
    if (!confirm(`Are you sure you want to delete ${domain}?`)) return;

    try {
      const { error } = await supabase
        .from('custom_domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;

      setDomains(domains.filter(d => d.id !== domainId));

      toast({
        title: "Domain removed",
        description: `${domain} has been deleted`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete",
        description: error.message || "Could not delete domain",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "DNS record copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading domains...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show locked state if user doesn't have access
  if (!hasCustomDomain) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Custom Domains</h1>
            <p className="text-muted-foreground mt-1">
              Connect your own domain to ShareKit pages
            </p>
          </div>

          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Custom Domains is a Business Feature</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Use your own branded domain for your landing pages. Perfect for businesses that want a professional, white-label experience.
              </p>
              <Button
                onClick={() => setShowUpgradeDialog(true)}
                className="bg-gradient-ocean hover:opacity-90"
                size="lg"
              >
                Upgrade to Business
              </Button>
            </CardContent>
          </Card>

          <UpgradeDialog
            open={showUpgradeDialog}
            onOpenChange={setShowUpgradeDialog}
            requiredPlan="business"
            feature="Custom Domains"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Custom Domains</h1>
          <p className="text-muted-foreground mt-1">
            Connect your own domain to ShareKit pages
          </p>
        </div>

        {/* Add New Domain */}
        <Card>
          <CardHeader>
            <CardTitle>Add Custom Domain</CardTitle>
            <CardDescription>
              Connect a custom subdomain to your ShareKit account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDomain} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain Name</Label>
                <Input
                  id="domain"
                  placeholder="share.yourdomain.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use a subdomain like share.yourdomain.com or downloads.yourbrand.com
                </p>
              </div>
              <Button type="submit" disabled={isAdding || !newDomain}>
                <Plus className="w-4 h-4 mr-2" />
                {isAdding ? "Adding..." : "Add Domain"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Domains List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Custom Domains</CardTitle>
            <CardDescription>
              Manage and verify your custom domains
            </CardDescription>
          </CardHeader>
          <CardContent>
            {domains.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No custom domains</h3>
                <p className="text-muted-foreground">
                  Add a custom domain to use your own branded URL
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>SSL</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domains.map((domain) => (
                      <TableRow key={domain.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            {domain.domain}
                          </div>
                        </TableCell>
                        <TableCell>
                          {domain.is_verified ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {domain.ssl_issued_at ? (
                            <Badge variant="outline">Enabled</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Disabled
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(domain.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!domain.is_verified && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVerifyDomain(domain.id, domain.domain)}
                                disabled={verifying === domain.id}
                              >
                                <RefreshCw className={`w-4 h-4 mr-1 ${verifying === domain.id ? 'animate-spin' : ''}`} />
                                Verify
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDomain(domain.id, domain.domain)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* DNS Configuration Instructions */}
        {domains.some(d => !d.is_verified) && (
          <Card>
            <CardHeader>
              <CardTitle>DNS Configuration</CardTitle>
              <CardDescription>
                Add these DNS records to verify your domain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {domains.filter(d => !d.is_verified).map(domain => (
                <div key={domain.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{domain.domain}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(domain.verification_token)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Token
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Add these DNS records to your domain provider:</p>

                    <div className="bg-slate-50 p-3 rounded font-mono text-xs space-y-1">
                      <p><strong>Type:</strong> TXT</p>
                      <p><strong>Name:</strong> _sharekit-verification</p>
                      <p><strong>Value:</strong> {domain.verification_token}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded font-mono text-xs space-y-1">
                      <p><strong>Type:</strong> CNAME</p>
                      <p><strong>Name:</strong> {domain.domain}</p>
                      <p><strong>Value:</strong> cname.sharekit.app</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    DNS propagation can take up to 48 hours. Click "Verify" once records are added.
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
