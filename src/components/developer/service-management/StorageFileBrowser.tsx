
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: any;
}

interface StorageFileBrowserProps {
  bucketName: string;
  onFileSelect: (fileName: string) => void;
  accept?: string[];
  title?: string;
}

export const StorageFileBrowser: React.FC<StorageFileBrowserProps> = ({
  bucketName,
  onFileSelect,
  accept = ['.csv', '.json', '.xlsx', '.xls'],
  title = 'Select File to Import'
}) => {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading files from bucket: ${bucketName}`);
      console.log(`Accepted file types: ${accept.join(', ')}`);
      
      // First, let's list ALL files to see what's actually in the bucket
      const { data: allFiles, error: listError } = await supabase.storage
        .from(bucketName)
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (listError) {
        console.error('Storage list error:', listError);
        throw listError;
      }

      console.log('All files in bucket:', allFiles);

      if (!allFiles || allFiles.length === 0) {
        console.log('No files found in bucket');
        setFiles([]);
        setError(`No files found in bucket "${bucketName}"`);
        return;
      }

      // Filter files based on accepted extensions
      const filteredFiles = allFiles.filter(file => {
        if (!file.name) return false;
        
        // Get file extension (handle multiple dots in filename)
        const nameParts = file.name.split('.');
        const extension = nameParts.length > 1 ? '.' + nameParts[nameParts.length - 1].toLowerCase() : '';
        
        console.log(`File: ${file.name}, Extension: ${extension}`);
        
        const isAccepted = accept.some(acceptedExt => 
          acceptedExt.toLowerCase() === extension.toLowerCase()
        );
        
        console.log(`File ${file.name} ${isAccepted ? 'accepted' : 'rejected'}`);
        return isAccepted;
      });

      console.log(`Filtered files (${filteredFiles.length}):`, filteredFiles);

      if (filteredFiles.length === 0) {
        setError(`No compatible files found. Looking for: ${accept.join(', ')}`);
      }

      setFiles(filteredFiles);
    } catch (err: any) {
      console.error('Error loading files:', err);
      setError(err.message || 'Failed to load files');
      toast({
        title: "Error",
        description: "Failed to load files from storage",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [bucketName]);

  const handleFileSelect = (fileName: string) => {
    console.log(`File selected: ${fileName}`);
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
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
      <CardContent>
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading files...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <div className="text-sm text-gray-600">
              <p>Debug info:</p>
              <p>Bucket: {bucketName}</p>
              <p>Accepted types: {accept.join(', ')}</p>
            </div>
          </div>
        )}

        {!loading && !error && files.length === 0 && (
          <div className="text-center py-8">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No compatible files found</p>
            <p className="text-sm text-gray-400 mt-2">
              Supported formats: {accept.join(', ')}
            </p>
          </div>
        )}

        {!loading && files.length > 0 && (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id || file.name}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleFileSelect(file.name)}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(file.created_at)} • {formatFileSize(file.metadata?.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileSelect(file.name);
                  }}
                >
                  Select
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
