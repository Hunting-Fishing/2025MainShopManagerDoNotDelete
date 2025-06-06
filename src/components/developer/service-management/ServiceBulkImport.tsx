
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Folder, FileSpreadsheet, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { storageService } from '@/lib/services/unifiedStorageService';

interface ServiceBulkImportProps {
  onImport: () => void;
  disabled?: boolean;
}

export function ServiceBulkImport({ onImport, disabled = false }: ServiceBulkImportProps) {
  const [bucketStatus, setBucketStatus] = useState<{
    exists: boolean;
    folders: number;
    files: number;
    loading: boolean;
    error: string | null;
  }>({
    exists: false,
    folders: 0,
    files: 0,
    loading: true,
    error: null
  });

  const checkBucketStatus = async () => {
    setBucketStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const exists = await storageService.checkBucketExists('service-imports');
      
      if (exists) {
        const bucketInfo = await storageService.getBucketInfo('service-imports');
        setBucketStatus({
          exists: true,
          folders: bucketInfo.folders.length,
          files: bucketInfo.files.length,
          loading: false,
          error: null
        });
      } else {
        setBucketStatus({
          exists: false,
          folders: 0,
          files: 0,
          loading: false,
          error: 'Bucket "service-imports" not found'
        });
      }
    } catch (error) {
      console.error('Error checking bucket status:', error);
      setBucketStatus({
        exists: false,
        folders: 0,
        files: 0,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check bucket status'
      });
    }
  };

  const handleRefresh = async () => {
    await storageService.clearCacheForBucket('service-imports');
    await checkBucketStatus();
  };

  useEffect(() => {
    checkBucketStatus();
  }, []);

  const renderBucketStatus = () => {
    if (bucketStatus.loading) {
      return (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>Checking storage bucket status...</AlertDescription>
        </Alert>
      );
    }

    if (bucketStatus.error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{bucketStatus.error}</AlertDescription>
        </Alert>
      );
    }

    if (!bucketStatus.exists) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Storage bucket "service-imports" not found. Please ensure the bucket exists and contains sector folders.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <div className="space-y-2">
            <div>Storage bucket "service-imports" is ready for import</div>
            <div className="flex gap-4 text-sm">
              <Badge variant="outline" className="flex items-center gap-1">
                <Folder className="h-3 w-3" />
                {bucketStatus.folders} folders
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileSpreadsheet className="h-3 w-3" />
                {bucketStatus.files} files
              </Badge>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  const renderFolderList = async () => {
    if (!bucketStatus.exists) return null;
    
    try {
      const bucketInfo = await storageService.getBucketInfo('service-imports');
      
      if (bucketInfo.folders.length === 0) {
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No sector folders found in the bucket. Please ensure folder structure is set up correctly.
            </AlertDescription>
          </Alert>
        );
      }

      return (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Available Sectors:</h4>
          <div className="flex flex-wrap gap-2">
            {bucketInfo.folders.map((folder, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <Folder className="h-3 w-3" />
                {folder.name}
              </Badge>
            ))}
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error listing folders:', error);
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to list sector folders</AlertDescription>
        </Alert>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Service Import
        </CardTitle>
        <CardDescription>
          Import service data from Excel files in the storage bucket
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderBucketStatus()}
        
        {bucketStatus.exists && (
          <div className="space-y-4">
            {renderFolderList()}
            
            <div className="flex gap-2">
              <Button 
                onClick={onImport} 
                disabled={disabled || !bucketStatus.exists}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Start Import Process
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={bucketStatus.loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${bucketStatus.loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
