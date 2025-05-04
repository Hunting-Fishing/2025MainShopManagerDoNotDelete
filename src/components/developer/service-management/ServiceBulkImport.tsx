
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Upload } from 'lucide-react';
import { parseExcelData } from '@/lib/services/excelParser';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { toast } from 'sonner';
import { bulkImportServiceCategories } from '@/lib/services/serviceApi';

interface ServiceBulkImportProps {
  onCancel: () => void;
  onComplete: (categories: ServiceMainCategory[]) => void;
}

const ServiceBulkImport: React.FC<ServiceBulkImportProps> = ({ onCancel, onComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(10);
      
      // Parse the Excel file
      const categories = await parseExcelData(file);
      setProgress(50);
      
      // Perform the bulk import
      await bulkImportServiceCategories(categories, (importProgress) => {
        setProgress(50 + importProgress * 50);
      });
      
      setProgress(100);
      
      // Notify completion
      onComplete(categories);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import services: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsProcessing(false);
    }
  };

  return (
    <div className="py-2">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              type="text"
              value={file?.name || ''}
              placeholder="No file selected"
              readOnly
              className="bg-gray-50"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <Button type="button" onClick={handleUploadClick} disabled={isProcessing}>
            <Upload className="h-4 w-4 mr-2" />
            Browse
          </Button>
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="text-sm text-gray-500">
              Importing services... {Math.round(progress)}%
            </div>
            <Progress value={progress} />
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
          <p className="font-medium">Important:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>File should be in Excel format (.xlsx or .xls)</li>
            <li>Required columns: category, subcategory, service</li>
            <li>Optional columns: price, time, description</li>
            <li>Existing services with the same names may be updated</li>
          </ul>
        </div>
      </div>

      <AlertDialogFooter className="mt-6">
        <AlertDialogCancel onClick={onCancel} disabled={isProcessing}>
          Cancel
        </AlertDialogCancel>
        <Button onClick={handleImport} disabled={!file || isProcessing}>
          Import Services
        </Button>
      </AlertDialogFooter>
    </div>
  );
};

export default ServiceBulkImport;
