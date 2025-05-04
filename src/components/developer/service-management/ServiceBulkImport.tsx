
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';

interface ServiceBulkImportProps {
  onFileUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

const ServiceBulkImport: React.FC<ServiceBulkImportProps> = ({ onFileUpload, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      await onFileUpload(files[0]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files && files[0]) {
      await onFileUpload(files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`relative ${
        isLoading ? 'opacity-70 pointer-events-none' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".json"
      />
      
      <Button 
        onClick={triggerFileInput}
        variant="outline"
        disabled={isLoading}
        className={`relative flex items-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : ''
        }`}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {isLoading ? 'Importing...' : 'Import Services'}
      </Button>
      
      {isDragging && (
        <div className="absolute inset-0 border-2 border-blue-500 bg-blue-50 bg-opacity-30 rounded flex items-center justify-center pointer-events-none">
          <p className="text-blue-700 font-medium">Drop file here</p>
        </div>
      )}
    </div>
  );
};

export default ServiceBulkImport;
