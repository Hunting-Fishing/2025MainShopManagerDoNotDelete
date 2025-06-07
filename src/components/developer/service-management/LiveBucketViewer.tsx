
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, FileText, RefreshCw, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface StorageFile {
  name: string;
  size?: number;
  lastModified?: Date;
}

export function LiveBucketViewer() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bucketStatus, setBucketStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  const loadBucketData = async () => {
    try {
      setLoading(true);
      setError(null);
      setBucketStatus('checking');
      
      console.log('Checking service-imports bucket...');
      
      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) throw bucketsError;
      
      const bucket = buckets?.find(b => b.name === 'service-imports');
      if (!bucket) {
        setError('service-imports bucket not found');
        setBucketStatus('error');
        return;
      }
      
      // List files in bucket
      const { data: filesList, error: filesError } = await supabase.storage
        .from('service-imports')
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      if (filesError) throw filesError;

      const storageFiles = filesList?.map(file => ({
        name: file.name,
        size: file.metadata?.size,
        lastModified: new Date(file.updated_at)
      })) || [];
      
      setFiles(storageFiles);
      setBucketStatus('connected');
      console.log('Loaded files:', storageFiles);
      
    } catch (err) {
      console.error('Error loading bucket data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setBucketStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBucketData();
  }, []);

  const getStatusColor = () => {
    switch (bucketStatus) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusText = () => {
    switch (bucketStatus) {
      case 'connected': return 'Connected';
      case 'error': return 'Error';
      default: return 'Checking...';
    }
  };

  const getStatusIcon = () => {
    switch (bucketStatus) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Storage Bucket Status
        </CardTitle>
        <CardDescription>
          Real-time view of service-imports storage bucket
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Bucket Status:</span>
              <div className={`flex items-center gap-1 text-sm font-medium ${getStatusColor()}`}>
                {getStatusIcon()}
                {getStatusText()}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadBucketData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{bucketStatus === 'connected' ? '1' : '0'}</div>
                <div className="text-xs text-gray-500">Active Bucket</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{files.length}</div>
                <div className="text-xs text-gray-500">Files</div>
              </div>
            </div>
          </div>

          {bucketStatus === 'connected' && (
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Files:</h4>
              {files.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {files.map((file, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{file.name}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <FileText className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No files in bucket</div>
                  <div className="text-xs">Files are automatically cleaned up after processing</div>
                </div>
              )}
            </div>
          )}

          {bucketStatus === 'connected' && (
            <div className="text-xs text-gray-500 p-2 bg-green-50 border border-green-200 rounded">
              ✅ Storage bucket is properly configured and ready for imports
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
