import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, File } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useResourceUpload } from "@/hooks/useResourceUpload";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import DashboardLayout from "@/components/DashboardLayout";

const UploadResource = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { uploadResource, isUploading } = useResourceUpload();
  const navigate = useNavigate();
  const { subscription, canUploadFile, getPlanName } = useSubscription();
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      const fileSizeMB = selectedFile.size / (1024 * 1024);
      
      if (!canUploadFile(fileSizeMB)) {
        toast({
          title: "File too large",
          description: `This file (${Math.round(fileSizeMB)}MB) exceeds your plan limit. Upgrade for larger file uploads.`,
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileSizeMB = selectedFile.size / (1024 * 1024);
      
      if (!canUploadFile(fileSizeMB)) {
        toast({
          title: "File too large",
          description: `This file (${Math.round(fileSizeMB)}MB) exceeds your plan limit. Upgrade for larger file uploads.`,
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      return;
    }

    try {
      await uploadResource({ title, description, file });
      navigate("/dashboard/resources");
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Upload Resource</CardTitle>
            <CardDescription>
              Upload a PDF, guide, checklist, or any file you want to share
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Show file size limit info */}
            {subscription && (
              <div className="mb-4 p-3 bg-muted rounded-lg text-sm">
                <strong>Your plan:</strong> {getPlanName()} - Upload limit: {subscription.limits.file_size_mb}MB per file
                {subscription.plan === 'free' && (
                  <Link to="/pricing" className="ml-2 text-primary hover:underline">
                    Upgrade for larger files →
                  </Link>
                )}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Area */}
              <div className="space-y-2">
                <Label>File</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <File className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium mb-1">
                          Drag & drop your file here
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          or click to browse
                        </p>
                      </div>
                      <Input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.zip"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOC, TXT, images, ZIP (max {subscription?.limits.file_size_mb || 50}MB on your plan)
                </p>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Complete Guide to Social Media Marketing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this resource is about and who it's for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="bg-gradient-ocean hover:opacity-90 transition-opacity"
                  disabled={!file || !title || isUploading}
                >
                  {isUploading ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Resource
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/resources")}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UploadResource;
