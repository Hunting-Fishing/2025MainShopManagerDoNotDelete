
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { storageService } from '@/lib/services/unifiedStorageService';
import { Upload, FileText, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface ServiceBulkImportProps {
  onImport: () => void;
  disabled?: boolean;
}

export function ServiceBulkImport({ onImport, disabled = false }: ServiceBulkImportProps) {
  const [bucketStatus, setBucketStatus] = useState<'checking' | 'exists' | 'missing' | 'error'>('checking');
  const [fileCount, setFileCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [bucketInfo, setBucketInfo] = useState<{ files?: { name: string }[] }>({});

  React.useEffect(() => {
    checkBucketStatus();
  }, []);

  const checkBucketStatus = async () => {
    try {
      setIsLoading(true);
      setBucketStatus('checking');
      
      console.log('Checking service-imports bucket status...');
      
      // Check if bucket exists and get file info
      const bucketExists = await storageService.checkBucketExists('service-imports');
      
      if (bucketExists) {
        console.log('Bucket exists, getting file info...');
        const info = await storageService.getBucketInfo('service-imports');
        const files = info.files || [];
        setFileCount(files.length);
        setBucketInfo({ files: files.map(f => ({ name: f.name })) });
        setBucketStatus('exists');
        console.log(`Found ${files.length} files in service-imports bucket`);
      } else {
        console.log('Bucket does not exist or is not accessible');
        setBucketStatus('missing');
        setFileCount(0);
        setBucketInfo({});
      }
    } catch (error) {
      console.error('Error checking bucket status:', error);
      setBucketStatus('error');
      setFileCount(0);
      setBucketInfo({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('Refreshing bucket info...');
    try {
      // Clear cache and refresh
      await storageService.clearCacheForBucket('service-imports');
      await checkBucketStatus();
    } catch (error) {
      console.error('Error refreshing bucket info:', error);
    }
  };

  const handleImport = () => {
    console.log('Starting service import...');
    onImport();
  };

  const renderStatusContent = () => {
    switch (bucketStatus) {
      case 'checking':
        return (
          <Alert>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Checking storage bucket for service data files...
            </AlertDescription>
          </Alert>
        );

      case 'exists':
        return (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Found {fileCount} files in the service-imports bucket. Ready to import!
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleImport} 
                disabled={disabled || fileCount === 0}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Service Data
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        );

      case 'missing':
        return (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Service imports storage bucket not found or no files uploaded. Please upload service data files to the 'service-imports' bucket first.
              </AlertDescription>
            </Alert>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Check Again
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error checking storage bucket. Please try again or contact support.
              </AlertDescription>
            </Alert>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Service Data Import
        </CardTitle>
        <CardDescription>
          Import service hierarchy data from structured files in storage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Upload Excel or CSV files containing service data to the 'service-imports' storage bucket.</p>
            <p>Files should contain sectors, categories, subcategories, and jobs in a structured format.</p>
          </div>
          
          {renderStatusContent()}
          
          {bucketStatus === 'exists' && fileCount > 0 && bucketInfo.files && (
            <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">Files found:</p>
              <div className="max-h-32 overflow-y-auto">
                {bucketInfo.files.map((file, index) => (
                  <div key={index} className="py-1">
                    • {file.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
