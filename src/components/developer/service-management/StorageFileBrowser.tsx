
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Loader2 } from 'lucide-react';

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
  accept = '.csv,.json',
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

      const { data, error: listError } = await supabase.storage
        .from(bucketName)
        .list('', {
          limit: 100,
          offset: 0
        });

      if (listError) throw listError;

      // Filter files based on accept prop
      const acceptedExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
      const filteredFiles = data?.filter(file => {
        if (!file.name) return false;
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return acceptedExtensions.some(acceptExt => 
          acceptExt === extension || acceptExt === '*'
        );
      }) || [];

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
          <div className="text-red-600">Error: {error}</div>
          <Button onClick={loadFiles} className="mt-2">
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
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No compatible files found in bucket "{bucketName}"
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center flex-1">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  <div>
                    <div className="font-medium">{file.name}</div>
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
          Refresh Files
        </Button>
      </CardContent>
    </Card>
  );
};
