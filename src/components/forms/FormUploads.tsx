
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FileUploader } from '@/components/workOrders/documents/FileUploader';
import { useToast } from '@/hooks/use-toast';
import { FormUpload } from '@/types/form';

interface FormUploadsProps {
  formId?: string;
  readOnly?: boolean;
}

export const FormUploads: React.FC<FormUploadsProps> = ({ formId, readOnly = false }) => {
  const [uploads, setUploads] = useState<FormUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!formId) return;
    
    const fetchUploads = async () => {
      try {
        setLoading(true);
        
        // Check if form_uploads table exists in the database
        const { data: tables } = await supabase
          .from('form_uploads')
          .select('id')
          .eq('form_id', formId)
          .limit(1);
          
        if (tables) {
          const { data } = await supabase
            .from('form_uploads')
            .select('*')
            .eq('form_id', formId)
            .order('uploaded_at', { ascending: false });
            
          setUploads(data as FormUpload[] || []);
        } else {
          console.warn('form_uploads table does not exist');
          setUploads([]);
        }
      } catch (error) {
        console.error('Error fetching uploads:', error);
        setUploads([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUploads();
  }, [formId]);
  
  const handleFileUpload = async (files: File[]) => {
    if (!formId || !files.length) return;
    
    try {
      setUploading(true);
      
      for (const file of files) {
        // Generate a unique file path
        const filePath = `forms/${formId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        
        // Upload file to storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from('form_files')
          .upload(filePath, file, { contentType: file.type });
          
        if (storageError) throw storageError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('form_files')
          .getPublicUrl(filePath);
        
        // Check if form_uploads table exists and create a record
        try {
          const { data, error } = await supabase
            .from('form_uploads')
            .insert({
              form_id: formId,
              filename: file.name,
              filetype: file.type,
              filesize: file.size,
              file_url: publicUrl,
              uploaded_by: 'current-user', // Should come from auth context
            })
            .select();
            
          if (error) throw error;
          
          // Add the new upload to the list
          if (data && data[0]) {
            setUploads(prev => [data[0] as FormUpload, ...prev]);
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          // If table doesn't exist, we'll just show the file based on the storage data
          const newUpload: FormUpload = {
            id: Date.now().toString(),
            filename: file.name,
            filetype: file.type,
            filesize: file.size,
            file_url: publicUrl,
            uploaded_at: new Date().toISOString(),
            uploaded_by: 'current-user'
          };
          setUploads(prev => [newUpload, ...prev]);
        }
      }
      
      toast({
        title: 'Files uploaded',
        description: `${files.length} file${files.length === 1 ? '' : 's'} uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'An error occurred during the file upload',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };
  
  const handleDeleteFile = async (upload: FormUpload) => {
    if (readOnly) return;
    
    try {
      // Extract the path from the URL
      const filePath = upload.file_url.split('/').slice(-2).join('/');
      
      // Delete from storage
      await supabase.storage
        .from('form_files')
        .remove([filePath]);
      
      // Delete from database if the table exists
      try {
        await supabase
          .from('form_uploads')
          .delete()
          .eq('id', upload.id);
      } catch (dbError) {
        console.error('Database delete error:', dbError);
        // If table doesn't exist, we'll just remove it from the UI
      }
      
      // Update UI
      setUploads(uploads.filter(u => u.id !== upload.id));
      
      toast({
        title: 'File deleted',
        description: `${upload.filename} was deleted successfully`,
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: 'An error occurred while deleting the file',
        variant: 'destructive',
      });
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    else return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Attached Files</h3>
      
      {!readOnly && (
        <FileUploader 
          onFileSelect={handleFileUpload}
          isUploading={uploading}
          maxFiles={5}
          accept={{
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
          }}
        />
      )}
      
      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : uploads.length > 0 ? (
          <div className="space-y-2">
            {uploads.map((upload) => (
              <div key={upload.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <a 
                      href={upload.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium text-sm"
                    >
                      {upload.filename}
                    </a>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(upload.filesize)}
                    </div>
                  </div>
                </div>
                
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFile(upload)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No files attached
          </div>
        )}
      </div>
    </div>
  );
};
