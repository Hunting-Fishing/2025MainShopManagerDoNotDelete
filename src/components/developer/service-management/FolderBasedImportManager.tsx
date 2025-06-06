
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  processExcelFileFromStorage, 
  getServiceCounts, 
  type ImportStats,
  type ImportProgress,
  type ImportResult,
  getStorageBucketInfo
} from '@/lib/services';
import { ServiceImportProgress } from './ServiceImportProgress';
import { UploadCloud, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const [bucketInfo, setBucketInfo] = useState<{ exists: boolean; fileCount: number } | null>(null);
  const [isCheckingBucket, setIsCheckingBucket] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkBucketStatus();
  }, []);

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

  const checkBucketStatus = async () => {
    setIsCheckingBucket(true);
    try {
      const info = await getStorageBucketInfo('service-data');
      setBucketInfo(info);
    } catch (error) {
      console.error("Error checking bucket status:", error);
      setBucketInfo({ exists: false, fileCount: 0 });
    } finally {
      setIsCheckingBucket(false);
    }
  };

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

      // Refresh bucket info after successful import
      await checkBucketStatus();
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
    setIsImporting(false);
    setImportProgress({
      stage: 'Import Cancelled',
      message: 'Import process was cancelled.',
      progress: 0,
      completed: false,
      error: null
    });
  };

  const renderBucketInfo = () => {
    if (isCheckingBucket) {
      return <p className="text-sm text-gray-500">Checking storage bucket status...</p>;
    }

    if (!bucketInfo?.exists) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Bucket Not Found</AlertTitle>
          <AlertDescription>
            The "service-data" storage bucket does not exist. Please create this bucket in Supabase Storage and upload your Excel files to it.
          </AlertDescription>
        </Alert>
      );
    }

    if (bucketInfo.fileCount === 0) {
      return (
        <Alert className="mb-4 border-amber-500 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle>No Excel Files Found</AlertTitle>
          <AlertDescription>
            No Excel files found in the "service-data" bucket. Please upload your Excel files to this bucket before importing.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="mb-4 border-blue-500 bg-blue-50">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertTitle>Ready to Import</AlertTitle>
        <AlertDescription>
          Found {bucketInfo.fileCount} Excel file(s) in the "service-data" bucket.
        </AlertDescription>
      </Alert>
    );
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
          Import service data from structured Excel files in the "service-data" storage bucket.
        </p>

        {renderBucketInfo()}

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
          disabled={isImporting || (bucketInfo && (!bucketInfo.exists || bucketInfo.fileCount === 0))}
          className="w-full"
        >
          {isImporting ? 'Importing...' : 'Start Import'}
        </Button>
      </CardContent>
    </Card>
  );
}
