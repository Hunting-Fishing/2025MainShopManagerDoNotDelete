
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PaperclipIcon, Loader2, XIcon } from 'lucide-react';
import { uploadChatFile } from '@/services/chat/file';
import { toast } from '@/hooks/use-toast';
import { FilePreview } from './FilePreview';
// Fix: import the type directly
import type { ChatFileInfo } from '@/services/chat/file/types';

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

  const handleClearFile = () => {
    setPreviewFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        {previewFile && (
          <div className="relative">
            <FilePreview fileInfo={previewFile} className="pr-8" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 h-7 w-7 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
              onClick={handleClearFile}
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFileButtonClick}
          disabled={isDisabled || isUploading}
          className="rounded-full hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          ) : (
            <PaperclipIcon className="h-5 w-5 text-slate-500 hover:text-blue-600 transition-colors" />
          )}
          <span className="sr-only">Attach file</span>
        </Button>
      </div>
    </>
  );
};
