
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Cloud, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  currentFiles?: File[];
}

export function FileUploader({
  onFilesSelected,
  acceptedFileTypes = ['.xlsx', '.xls', '.csv', '.json'],
  maxFiles = 5,
  currentFiles = []
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>(currentFiles || []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Limit to max number of files
    const newFiles = acceptedFiles.slice(0, maxFiles - files.length);
    const updatedFiles = [...files, ...newFiles];
    
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  }, [files, maxFiles, onFilesSelected]);

  const removeFile = (fileToRemove: File) => {
    const filteredFiles = files.filter(file => file !== fileToRemove);
    setFiles(filteredFiles);
    onFilesSelected(filteredFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes ? acceptedFileTypes.reduce((acc, type) => {
      if (type.startsWith('.')) {
        // Convert file extension to MIME type if possible
        const mimeType = 
          type === '.xlsx' || type === '.xls' ? { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [] } :
          type === '.csv' ? { 'text/csv': [] } :
          type === '.json' ? { 'application/json': [] } :
          { [type]: [] };
        return { ...acc, ...mimeType };
      }
      return { ...acc, [type]: [] };
    }, {}) : undefined,
    maxFiles: maxFiles - files.length,
  });

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'xlsx':
      case 'xls':
        return <File className="h-6 w-6 text-green-500" />;
      case 'csv':
        return <File className="h-6 w-6 text-blue-500" />;
      case 'json':
        return <File className="h-6 w-6 text-amber-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary hover:bg-primary/5'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Cloud className="h-10 w-10 text-gray-400" />
          <p className="text-sm font-medium">
            {isDragActive
              ? 'Drop the files here...'
              : `Drag & drop files here, or click to select`
            }
          </p>
          <p className="text-xs text-gray-500">
            {acceptedFileTypes?.join(', ')} (Max {maxFiles} files)
          </p>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Select Files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Selected Files ({files.length})</p>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li 
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md border"
              >
                <div className="flex items-center gap-2">
                  {getFileIcon(file.name)}
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => removeFile(file)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
