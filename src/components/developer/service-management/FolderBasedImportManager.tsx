
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Folder, RefreshCw } from 'lucide-react';
import { StorageFileBrowser } from './StorageFileBrowser';
import { importExcelFileFromStorage } from '@/lib/services/folderBasedImportService';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { toast } from 'sonner';

interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
  error?: string;
  completed?: boolean;
}

interface ImportStats {
  totalSectors: number;
  totalCategories: number;
  totalSubcategories: number;
  totalJobs: number;
  processingTime: number;
}

export function FolderBasedImportManager() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const { refetch } = useServiceSectors();

  const handleFileSelect = useCallback((filePath: string) => {
    setSelectedFiles(prev => 
      prev.includes(filePath) 
        ? prev.filter(f => f !== filePath)
        : [...prev, filePath]
    );
  }, []);

  const handleImportFile = async (filePath: string) => {
    if (!filePath) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      setIsImporting(true);
      setProgress({ stage: 'starting', progress: 0, message: 'Starting import...' });
      setImportStats(null);

      const startTime = Date.now();
      
      console.log('Starting import for file:', filePath);
      
      const result = await importExcelFileFromStorage(
        'service-data',
        filePath,
        (progressUpdate) => {
          console.log('Import progress:', progressUpdate);
          setProgress(progressUpdate);
        }
      );

      const processingTime = Date.now() - startTime;
      
      console.log('Import completed successfully:', result);
      
      setImportStats({
        totalSectors: result.sectors || 0,
        totalCategories: result.categories || 0,
        totalSubcategories: result.subcategories || 0,
        totalJobs: result.services || 0,
        processingTime
      });

      setProgress({
        stage: 'completed',
        progress: 100,
        message: `Import completed successfully! Processed ${result.services || 0} services.`,
        completed: true
      });

      // Refresh the service sectors data
      await refetch();
      
      toast.success(`Import completed! ${result.services || 0} services processed.`);
      
    } catch (error) {
      console.error('Import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setProgress({
        stage: 'error',
        progress: 0,
        message: 'Import failed',
        error: errorMessage
      });
      
      toast.error(`Import failed: ${errorMessage}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleBulkImport = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to import');
      return;
    }

    for (const filePath of selectedFiles) {
      await handleImportFile(filePath);
      // Add a small delay between imports
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setSelectedFiles([]);
  };

  const resetImport = () => {
    setProgress(null);
    setImportStats(null);
    setSelectedFiles([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Storage-Based Service Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Import service data from Excel files stored in Supabase Storage. 
            Files should be organized in folders by sector (e.g., Automotive/, Marine/, etc.).
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Selected files ({selectedFiles.length}):</div>
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map(file => (
                  <Badge key={file} variant="secondary" className="text-xs">
                    {file.split('/').pop()}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleBulkImport}
                  disabled={isImporting}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Import Selected Files
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedFiles([])}
                  disabled={isImporting}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          <StorageFileBrowser
            bucketName="service-data"
            onFileSelect={handleFileSelect}
            onFileImport={handleImportFile}
            selectedFiles={selectedFiles}
            disabled={isImporting}
          />

          {progress && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{progress.stage}</span>
                  <span>{Math.round(progress.progress)}%</span>
                </div>
                <Progress value={progress.progress} className="h-2" />
                <p className="text-sm text-muted-foreground">{progress.message}</p>
              </div>

              {progress.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{progress.error}</AlertDescription>
                </Alert>
              )}

              {progress.completed && importStats && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium">Import Summary:</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>Sectors: {importStats.totalSectors}</div>
                        <div>Categories: {importStats.totalCategories}</div>
                        <div>Subcategories: {importStats.totalSubcategories}</div>
                        <div>Services: {importStats.totalJobs}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Processing time: {(importStats.processingTime / 1000).toFixed(1)}s
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {(progress.completed || progress.error) && (
                <Button 
                  variant="outline" 
                  onClick={resetImport}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
