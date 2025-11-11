import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Globe, CheckCircle, XCircle, RefreshCw, Trash2, Copy, AlertTriangle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CustomDomain {
  id: string;
  domain: string;
  is_verified: boolean;
  verification_token: string;
  dns_verified_at: string | null;
  ssl_enabled: boolean;
  created_at: string;
  page_id: string | null;
}

export default function CustomDomains() {
  const { toast } = useToast();
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
        .insert({
          user_id: user.id,
          domain: newDomain.toLowerCase(),
        })
        .select()
        .single();

      if (error) throw error;

      setDomains([data, ...domains]);
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
      // In production, this would call a Supabase Edge Function
      // that checks DNS records using a DNS API

      // Simulated verification for demo
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update domain verification status
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
        description: `${domain} has been successfully verified`,
      });
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: "DNS records not found. Please check your configuration and try again.",
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Custom Domains</h1>
          <p className="text-muted-foreground mt-1">
            Connect your own domain to ShareKit pages (Business Plan)
          </p>
        </div>

        {/* Business Plan Upsell */}
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <strong>Business Plan Feature:</strong> Custom domains are available on the Business plan.
            Upgrade to use your own branded domain for your share pages.
          </AlertDescription>
        </Alert>

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
                          {domain.ssl_enabled ? (
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
