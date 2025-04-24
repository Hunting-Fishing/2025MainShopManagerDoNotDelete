
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { File, Paperclip, Trash2, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FormUpload } from '@/types/form';
import { useToast } from '@/hooks/use-toast';
import { formatBytes } from '@/lib/utils';

interface FormUploadsProps {
  formId?: string;
  readOnly?: boolean;
  onUploadComplete?: (uploads: FormUpload[]) => void;
}

export const FormUploads: React.FC<FormUploadsProps> = ({ 
  formId,
  readOnly = false,
  onUploadComplete
}) => {
  const [uploads, setUploads] = useState<FormUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  // Instead of using supabase.from('form_uploads'), we should use a correct table
  // If there's no form_uploads table in the schema, we'll need to use a different approach
  // For now, let's assume we're storing files directly in storage instead of using a database table
  
  const fetchUploads = async () => {
    if (!formId) return;
    
    setLoading(true);
    try {
      // Instead of querying a non-existent table, let's list files from storage
      const { data, error } = await supabase.storage
        .from('form_attachments')
        .list(`${formId}`);
        
      if (error) throw error;
      
      // Convert Storage objects to our FormUpload interface
      const formattedUploads: FormUpload[] = data ? data.map(file => ({
        id: file.id,
        filename: file.name,
        filetype: file.metadata?.mimetype || 'application/octet-stream',
        filesize: file.metadata?.size || 0,
        file_url: supabase.storage.from('form_attachments').getPublicUrl(`${formId}/${file.name}`).data.publicUrl,
        uploaded_by: 'current_user',
        uploaded_at: file.created_at || new Date().toISOString(),
        form_id: formId
      })) : [];
      
      setUploads(formattedUploads);
      
      if (onUploadComplete) {
        onUploadComplete(formattedUploads);
      }
    } catch (error) {
      console.error('Error fetching uploads:', error);
      toast({
        title: "Error",
        description: "Could not load uploaded files",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUploads();
  }, [formId]);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length || !formId) return;
    
    setUploading(true);
    const file = event.target.files[0];
    
    try {
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('form_attachments')
        .upload(`${formId}/${file.name}`, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      // Get the public URL
      const publicUrl = supabase.storage
        .from('form_attachments')
        .getPublicUrl(`${formId}/${file.name}`).data.publicUrl;
        
      const newUpload: FormUpload = {
        id: Math.random().toString(36).substring(2, 9), // Generate a random ID
        filename: file.name,
        filetype: file.type,
        filesize: file.size,
        file_url: publicUrl,
        uploaded_by: 'current_user',
        uploaded_at: new Date().toISOString(),
        form_id: formId
      };
      
      setUploads(prev => [...prev, newUpload]);
      
      if (onUploadComplete) {
        onUploadComplete([...uploads, newUpload]);
      }
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Could not upload the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset input value so the same file can be uploaded again if needed
      event.target.value = '';
    }
  };
  
  const handleDeleteFile = async (upload: FormUpload) => {
    if (!formId) return;
    
    try {
      // Delete from storage
      const { error } = await supabase.storage
        .from('form_attachments')
        .remove([`${formId}/${upload.filename}`]);
        
      if (error) throw error;
      
      // Update state
      setUploads(prev => prev.filter(item => item.id !== upload.id));
      
      if (onUploadComplete) {
        onUploadComplete(uploads.filter(item => item.id !== upload.id));
      }
      
      toast({
        title: "File deleted",
        description: `${upload.filename} has been removed.`,
      });
      
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete the file. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="file-upload"
            className="sr-only"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className={`flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md cursor-pointer ${
              uploading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? 'Uploading...' : (
              <>
                <Upload className="h-4 w-4" />
                Upload File
              </>
            )}
          </label>
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : uploads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Paperclip className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No files uploaded yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-md border"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-md">
                  <File className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{upload.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(upload.filesize)}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <a href={upload.file_url} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                </Button>
                
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFile(upload)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
