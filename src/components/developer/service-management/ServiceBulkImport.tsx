
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { StorageFileBrowser } from './StorageFileBrowser';
import { StorageImportService, importFromStorage } from '@/lib/services/storageImportService';
import { bulkImportServiceData, mapExcelDataToServiceHierarchy, ImportProgress } from '@/lib/services/serviceImportApi';
import { toast } from '@/hooks/use-toast';

interface ServiceBulkImportProps {
  categories: ServiceMainCategory[];
  onImport: (data: ServiceMainCategory[]) => void;
  onExport?: () => void;
}

export const ServiceBulkImport: React.FC<ServiceBulkImportProps> = ({
  categories,
  onImport,
  onExport
}) => {
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [clearExisting, setClearExisting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);

  const handleFileSelect = async (fileName: string) => {
    console.log('File selected for import:', fileName);
    setSelectedFile(fileName);
    setImportComplete(false);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to import",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setImportProgress(null);
    setImportComplete(false);

    try {
      // Step 1: Import from storage
      console.log('Starting storage import for file:', selectedFile);
      
      const rawData = await importFromStorage(
        'service-imports',
        selectedFile,
        (progress) => {
          console.log('Storage import progress:', progress);
          setImportProgress(progress);
        }
      );

      console.log('Raw imported data:', rawData);

      if (!rawData || rawData.length === 0) {
        throw new Error('No data found in the imported file');
      }

      // Step 2: Map data to proper service hierarchy structure
      setImportProgress({
        stage: 'mapping',
        progress: 75,
        message: 'Mapping data to service hierarchy...'
      });

      const mappedData = mapExcelDataToServiceHierarchy(rawData);
      console.log('Mapped service data:', mappedData);

      if (mappedData.length === 0) {
        throw new Error('No valid service data could be mapped from the file');
      }

      // Step 3: Import to database
      await bulkImportServiceData(
        mappedData,
        (progress) => {
          console.log('Database import progress:', progress);
          setImportProgress(progress);
        },
        clearExisting
      );

      // Step 4: Update UI
      onImport(mappedData);
      setImportComplete(true);

      toast({
        title: "Import Successful",
        description: `Successfully imported ${mappedData.length} service categories`,
      });

    } catch (error) {
      console.error('Import failed:', error);
      setImportProgress({
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Import failed'
      });
      
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = () => {
    if (!onExport) return;
    
    try {
      // Create CSV content
      const csvContent = generateCSVContent(categories);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `service-hierarchy-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: "Service hierarchy exported to CSV file",
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export service hierarchy",
        variant: "destructive",
      });
    }
  };

  const generateCSVContent = (categories: ServiceMainCategory[]): string => {
    const headers = ['Category', 'Subcategory', 'Job Name', 'Description', 'Estimated Time', 'Price'];
    const rows = [headers.join(',')];

    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        subcategory.jobs.forEach(job => {
          const row = [
            `"${category.name}"`,
            `"${subcategory.name}"`,
            `"${job.name}"`,
            `"${job.description || ''}"`,
            job.estimatedTime || '',
            job.price || ''
          ];
          rows.push(row.join(','));
        });
      });
    });

    return rows.join('\n');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Import Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="clear-existing"
                checked={clearExisting}
                onCheckedChange={setClearExisting}
                disabled={importing}
              />
              <Label htmlFor="clear-existing">Clear existing data before import</Label>
            </div>

            <StorageFileBrowser
              bucketName="service-imports"
              onFileSelect={handleFileSelect}
              accept={['.csv', '.xlsx', '.xls', '.json']}
              title="Select Import File"
            />

            {selectedFile && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Selected file: <strong>{selectedFile}</strong>
                </AlertDescription>
              </Alert>
            )}

            {importProgress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{importProgress.message}</span>
                  <span>{Math.round(importProgress.progress)}%</span>
                </div>
                <Progress value={importProgress.progress} />
                {importProgress.details && (
                  <p className="text-xs text-gray-600">{importProgress.details}</p>
                )}
              </div>
            )}

            {importComplete && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="text-green-600">
                  Import completed successfully!
                </AlertDescription>
              </Alert>
            )}

            {importProgress?.stage === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {importProgress.message}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleImport}
              disabled={!selectedFile || importing}
              className="w-full"
            >
              {importing ? 'Importing...' : 'Import Services'}
            </Button>
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Export your current service hierarchy to a CSV file for backup or transfer.
            </p>
            
            <div className="text-sm">
              <p><strong>Current Data:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>{categories.length} categories</li>
                <li>{categories.reduce((total, cat) => total + cat.subcategories.length, 0)} subcategories</li>
                <li>{categories.reduce((total, cat) => 
                  total + cat.subcategories.reduce((subTotal, sub) => subTotal + sub.jobs.length, 0), 0)} services</li>
              </ul>
            </div>

            <Button
              onClick={handleExport}
              variant="outline"
              className="w-full"
              disabled={categories.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
