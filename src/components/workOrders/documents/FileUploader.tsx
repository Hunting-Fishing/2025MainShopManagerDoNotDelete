
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Upload, File } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
        isUploading && "pointer-events-none opacity-50"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        {isUploading ? (
          <>
            <File className="h-10 w-10 text-gray-400 animate-pulse" />
            <p className="text-sm text-gray-500">Uploading files...</p>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-gray-400" />
            <p className="text-sm text-gray-500">
              {isDragActive ? (
                "Drop the files here..."
              ) : (
                "Drag & drop files here, or click to select files"
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
