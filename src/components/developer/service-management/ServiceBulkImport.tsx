
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FolderOpen, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { storageService } from '@/lib/services/unifiedStorageService';

interface ServiceBulkImportProps {
  onImport: () => void;
  disabled?: boolean;
}

interface FolderInfo {
  name: string;
  path: string;
  fileCount: number;
  files: Array<{
    name: string;
    size: number;
    lastModified: string;
  }>;
}

export function ServiceBulkImport({ onImport, disabled = false }: ServiceBulkImportProps) {
  const [bucketStatus, setBucketStatus] = useState<'checking' | 'ready' | 'error' | 'empty'>('checking');
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkBucketStructure();
  }, []);

  const checkBucketStructure = async () => {
    setBucketStatus('checking');
    setError(null);
    
    try {
      const bucketInfo = await storageService.getBucketInfo('service-imports');
      
      if (!bucketInfo.exists) {
        setBucketStatus('error');
        setError('The service-imports bucket does not exist. Please create it first.');
        return;
      }

      // Get detailed folder information
      const folderDetails: FolderInfo[] = [];
      let totalFileCount = 0;

      for (const folder of bucketInfo.folders) {
        try {
          const files = await storageService.getFilesInFolder('service-imports', folder.path, ['.xlsx', '.xls']);
          
          folderDetails.push({
            name: folder.name,
            path: folder.path,
            fileCount: files.length,
            files: files.map(file => ({
              name: file.name,
              size: file.size,
              lastModified: file.lastModified
            }))
          });
          
          totalFileCount += files.length;
        } catch (folderError) {
          console.warn(`Could not access folder ${folder.name}:`, folderError);
        }
      }

      setFolders(folderDetails);
      setTotalFiles(totalFileCount);
      
      if (folderDetails.length === 0) {
        setBucketStatus('empty');
      } else if (totalFileCount === 0) {
        setBucketStatus('empty');
      } else {
        setBucketStatus('ready');
      }

    } catch (err) {
      console.error('Error checking bucket structure:', err);
      setError(err instanceof Error ? err.message : 'Failed to check bucket structure');
      setBucketStatus('error');
    }
  };

  const getStatusIcon = () => {
    switch (bucketStatus) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'empty':
        return <FolderOpen className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (bucketStatus) {
      case 'checking':
        return 'Checking bucket structure...';
      case 'ready':
        return `Found ${folders.length} sectors with ${totalFiles} Excel files ready for import!`;
      case 'error':
        return error || 'Error checking bucket structure';
      case 'empty':
        return folders.length === 0 
          ? 'No folders found in the service-imports bucket. Please create sector folders first.'
          : 'No Excel files found in any folders. Please upload .xlsx files to the sector folders.';
      default:
        return 'Unknown status';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Service Data Import
        </CardTitle>
        <CardDescription>
          Import service hierarchy data from structured files in storage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <AlertDescription>{getStatusMessage()}</AlertDescription>
          </div>
        </Alert>

        {bucketStatus === 'ready' && folders.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Bucket Structure:</h4>
            <div className="space-y-2">
              {folders.map((folder) => (
                <div 
                  key={folder.name} 
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{folder.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {folder.fileCount} files
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <FileSpreadsheet className="h-3 w-3" />
                    Excel files
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {bucketStatus === 'empty' && (
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Expected structure:</strong></p>
            <div className="pl-4 border-l-2 border-gray-200">
              <p>📁 service-imports/</p>
              <p className="pl-4">📁 Automotive/ (sector folder)</p>
              <p className="pl-8">📄 Brakes&Wheels.xlsx</p>
              <p className="pl-8">📄 Engine&Valve Train.xlsx</p>
              <p className="pl-4">📁 Marine/ (sector folder)</p>
              <p className="pl-8">📄 Hull&Structure.xlsx</p>
              <p className="pl-8">📄 Engine Systems.xlsx</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button 
            onClick={onImport}
            disabled={disabled || bucketStatus !== 'ready'}
            className="flex-1"
          >
            {disabled ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {bucketStatus === 'ready' ? `Import ${totalFiles} Files` : 'Import Services'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={checkBucketStructure}
            disabled={bucketStatus === 'checking'}
          >
            {bucketStatus === 'checking' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
