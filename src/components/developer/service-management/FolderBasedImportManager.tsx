
import React, { useState, useEffect } from 'react';
import { ServiceBulkImport } from './ServiceBulkImport';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Storage, FolderOpen, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceImportProgress } from './ServiceImportProgress';
import { importServicesFromStorage, getStorageBucketInfo } from '@/lib/services';

interface StorageBucket {
  exists: boolean;
  files: {
    name: string;
    size?: number;
    type?: string;
    lastModified?: string;
  }[];
}

export function FolderBasedImportManager() {
  const [bucketInfo, setBucketInfo] = useState<StorageBucket | null>(null);
  const [loading, setLoading] = useState(true);
  const [importProgress, setImportProgress] = useState({
    isImporting: false,
    progress: 0,
    stage: '',
    message: '',
    completed: false,
    error: null as string | null,
  });

  useEffect(() => {
    const checkStorageBucket = async () => {
      setLoading(true);
      try {
        const info = await getStorageBucketInfo('service-data');
        setBucketInfo(info);
      } catch (error) {
        console.error("Error checking storage bucket:", error);
        setBucketInfo({ exists: false, files: [] });
      } finally {
        setLoading(false);
      }
    };

    checkStorageBucket();
  }, []);

  const handleImport = async () => {
    setImportProgress({
      isImporting: true,
      progress: 0,
      stage: 'Starting',
      message: 'Preparing to import service data...',
      completed: false,
      error: null,
    });

    try {
      const result = await importServicesFromStorage((progress) => {
        setImportProgress({
          ...progress,
          isImporting: true,
        });
      });
      
      if (result.success) {
        setImportProgress({
          isImporting: false,
          progress: 100,
          stage: 'Completed',
          message: `Import completed: ${result.stats?.totalSectors || 0} sectors, ${result.stats?.totalCategories || 0} categories, ${result.stats?.totalSubcategories || 0} subcategories, ${result.stats?.totalJobs || 0} jobs imported.`,
          completed: true,
          error: null,
        });
      } else {
        setImportProgress({
          isImporting: false,
          progress: 0,
          stage: 'Failed',
          message: 'Import failed',
          completed: false,
          error: result.error || 'Unknown error occurred during import',
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      setImportProgress({
        isImporting: false,
        progress: 0,
        stage: 'Error',
        message: 'Import failed',
        completed: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };
  
  const cancelImport = () => {
    // This would need to connect to a real cancel mechanism in the importServicesFromStorage function
    setImportProgress({
      isImporting: false,
      progress: 0,
      stage: '',
      message: '',
      completed: false,
      error: null,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5" />
            <span>Folder-Based Import</span>
          </CardTitle>
        </div>
        <CardDescription>
          Import service data from structured Excel files in a storage folder.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : bucketInfo?.exists ? (
          <>
            <div className="space-y-4">
              {bucketInfo.files.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Files Found</AlertTitle>
                  <AlertDescription>
                    No Excel files found in the 'service-data' bucket. Please upload Excel files to this bucket first.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Available Files:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {bucketInfo.files.map((file, index) => (
                      <div 
                        key={index}
                        className="flex items-center p-2 border rounded bg-muted/20"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <ServiceBulkImport 
                onImport={handleImport} 
                disabled={bucketInfo.files.length === 0 || importProgress.isImporting}
              />
            </div>
          </>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Storage Bucket Missing</AlertTitle>
            <AlertDescription>
              The 'service-data' storage bucket doesn't exist. Please create this bucket in Supabase Storage and upload your Excel files there.
            </AlertDescription>
          </Alert>
        )}

        <ServiceImportProgress
          isImporting={importProgress.isImporting}
          progress={importProgress.progress}
          stage={importProgress.stage}
          message={importProgress.message}
          error={importProgress.error}
          completed={importProgress.completed}
          onCancel={cancelImport}
        />
      </CardContent>
    </Card>
  );
}
