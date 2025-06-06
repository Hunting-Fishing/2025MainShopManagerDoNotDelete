
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { importFromFiles, ImportProgress } from '@/lib/services/folderBasedImportService';
import { ServiceImportProgress } from './ServiceImportProgress';

export function FolderBasedImportManager() {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    stage: '',
    message: '',
    progress: 0
  });
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsImporting(true);
    
    try {
      await importFromFiles(files, (progress) => {
        setImportProgress(progress);
      });

      toast({
        title: "Import Successful",
        description: "Service data has been imported successfully.",
      });
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import service data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Service Data from Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">File Format Requirements</p>
              <ul className="mt-2 text-amber-700 space-y-1">
                <li>• Supported formats: Excel (.xlsx, .xls) or CSV (.csv)</li>
                <li>• Required columns: Sector, Category, Subcategory, Job/Service</li>
                <li>• Optional columns: Description, Price, Duration</li>
                <li>• No limit on number of jobs per subcategory</li>
              </ul>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Select Service Data Files</h3>
            <p className="text-gray-600 mb-4">
              Choose Excel or CSV files containing your service hierarchy data
            </p>
            
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button variant="outline" disabled={isImporting} asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {isImporting ? 'Importing...' : 'Select Files'}
                </span>
              </Button>
            </label>
            
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isImporting}
            />
          </div>

          <ServiceImportProgress
            isImporting={isImporting}
            progress={importProgress.progress}
            stage={importProgress.stage}
            message={importProgress.message}
            error={importProgress.error}
            completed={importProgress.completed}
          />
        </CardContent>
      </Card>
    </div>
  );
}
