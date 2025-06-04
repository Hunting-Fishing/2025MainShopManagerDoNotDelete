import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, AlertCircle, CheckCircle, Download, Cloud } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { importFromStorage } from '@/lib/services/storageImportService';
import { StorageFileBrowser } from './StorageFileBrowser';

interface ServiceBulkImportProps {
  categories?: ServiceMainCategory[];
  onImport: (data: ServiceMainCategory[]) => Promise<void>;
  onExport: () => void;
}

interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
}

export const ServiceBulkImport: React.FC<ServiceBulkImportProps> = ({
  categories = [],
  onImport,
  onExport
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importError, setImportError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ServiceMainCategory[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus('loading');
      setImportError(null);
      setImportProgress({ stage: 'reading', progress: 25, message: 'Reading file...' });

      const text = await file.text();
      setImportProgress({ stage: 'parsing', progress: 50, message: 'Parsing data...' });
      
      const rawData = parseCSV(text);
      const validatedData = validateData(rawData);
      
      setImportProgress({ stage: 'preview', progress: 75, message: 'Preparing preview...' });
      setPreviewData(validatedData);
      
      setImportProgress({ stage: 'complete', progress: 100, message: 'File loaded successfully' });
      setImportStatus('success');
    } catch (error) {
      console.error('Import error:', error);
      setImportError(error instanceof Error ? error.message : 'Import failed');
      setImportStatus('error');
    }
  };

  const handleStorageImport = async (fileName: string) => {
    try {
      setImportStatus('loading');
      setImportError(null);

      const data = await importFromStorage(
        'service-imports',
        fileName,
        setImportProgress
      );

      setPreviewData(data);
      setImportStatus('success');
    } catch (error) {
      console.error('Storage import error:', error);
      setImportError(error instanceof Error ? error.message : 'Storage import failed');
      setImportStatus('error');
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }
    
    return data;
  };

  const validateData = (data: any[]): ServiceMainCategory[] => {
    return data.map((row, index) => ({
      id: row.id || `category-${index}`,
      name: row.name || '',
      description: row.description || '',
      subcategories: [],
      position: parseInt(row.position) || index
    }));
  };

  const exportToCSV = () => {
    if (!categories || categories.length === 0) {
      setImportError('No data to export');
      return;
    }

    const csvContent = [
      'id,name,description,position',
      ...categories.map(cat => 
        `"${cat.id}","${cat.name}","${cat.description || ''}","${cat.position || 0}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'service-categories.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const confirmImport = async () => {
    if (previewData.length === 0) return;
    
    try {
      setImportStatus('loading');
      setImportProgress({ stage: 'importing', progress: 0, message: 'Starting import...' });
      
      await onImport(previewData);
      
      setImportProgress({ stage: 'complete', progress: 100, message: 'Import completed successfully' });
      setImportStatus('success');
      setPreviewData([]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import confirmation error:', error);
      setImportError(error instanceof Error ? error.message : 'Import failed');
      setImportStatus('error');
    }
  };

  const resetImport = () => {
    setImportStatus('idle');
    setImportError(null);
    setImportProgress(null);
    setPreviewData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="mr-2 h-5 w-5" />
          Bulk Import/Export Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Local File
            </TabsTrigger>
            <TabsTrigger value="storage" className="flex items-center">
              <Cloud className="h-4 w-4 mr-2" />
              Storage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="file-upload" className="block text-sm font-medium mb-2">
                  Choose CSV File
                </label>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={importStatus === 'loading'}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <StorageFileBrowser
              bucketName="service-imports"
              onFileSelect={handleStorageImport}
              accept=".csv,.json"
              disabled={importStatus === 'loading'}
            />
          </TabsContent>
        </Tabs>

        {importProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="capitalize">{importProgress.stage}</span>
              <span>{Math.round(importProgress.progress)}%</span>
            </div>
            <Progress value={importProgress.progress} className="w-full" />
            <p className="text-sm text-gray-600">{importProgress.message}</p>
          </div>
        )}

        {importError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{importError}</AlertDescription>
          </Alert>
        )}

        {importStatus === 'success' && previewData.length > 0 && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully loaded {previewData.length} categories. Review the data below and confirm to import.
              </AlertDescription>
            </Alert>
            
            <div className="max-h-48 overflow-y-auto border rounded-md p-4 bg-gray-50">
              <h4 className="font-medium mb-2">Preview ({previewData.length} items):</h4>
              <div className="space-y-1 text-sm">
                {previewData.slice(0, 5).map((category, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{category.name}</span>
                    <span className="text-gray-500">{category.description}</span>
                  </div>
                ))}
                {previewData.length > 5 && (
                  <div className="text-gray-500 italic">
                    ... and {previewData.length - 5} more items
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={confirmImport} disabled={importStatus === 'loading'}>
                Confirm Import
              </Button>
              <Button variant="outline" onClick={resetImport}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Export Current Data</h4>
              <p className="text-sm text-gray-600">Download current service categories as CSV</p>
            </div>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
