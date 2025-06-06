
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { bucketViewerService } from '@/lib/services/bucketViewerService';
import { Database, FolderIcon, FileIcon, RefreshCw, AlertCircle } from 'lucide-react';
import type { StorageFile } from '@/lib/services/types';

interface BucketInfo {
  exists: boolean;
  files: StorageFile[];
  folders: { name: string; path: string; lastModified?: Date }[];
  error?: string;
}

export function LiveBucketViewer() {
  const [bucketInfo, setBucketInfo] = useState<BucketInfo>({
    exists: false,
    files: [],
    folders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBucketInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching bucket info...');
      
      const info = await bucketViewerService.getBucketInfo();
      setBucketInfo(info);
      
      if (info.error) {
        setError(info.error);
      }
    } catch (err) {
      console.error('Error fetching bucket info:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bucket information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBucketInfo();
  }, []);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Live Storage Browser
        </CardTitle>
        <CardDescription>
          Real-time view of service import storage bucket contents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Status: {loading ? 'Loading...' : bucketInfo.exists ? 'Connected' : 'Not Found'}
            </div>
            <Button
              onClick={fetchBucketInfo}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-medium">Storage Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && bucketInfo.exists && !error && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Folders:</span> {bucketInfo.folders.length}
                </div>
                <div>
                  <span className="font-medium">Files:</span> {bucketInfo.files.length}
                </div>
              </div>

              {bucketInfo.folders.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Sector Folders:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {bucketInfo.folders.map((folder) => (
                      <div key={folder.name} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                        <FolderIcon className="h-4 w-4 text-blue-600" />
                        <span className="flex-1">{folder.name}</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(folder.lastModified)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bucketInfo.files.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Files:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {bucketInfo.files.map((file) => (
                      <div key={file.path} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                        <FileIcon className="h-4 w-4 text-green-600" />
                        <span className="flex-1">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(file.lastModified)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bucketInfo.folders.length === 0 && bucketInfo.files.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Bucket is empty</p>
                  <p className="text-xs">Upload Excel files in sector folders to get started</p>
                </div>
              )}
            </div>
          )}

          {!loading && !bucketInfo.exists && !error && (
            <div className="text-center py-4 text-gray-500">
              <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Storage bucket will be created automatically</p>
              <p className="text-xs">Click refresh to try again</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
