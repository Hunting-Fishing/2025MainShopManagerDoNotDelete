
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Upload, Download, FileText, AlertCircle } from 'lucide-react';
import { StorageFileBrowser } from './StorageFileBrowser';
import { importFromStorage } from '@/lib/services/storageImportService';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
}

interface ServiceBulkImportProps {
  categories: ServiceMainCategory[];
  onImport: (data: ServiceMainCategory[]) => Promise<void>;
  onExport: () => void;
}

export const ServiceBulkImport: React.FC<ServiceBulkImportProps> = ({
  categories,
  onImport,
  onExport
}) => {
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    stage: '',
    progress: 0,
    message: ''
  });
  const [showStorageBrowser, setShowStorageBrowser] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setImportStatus('importing');
      
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('File is empty');
      }
      
      setImportProgress({
        stage: 'parsing',
        progress: 50,
        message: 'Parsing file content...'
      });
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data: ServiceMainCategory[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        data.push({
          id: row.id || `category-${i}`,
          name: row.name || '',
          description: row.description || '',
          subcategories: [],
          position: parseInt(row.position) || i
        });
      }
      
      setImportProgress({
        stage: 'importing',
        progress: 75,
        message: 'Processing data...'
      });
      
      await onImport(data);
      
      setImportProgress({
        stage: 'complete',
        progress: 100,
        message: 'Import completed successfully'
      });
      
      setImportStatus('success');
      
      toast({
        title: "Success",
        description: `Imported ${data.length} categories successfully`,
      });
      
    } catch (error: any) {
      console.error('Import failed:', error);
      setImportStatus('error');
      toast({
        title: "Import Failed",
        description: error.message || 'Failed to import file',
        variant: "destructive",
      });
    }
  }, [onImport]);

  const handleStorageImport = async (fileName: string) => {
    try {
      setImportStatus('importing');
      setShowStorageBrowser(false);
      
      const data = await importFromStorage('service-imports', fileName, setImportProgress);
      
      await onImport(data);
      setImportStatus('success');
      
      toast({
        title: "Success",
        description: `Imported ${data.length} categories from storage`,
      });
      
    } catch (error: any) {
      console.error('Storage import failed:', error);
      setImportStatus('error');
      toast({
        title: "Storage Import Failed",
        description: error.message || 'Failed to import from storage',
        variant: "destructive",
      });
    }
  };

  const exportToCSV = useCallback(() => {
    try {
      if (!categories || categories.length === 0) {
        toast({
          title: "No Data",
          description: "No categories to export",
          variant: "destructive",
        });
        return;
      }

      const headers = ['id', 'name', 'description', 'position'];
      const csvContent = [
        headers.join(','),
        ...categories.map(category => [
          category.id,
          `"${category.name}"`,
          `"${category.description || ''}"`,
          category.position || 0
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `service-categories-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Categories exported successfully",
      });
    } catch (error: any) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export categories",
        variant: "destructive",
      });
    }
  }, [categories]);

  const resetImport = () => {
    setImportStatus('idle');
    setImportProgress({
      stage: '',
      progress: 0,
      message: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Import Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {importStatus === 'idle' && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="file-upload" className="block text-sm font-medium mb-2">
                    Upload CSV File
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                
                <div className="text-center">
                  <span className="text-sm text-gray-500">or</span>
                </div>
                
                <Button 
                  onClick={() => setShowStorageBrowser(true)}
                  variant="outline"
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Import from Storage
                </Button>
              </div>
            )}

            {importStatus === 'importing' && (
              <div className="space-y-3">
                <div className="text-sm font-medium">
                  {importProgress.message}
                </div>
                <Progress value={importProgress.progress} className="w-full" />
                <div className="text-xs text-gray-500">
                  Stage: {importProgress.stage}
                </div>
              </div>
            )}

            {importStatus === 'success' && (
              <div className="space-y-3">
                <div className="flex items-center text-green-600">
                  <FileText className="h-4 w-4 mr-2" />
                  Import completed successfully!
                </div>
                <Button onClick={resetImport} variant="outline" size="sm">
                  Import Another File
                </Button>
              </div>
            )}

            {importStatus === 'error' && (
              <div className="space-y-3">
                <div className="flex items-center text-red-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Import failed. Please try again.
                </div>
                <Button onClick={resetImport} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Export current categories to CSV format
              </p>
              <Button 
                onClick={exportToCSV} 
                className="w-full"
                disabled={!categories || categories.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
              {categories && (
                <p className="text-xs text-gray-500">
                  {categories.length} categories available for export
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage Browser Modal */}
      {showStorageBrowser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Import from Storage</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowStorageBrowser(false)}
              >
                Cancel
              </Button>
            </div>
            
            <StorageFileBrowser
              bucketName="service-imports"
              onFileSelect={handleStorageImport}
              accept=".csv,.json"
              disabled={importStatus === 'importing'}
            />
          </div>
        </div>
      )}
    </div>
  );
};

