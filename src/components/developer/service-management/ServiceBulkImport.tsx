
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Upload, Download } from 'lucide-react';
import { parseExcelFile, generateExcelTemplate } from '@/lib/services/excelParser';
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

  const handleDownloadTemplate = () => {
    try {
      const templateBlob = generateExcelTemplate();
      const url = URL.createObjectURL(templateBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'service-categories-template.xlsx';
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Failed to generate template:', error);
      toast.error('Failed to generate template');
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(10);
      
      console.log('Parsing Excel file...');
      const result = await parseExcelFile(file);
      
      if (result.errors.length > 0) {
        toast.error(`Import errors: ${result.errors.join(', ')}`);
        setIsProcessing(false);
        return;
      }
      
      if (result.categories.length === 0) {
        toast.error('No valid service categories found in the file');
        setIsProcessing(false);
        return;
      }
      
      setProgress(50);
      console.log('Importing categories to database...', result.categories);
      
      // Perform the bulk import
      await bulkImportServiceCategories(result.categories, (importProgress) => {
        setProgress(50 + importProgress * 50);
      });
      
      setProgress(100);
      
      // Notify completion
      onComplete(result.categories);
      toast.success(`Successfully imported ${result.categories.length} service categories`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import services: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Service Categories</h3>
          <p className="text-gray-600 text-sm">Upload an Excel file with multiple sheets to bulk import service categories, subcategories, and jobs.</p>
        </div>

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
            <Button type="button" onClick={handleUploadClick} disabled={isProcessing} className="bg-indigo-600 hover:bg-indigo-700">
              <Upload className="h-4 w-4 mr-2" />
              Browse
            </Button>
            <Button type="button" onClick={handleDownloadTemplate} variant="outline" disabled={isProcessing}>
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="text-sm text-gray-500">
                Importing services... {Math.round(progress)}%
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-medium mb-2">Multi-Sheet Excel Format:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Each sheet</strong> represents a service category (sheet name = category name)</li>
              <li><strong>Row 1</strong> contains subcategory headers starting from column B</li>
              <li><strong>Rows 2+</strong> contain services under each subcategory column</li>
              <li><strong>Service format:</strong> "Service Name | $Price | Time" (price and time optional)</li>
              <li><strong>Example:</strong> "Oil Change | $35 | 30min"</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            <p className="font-medium mb-2">Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Download the template to see the exact format</li>
              <li>Sheet names become category names</li>
              <li>Empty cells are ignored</li>
              <li>Services with the same names will be treated as duplicates</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || isProcessing} className="bg-indigo-600 hover:bg-indigo-700">
            {isProcessing ? 'Importing...' : 'Import Services'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceBulkImport;
