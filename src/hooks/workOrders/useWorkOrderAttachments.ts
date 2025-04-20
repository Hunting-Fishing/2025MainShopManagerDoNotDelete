
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface WorkOrderAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export function useWorkOrderAttachments(workOrderId: string) {
  const [attachments, setAttachments] = useState<WorkOrderAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    
    try {
      const fileId = uuidv4();
      const fileExt = file.name.split('.').pop();
      const fileName = `${fileId}.${fileExt}`;
      const filePath = `${workOrderId}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('work_order_attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('work_order_attachments')
        .getPublicUrl(filePath);

      const newAttachment: WorkOrderAttachment = {
        id: fileId,
        fileName: file.name,
        fileType: file.type,
        fileUrl: publicUrl,
        thumbnailUrl: file.type.startsWith('image/') ? publicUrl : undefined,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'current-user' // This will be replaced with actual user info when auth is implemented
      };

      setAttachments(prev => [...prev, newAttachment]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    attachments,
    isUploading,
    error,
    uploadFile
  };
}
