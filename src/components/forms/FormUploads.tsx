
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileUp, FileText, Trash2, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';

interface FormUpload {
  id: string;
  filename: string;
  filetype: string;
  filesize: string;
  uploaded_at: string;
}

export const FormUploads = () => {
  const [uploads, setUploads] = useState<FormUpload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch form uploads from Supabase
  useEffect(() => {
    const fetchUploads = async () => {
      setIsLoading(true);
      try {
        // Query form uploads from the document_uploads table
        const { data, error } = await supabase
          .from('document_uploads')
          .select('*')
          .eq('document_type', 'form')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          const formattedUploads = data.map(upload => ({
            id: upload.id,
            filename: upload.filename || 'Unknown File',
            filetype: upload.filetype || 'Unknown Type',
            filesize: upload.filesize ? formatFileSize(upload.filesize) : 'Unknown Size',
            uploaded_at: upload.created_at
          }));
          
          setUploads(formattedUploads);
        }
      } catch (err) {
        console.error('Error fetching form uploads:', err);
        toast({
          title: "Error",
          description: "Failed to load form uploads.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUploads();
  }, []);
  
  // Format file size to human-readable string
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    // Upload file to Supabase Storage
    try {
      // Upload to storage
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('form_uploads')
        .upload(`forms/${Date.now()}_${file.name}`, file);
        
      if (storageError) throw storageError;
      
      if (storageData) {
        // Create database record
        const { data, error } = await supabase
          .from('document_uploads')
          .insert({
            filename: file.name,
            filetype: file.type,
            filesize: file.size,
            document_type: 'form',
            storage_path: storageData.path
          })
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          // Add to local state
          setUploads([
            {
              id: data[0].id,
              filename: file.name,
              filetype: file.type,
              filesize: formatFileSize(file.size),
              uploaded_at: new Date().toISOString()
            },
            ...uploads
          ]);
          
          toast({
            title: "File uploaded",
            description: "Form has been uploaded successfully.",
          });
        }
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      toast({
        title: "Upload failed",
        description: "Failed to upload the form.",
        variant: "destructive",
      });
    }
  };

  // Handle deleting a form upload
  const handleDeleteUpload = async (id: string) => {
    try {
      // Find the upload to get storage path
      const upload = uploads.find(u => u.id === id);
      if (!upload) return;
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('document_uploads')
        .delete()
        .eq('id', id);
        
      if (dbError) throw dbError;
      
      // Remove from local state
      setUploads(uploads.filter(upload => upload.id !== id));
      
      toast({
        title: "Form deleted",
        description: "The form has been removed successfully."
      });
    } catch (err) {
      console.error('Error deleting form upload:', err);
      toast({
        title: "Delete failed",
        description: "Failed to remove the form.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FileUp className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4 flex text-sm justify-center">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md font-medium text-primary"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </label>
              <p className="pl-1 text-gray-500">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              PDF, Word Documents up to 10MB
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-medium text-lg">Uploaded Forms</h3>
        
        {isLoading ? (
          <div className="text-center p-6">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : uploads.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-muted-foreground">No forms uploaded yet</p>
          </div>
        ) : (
          uploads.map((upload) => (
            <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="bg-primary-50 p-2 rounded">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{upload.filename}</p>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>{upload.filetype}</span>
                    <span>·</span>
                    <span>{upload.filesize}</span>
                    <span>·</span>
                    <span>Uploaded {new Date(upload.uploaded_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteUpload(upload.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
