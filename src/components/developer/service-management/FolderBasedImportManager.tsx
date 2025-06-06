import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  processExcelFileFromStorage, 
  getServiceCounts, 
  type ImportStats,
  type ImportProgress,
  type ProcessedServiceData
} from '@/lib/services';
import { ServiceImportProgress } from './ServiceImportProgress';
import { UploadCloud } from 'lucide-react';

export function FolderBasedImportManager() {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    stage: '',
    message: '',
    progress: 0,
    completed: false,
    error: null
  });
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (importProgress.completed && importStats) {
      toast({
        title: "Import Successful",
        description: `Imported ${importStats.totalImported} services.`,
      });
    }

    if (importProgress.error) {
      toast({
        title: "Import Failed",
        description: importProgress.error,
        variant: "destructive",
      });
    }
  }, [importProgress, importStats, toast]);

  const handleImport = async () => {
    setIsImporting(true);
    setImportProgress({
      stage: 'Starting import...',
      message: 'Initializing import process',
      progress: 0,
      completed: false,
      error: null
    });

    try {
      const importResult = await processExcelFileFromStorage((progressUpdate: ImportProgress) => {
        setImportProgress(progressUpdate);
      });

      setImportStats({
        totalImported: importResult.totalImported,
        errors: importResult.errors || [],
        sectors: importResult.sectors,
        categories: importResult.categories,
        subcategories: importResult.subcategories,
        services: importResult.services
      });

      setImportProgress({
        stage: 'Import Complete',
        message: `Successfully imported ${importResult.totalImported} services`,
        progress: 100,
        completed: true,
        error: null
      });
    } catch (error: any) {
      console.error("Import error:", error);
      setImportProgress({
        stage: 'Import Failed',
        message: error.message || 'An error occurred during import.',
        progress: 0,
        completed: false,
        error: error.message || 'An error occurred during import.'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    // Implement cancel logic here, if needed
    setIsImporting(false);
    setImportProgress({
      stage: 'Import Cancelled',
      message: 'Import process was cancelled.',
      progress: 0,
      completed: false,
      error: null
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadCloud className="h-5 w-5" />
          Folder-Based Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Import service data from structured Excel files in a storage folder.
        </p>

        <ServiceImportProgress
          isImporting={isImporting}
          progress={importProgress.progress}
          stage={importProgress.stage}
          message={importProgress.message}
          onCancel={handleCancel}
          error={importProgress.error}
          completed={importProgress.completed}
        />

        <Button 
          onClick={handleImport}
          disabled={isImporting}
          className="w-full"
        >
          {isImporting ? 'Importing...' : 'Start Import'}
        </Button>
      </CardContent>
    </Card>
  );
}
