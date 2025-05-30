
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { bulkImportServices } from '@/lib/services/serviceApi';
import { parseExcelFile, generateExcelTemplate } from '@/lib/services/excelParser';

interface ServiceBulkImportProps {
  onCancel: () => void;
  onComplete: (categories: ServiceMainCategory[]) => void;
}

const ServiceBulkImport: React.FC<ServiceBulkImportProps> = ({ onCancel, onComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewData, setPreviewData] = useState<ServiceMainCategory[]>([]);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      setError('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    setFile(selectedFile);
    setError('');
    handleFilePreview(selectedFile);
  };

  const handleFilePreview = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(25);
      
      console.log('Starting file preview...');
      const categories = await parseExcelFile(file);
      
      setUploadProgress(50);
      console.log('Preview data parsed:', categories);
      
      setPreviewData(categories);
      setUploadProgress(100);
      
      toast.success(`Preview ready: ${categories.length} categories found`);
    } catch (error) {
      console.error('Error previewing file:', error);
      setError(error instanceof Error ? error.message : 'Failed to preview file');
      toast.error('Failed to preview file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleImport = async () => {
    if (!previewData.length) {
      toast.error('No data to import');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      console.log('Starting import process...');
      
      // Calculate stats for display
      const totalCategories = previewData.length;
      const totalSubcategories = previewData.reduce((sum, cat) => sum + cat.subcategories.length, 0);
      const totalJobs = previewData.reduce((sum, cat) => 
        sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0
      );

      toast.info(`Importing ${totalCategories} categories, ${totalSubcategories} subcategories, ${totalJobs} jobs...`);
      
      setUploadProgress(25);
      
      const importedCategories = await bulkImportServices(previewData);
      
      setUploadProgress(100);
      
      toast.success('Import completed successfully!');
      onComplete(importedCategories);
      
    } catch (error) {
      console.error('Error importing data:', error);
      setError(error instanceof Error ? error.message : 'Failed to import data');
      toast.error('Import failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      console.log('Generating template...');
      const buffer = generateExcelTemplate();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'service-template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  const getPreviewStats = () => {
    if (!previewData.length) return { categories: 0, subcategories: 0, jobs: 0 };
    
    const categories = previewData.length;
    const subcategories = previewData.reduce((sum, cat) => sum + cat.subcategories.length, 0);
    const jobs = previewData.reduce((sum, cat) => 
      sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0
    );
    
    return { categories, subcategories, jobs };
  };

  const stats = getPreviewStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Service Bulk Import
          </CardTitle>
          <CardDescription>
            Import service categories, subcategories, and jobs from an Excel file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>

          <div className="space-y-2">
            <label htmlFor="file-upload" className="text-sm font-medium">
              Select Excel File
            </label>
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {previewData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Preview Ready
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{stats.categories}</div>
                    <div className="text-sm text-gray-600">Categories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.subcategories}</div>
                    <div className="text-sm text-gray-600">Subcategories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{stats.jobs}</div>
                    <div className="text-sm text-gray-600">Jobs</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          disabled={!previewData.length || isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? 'Importing...' : 'Import Services'}
        </Button>
      </div>
    </div>
  );
};

export default ServiceBulkImport;
