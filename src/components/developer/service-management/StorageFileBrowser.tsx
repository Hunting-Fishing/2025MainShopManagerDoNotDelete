
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Loader2, FileSpreadsheet, RefreshCw } from 'lucide-react';

interface StorageFile {
  name: string;
  id: string | null;
  updated_at: string | null;
  created_at: string | null;
  last_accessed_at: string | null;
  metadata: Record<string, any> | null;
}

interface StorageFileBrowserProps {
  bucketName: string;
  onFileSelect: (fileName: string) => void;
  accept?: string;
  disabled?: boolean;
}

export const StorageFileBrowser: React.FC<StorageFileBrowserProps> = ({
  bucketName,
  onFileSelect,
  accept = '.csv,.json,.xlsx,.xls',
  disabled = false
}) => {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [bucketName]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Loading files from bucket: ${bucketName}`);

      const { data, error: listError } = await supabase.storage
        .from(bucketName)
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'updated_at', order: 'desc' }
        });

      console.log('Raw storage response:', { data, error: listError });

      if (listError) {
        console.error('Storage list error:', listError);
        throw listError;
      }

      if (!data) {
        console.log('No data returned from storage');
        setFiles([]);
        return;
      }

      console.log(`Found ${data.length} total files in storage`);

      // Parse accepted extensions - handle both with and without dots
      const acceptedExtensions = accept.split(',').map(ext => {
        const cleanExt = ext.trim().toLowerCase();
        return cleanExt.startsWith('.') ? cleanExt : `.${cleanExt}`;
      });
      
      console.log('Accepted extensions:', acceptedExtensions);

      // Filter files based on accept prop - be more permissive with filtering
      const filteredFiles = data?.filter(file => {
        if (!file.name) {
          console.log('Skipping file with no name:', file);
          return false;
        }
        
        // Get file extension
        const nameParts = file.name.split('.');
        if (nameParts.length < 2) {
          console.log('Skipping file with no extension:', file.name);
          return false;
        }
        
        const extension = '.' + nameParts.pop()?.toLowerCase();
        console.log(`File: ${file.name}, Extension: ${extension}`);
        
        const isAccepted = acceptedExtensions.includes(extension) || acceptedExtensions.includes('*');
        console.log(`File ${file.name} accepted: ${isAccepted}`);
        
        return isAccepted;
      }) || [];

      console.log(`Filtered to ${filteredFiles.length} compatible files:`, filteredFiles.map(f => f.name));
      setFiles(filteredFiles);
    } catch (err) {
      console.error('Error loading files:', err);
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (size: number | undefined): string => {
    if (!size) return 'Unknown size';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'xlsx' || extension === 'xls') {
      return <FileSpreadsheet className="h-4 w-4 mr-2 text-green-500" />;
    }
    return <FileText className="h-4 w-4 mr-2 text-blue-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading files...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-red-600 mb-2">Error: {error}</div>
          <Button onClick={loadFiles} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Select File from Storage
        </CardTitle>
        <p className="text-sm text-gray-600">
          Bucket: {bucketName} • Supported: CSV, JSON, Excel files
        </p>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No compatible files found in bucket "{bucketName}"</p>
            <p className="text-xs mt-1">Upload CSV, JSON, or Excel files to see them here</p>
            <Button onClick={loadFiles} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Files
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center flex-1">
                  {getFileIcon(file.name)}
                  <div>
                    <div className="font-medium">{decodeURIComponent(file.name)}</div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(file.metadata?.size)} • 
                      {file.updated_at && new Date(file.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onFileSelect(file.name)}
                  disabled={disabled}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Import
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <Button onClick={loadFiles} variant="outline" className="w-full mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Files
        </Button>
      </CardContent>
    </Card>
  );
};
