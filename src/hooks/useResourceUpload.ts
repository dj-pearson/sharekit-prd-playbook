import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ResourceUploadData {
  title: string;
  description?: string;
  file: File;
}

export const useResourceUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadResource = async (data: ResourceUploadData) => {
    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to upload resources");
      }

      // Generate unique file path
      const fileExt = data.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, data.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      // Save resource metadata to database
      const { data: resource, error: dbError } = await supabase
        .from('resources')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          file_url: publicUrl,
          file_name: data.file.name,
          file_size: data.file.size,
          file_type: data.file.type,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "Success!",
        description: "Your resource has been uploaded successfully.",
      });

      return resource;
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload resource. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadResource,
    isUploading,
  };
};
