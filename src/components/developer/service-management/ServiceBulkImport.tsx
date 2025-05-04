
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { Upload, Check, X, FileUp, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { bulkImportServiceCategories } from '@/lib/services/serviceApi';

interface ServiceBulkImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

const ServiceBulkImport: React.FC<ServiceBulkImportProps> = ({
  open,
  onOpenChange,
  onImportComplete
}) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateFile(selectedFile);
    }
  };

  const validateFile = (selectedFile: File) => {
    // Check file type
    if (selectedFile.type !== 'application/json') {
      setError('Only JSON files are supported');
      setFile(null);
      return;
    }

    // Check file size (limit to 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setImporting(true);
    setProgress(0);
    setError(null);

    try {
      // Read the file as text
      const text = await file.text();
      
      // Parse the JSON
      let parsedData: ServiceMainCategory[];
      try {
        parsedData = JSON.parse(text);
        
        // Validate the structure (basic validation)
        if (!Array.isArray(parsedData)) {
          throw new Error('Invalid format: Expected an array of categories');
        }

        // Validate each category has required fields
        const invalidItems = parsedData.filter(item => !item.name || !item.id);
        if (invalidItems.length > 0) {
          throw new Error('Invalid data: Some categories are missing required fields');
        }
        
      } catch (err) {
        throw new Error('Invalid JSON format');
      }

      // Import the data
      await bulkImportServiceCategories(parsedData, (progress) => {
        setProgress(Math.round(progress * 100));
      });

      // Success
      toast({
        title: "Import successful",
        description: `Imported ${parsedData.length} service categories`,
      });
      
      // Close dialog and refresh data
      onOpenChange(false);
      onImportComplete();
      
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center sm:text-left">Import Service Data</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver ? "border-blue-400 bg-blue-50" : "border-slate-200"
            } cursor-pointer`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              const fileInput = document.getElementById('file-upload');
              if (fileInput) fileInput.click();
            }}
          >
            <input
              id="file-upload"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
              disabled={importing}
            />
            
            <div className="flex flex-col items-center">
              <FileUp className="h-10 w-10 text-slate-400 mb-2" />
              <p className="text-sm font-medium mb-1">
                {file ? file.name : "Drop your JSON file here or click to browse"}
              </p>
              <p className="text-xs text-slate-500">
                JSON files only, max 5MB
              </p>
            </div>
          </div>
          
          {file && (
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-md text-sm flex items-start">
              <Check className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">File selected</p>
                <p className="text-xs text-blue-600 mt-1">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-md text-sm flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
          
          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Importing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
        
        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={importing || !file} className="bg-blue-600 hover:bg-blue-700">
            {importing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceBulkImport;
