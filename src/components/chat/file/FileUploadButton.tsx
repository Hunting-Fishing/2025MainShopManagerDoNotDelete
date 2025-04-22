import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PaperclipIcon, Loader2 } from 'lucide-react';
import { uploadChatFile } from '@/services/chat/file';
import { toast } from '@/hooks/use-toast';
import { FilePreview } from './FilePreview';
import { ChatFileInfo } from '@/services/chat/file/types';

interface FileUploadButtonProps {
  roomId: string;
  onFileUploaded: (fileUrl: string, fileType: string, caption?: string) => void;
  isDisabled?: boolean;
  onFileSelected?: (fileUrl: string, threadParentId?: string) => Promise<void>;
  threadParentId?: string;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  roomId,
  onFileUploaded,
  isDisabled = false,
  onFileSelected,
  threadParentId
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<ChatFileInfo | null>(null);
  
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roomId) return;

    try {
      setIsUploading(true);
      
      const fileInfo = await uploadChatFile(roomId, file);
      
      if (fileInfo) {
        setPreviewFile(fileInfo);
        onFileUploaded(`${fileInfo.type}:${fileInfo.url}`, fileInfo.type);
        
        if (onFileSelected) {
          await onFileSelected(`${fileInfo.type}:${fileInfo.url}`, threadParentId);
        }
        
        toast({
          title: "File uploaded successfully",
          description: `${fileInfo.name} has been attached to the conversation`,
          variant: "success"
        });
      }
      
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileUpload}
        accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />
      <div className="flex flex-col gap-2">
        {previewFile && <FilePreview fileInfo={previewFile} />}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFileButtonClick}
          disabled={isDisabled || isUploading}
          className="rounded-full"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          ) : (
            <PaperclipIcon className="h-5 w-5" />
          )}
          <span className="sr-only">Attach file</span>
        </Button>
      </div>
    </>
  );
};
