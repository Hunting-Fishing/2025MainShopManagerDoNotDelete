
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Folder, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface StorageFileBrowserProps {
  bucketName: string;
  onFileSelect: (fileName: string) => void;
}

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata?: {
    size?: number;
    mimetype?: string;
  };
}

export const StorageFileBrowser: React.FC<StorageFileBrowserProps> = ({ 
  bucketName, 
  onFileSelect 
}) => {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string>('');

  const loadFiles = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log(`Loading files from bucket: ${bucketName}`);
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('', {
          limit: 100,
          offset: 0
        });

      if (error) {
        console.error('Storage list error:', error);
        throw error;
      }

      console.log(`Found ${data?.length || 0} files:`, data);
      
      // Filter for supported file types
      const supportedFiles = (data || []).filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return ['csv', 'json', 'xlsx', 'xls'].includes(extension || '');
      });

      setFiles(supportedFiles);
      
      if (supportedFiles.length === 0) {
        setError('No supported files found. Please upload CSV, JSON, or Excel files.');
      }
    } catch (error) {
      console.error('Failed to load files:', error);
      setError(error instanceof Error ? error.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bucketName) {
      loadFiles();
    }
  }, [bucketName]);

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
    onFileSelect(fileName);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Folder className="h-5 w-5 mr-2" />
            Storage Files ({bucketName})
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadFiles}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
            <p className="mt-2 text-sm text-gray-600">Loading files...</p>
          </div>
        ) : files.length > 0 ? (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedFile === file.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleFileSelect(file.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.metadata?.size)} • {formatDate(file.updated_at)}
                      </p>
                    </div>
                  </div>
                  {selectedFile === file.name && (
                    <div className="text-blue-600 text-sm font-medium">Selected</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No files found in this bucket</p>
            <p className="text-sm">Upload some CSV, JSON, or Excel files to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
