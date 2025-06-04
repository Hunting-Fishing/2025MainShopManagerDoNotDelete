
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { parseExcelToServiceCategories, generateServiceTemplate } from '@/lib/services/excelParser';
import { importServicesFromStorage, ImportProgress, ImportResult } from '@/lib/services/storageImportService';
import { StorageFileBrowser } from './StorageFileBrowser';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Database,
  Cloud,
  HardDrive
} from 'lucide-react';
import { toast } from 'sonner';

interface ServiceBulkImportProps {
  categories: ServiceMainCategory[];
  onImport: (data: any) => void;
  onExport: () => void;
}

export function ServiceBulkImport({ categories, onImport, onExport }: ServiceBulkImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please select an Excel file (.xlsx or .xls)');
      return;
    }

    setIsImporting(true);
    setImportProgress({
      stage: 'parsing',
      progress: 0,
      message: 'Starting file processing...'
    });
    setImportResult(null);

    try {
      console.log('Processing file:', file.name, 'Size:', file.size);
      
      setImportProgress({
        stage: 'parsing',
        progress: 50,
        message: 'Parsing Excel file...'
      });

      const parsedCategories = await parseExcelToServiceCategories(file);
      
      setImportProgress({
        stage: 'processing',
        progress: 75,
        message: `Parsed ${parsedCategories.length} categories`
      });

      const totalSubcategories = parsedCategories.reduce(
        (sum, cat) => sum + cat.subcategories.length, 0
      );
      const totalJobs = parsedCategories.reduce(
        (sum, cat) => sum + cat.subcategories.reduce(
          (subSum, sub) => subSum + sub.jobs.length, 0
        ), 0
      );

      console.log('Parse results:', {
        categories: parsedCategories.length,
        subcategories: totalSubcategories,
        jobs: totalJobs
      });

      setImportProgress({
        stage: 'complete',
        progress: 100,
        message: 'File processed successfully!'
      });

      setImportResult({
        success: true,
        categories: parsedCategories,
        totalCategories: parsedCategories.length,
        totalSubcategories,
        totalJobs,
        processingTime: 0
      });

      onImport(parsedCategories);
      toast.success(`Successfully imported ${totalJobs} services from ${parsedCategories.length} categories`);

    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setImportProgress({
        stage: 'complete',
        progress: 0,
        message: 'Import failed',
        error: errorMessage
      });

      setImportResult({
        success: false,
        categories: [],
        totalCategories: 0,
        totalSubcategories: 0,
        totalJobs: 0,
        processingTime: 0,
        errors: [errorMessage]
      });

      toast.error(`Import failed: ${errorMessage}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleStorageImport = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please select an Excel file (.xlsx or .xls)');
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await importServicesFromStorage(
        'work-order-jobs', 
        file.name, 
        setImportProgress
      );

      setImportResult(result);

      if (result.success) {
        onImport(result.categories);
        toast.success(`Successfully imported ${result.totalJobs} services!`);
      } else {
        toast.error(`Import failed: ${result.errors?.join(', ')}`);
      }
    } catch (error) {
      console.error('Storage import error:', error);
      toast.error('Failed to import from storage');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const downloadTemplate = () => {
    try {
      const template = generateServiceTemplate();
      const blob = new Blob([template], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'service_template.xlsx';
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Template download error:', error);
      toast.error('Failed to download template');
    }
  };

  const getProgressColor = () => {
    if (importProgress?.error) return 'bg-red-500';
    if (importProgress?.stage === 'complete') return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'downloading': return <Download className="h-4 w-4" />;
      case 'parsing': return <FileText className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'uploading': return <Database className="h-4 w-4" />;
      case 'complete': return importProgress?.error ? 
        <AlertCircle className="h-4 w-4" /> : 
        <CheckCircle className="h-4 w-4" />;
      default: return <Upload className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Service Bulk Import & Export
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Import services from Excel files or export current service data
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="local" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="local" className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Local Upload
              </TabsTrigger>
              <TabsTrigger value="storage" className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Storage Import
              </TabsTrigger>
            </TabsList>

            <TabsContent value="local" className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {isDragOver ? 'Drop your Excel file here' : 'Upload Excel File'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop your Excel file here, or click to browse
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                  id="file-upload"
                  disabled={isImporting}
                />
                <label htmlFor="file-upload">
                  <Button disabled={isImporting} className="cursor-pointer">
                    {isImporting ? 'Processing...' : 'Choose File'}
                  </Button>
                </label>
              </div>
            </TabsContent>

            <TabsContent value="storage" className="space-y-4">
              <StorageFileBrowser
                bucketName="work-order-jobs"
                onFileSelect={handleStorageImport}
                loading={isImporting}
              />
            </TabsContent>
          </Tabs>

          {/* Progress Section */}
          {importProgress && (
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStageIcon(importProgress.stage)}
                      <span className="font-medium capitalize">
                        {importProgress.stage.replace('-', ' ')}
                      </span>
                    </div>
                    <Badge variant={importProgress.error ? 'destructive' : 'default'}>
                      {importProgress.progress}%
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={importProgress.progress} 
                    className="w-full"
                  />
                  
                  <p className="text-sm text-muted-foreground">
                    {importProgress.message}
                  </p>

                  {importProgress.categoriesProcessed && importProgress.totalCategories && (
                    <div className="text-xs text-muted-foreground">
                      Processing: {importProgress.categoriesProcessed}/{importProgress.totalCategories} categories
                    </div>
                  )}

                  {importProgress.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{importProgress.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {importResult && (
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {importResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <h3 className="font-medium">
                      {importResult.success ? 'Import Successful' : 'Import Failed'}
                    </h3>
                  </div>

                  {importResult.success && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {importResult.totalCategories}
                        </div>
                        <div className="text-sm text-blue-700">Categories</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {importResult.totalSubcategories}
                        </div>
                        <div className="text-sm text-green-700">Subcategories</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {importResult.totalJobs}
                        </div>
                        <div className="text-sm text-purple-700">Jobs</div>
                      </div>
                    </div>
                  )}

                  {importResult.processingTime > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Processing time: {Math.round(importResult.processingTime / 1000)}s
                    </p>
                  )}

                  {importResult.errors && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {importResult.errors.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Section */}
          <div className="mt-6 pt-6 border-t space-y-4">
            <h3 className="font-medium">Export & Templates</h3>
            <div className="flex gap-3">
              <Button onClick={downloadTemplate} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Button onClick={onExport} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Export Current Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
