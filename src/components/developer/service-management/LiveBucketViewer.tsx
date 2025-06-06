
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { bucketViewerService } from '@/lib/services/bucketViewerService';
import { 
  Cloud, 
  Folder, 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface BucketInfo {
  exists: boolean;
  files: Array<{
    name: string;
    path: string;
    size?: number;
    type?: string;
    lastModified?: Date;
  }>;
  folders: Array<{
    name: string;
    path: string;
    lastModified?: Date;
  }>;
}

export function LiveBucketViewer() {
  const [bucketInfo, setBucketInfo] = useState<BucketInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBucketInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading bucket info...');
      
      const info = await bucketViewerService.getBucketInfo();
      console.log('Bucket info loaded:', info);
      setBucketInfo(info);
    } catch (err) {
      console.error('Failed to load bucket info:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bucket information';
      setError(errorMessage);
      setBucketInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBucketInfo();
  }, []);

  const handleRefresh = () => {
    loadBucketInfo();
  };

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (error) return <XCircle className="h-4 w-4 text-red-500" />;
    if (bucketInfo?.exists) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (loading) return 'Loading...';
    if (error) return 'Error';
    if (bucketInfo?.exists) return 'Connected';
    return 'Not Found';
  };

  const getStatusVariant = () => {
    if (loading) return 'secondary';
    if (error) return 'destructive';
    if (bucketInfo?.exists) return 'default';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Live Storage Browser
        </CardTitle>
        <CardDescription>
          Real-time view of service import storage bucket contents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={getStatusVariant()} className="flex items-center gap-1">
                {getStatusIcon()}
                {getStatusText()}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Storage Error</strong>
                <br />
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Bucket Content */}
          {bucketInfo?.exists && !error && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Folder className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                  <div className="text-lg font-semibold">{bucketInfo.folders.length}</div>
                  <div className="text-xs text-gray-600">Sector Folders</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <FileSpreadsheet className="h-6 w-6 mx-auto mb-1 text-green-600" />
                  <div className="text-lg font-semibold">{bucketInfo.files.length}</div>
                  <div className="text-xs text-gray-600">Excel Files</div>
                </div>
              </div>

              {/* Folders List */}
              {bucketInfo.folders.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Available Sectors:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {bucketInfo.folders.map((folder) => (
                      <div
                        key={folder.name}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm"
                      >
                        <Folder className="h-4 w-4 text-blue-500" />
                        <span className="truncate">{folder.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {bucketInfo.folders.length === 0 && bucketInfo.files.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Cloud className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No files found in the storage bucket</p>
                  <p className="text-xs">Upload Excel files organized by sector folders</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
