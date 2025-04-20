
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Upload, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from '@/hooks/use-mobile';

interface FileUploaderProps {
  onFileSelect: (files: File[]) => void;
  maxFiles?: number;
  accept?: Record<string, string[]>;
  isUploading?: boolean;
}

export function FileUploader({
  onFileSelect,
  maxFiles = 5,
  accept,
  isUploading = false
}: FileUploaderProps) {
  const isMobile = useIsMobile();
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFileSelect(acceptedFiles);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    accept
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors",
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
        isUploading && "pointer-events-none opacity-50",
        isMobile ? "p-4" : "p-6"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        {isUploading ? (
          <>
            <File className={cn("text-gray-400 animate-pulse", isMobile ? "h-8 w-8" : "h-10 w-10")} />
            <p className={cn("text-gray-500", isMobile ? "text-xs" : "text-sm")}>Uploading files...</p>
          </>
        ) : (
          <>
            <Upload className={cn("text-gray-400", isMobile ? "h-8 w-8" : "h-10 w-10")} />
            <p className={cn("text-gray-500", isMobile ? "text-xs" : "text-sm")}>
              {isDragActive ? (
                "Drop the files here..."
              ) : (
                isMobile ? 
                "Tap to select files" :
                "Drag & drop files here, or click to select files"
              )}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Maximum {maxFiles} files
            </p>
          </>
        )}
      </div>
    </div>
  );
}
