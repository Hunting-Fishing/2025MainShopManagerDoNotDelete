
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ServiceBulkImportProps {
  onFileUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

const ServiceBulkImport: React.FC<ServiceBulkImportProps> = ({ onFileUpload, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setError(null);
    if (files && files[0]) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        await onFileUpload(file);
      } else {
        setError("Please select an Excel file (.xlsx or .xls)");
      }
      
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
    setError(null);

    const files = event.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        await onFileUpload(file);
      } else {
        setError("Please select an Excel file (.xlsx or .xls)");
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
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
          accept=".xlsx,.xls"
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
            <p className="text-blue-700 font-medium">Drop Excel file here</p>
          </div>
        )}
      </div>
      
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ServiceBulkImport;
