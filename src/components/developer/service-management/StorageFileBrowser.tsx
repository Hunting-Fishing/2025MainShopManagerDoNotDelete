
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, HardDrive } from 'lucide-react';
import { toast } from 'sonner';

// Use Supabase's FileObject type directly
interface StorageFile {
  id: string;
  name: string;
  updated_at: string | null;
  created_at: string | null;
  last_accessed_at: string | null;
  metadata: Record<string, any>;
}

interface StorageFileBrowserProps {
  bucketName: string;
  onFileSelect: (fileName: string) => void;
  selectedFile: string | null;
  allowedTypes?: string[];
}

export function StorageFileBrowser({ 
  bucketName, 
  onFileSelect, 
  selectedFile,
  allowedTypes = ['.xlsx', '.xls', '.csv']
}: StorageFileBrowserProps) {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [bucketName]);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: listError } = await supabase.storage
        .from(bucketName)
        .list('', {
          limit: 100,
          sortBy: { column: 'updated_at', order: 'desc' }
        });

      if (listError) {
        throw listError;
      }

      // Filter files by allowed types and convert to our interface
      const filteredFiles = (data || [])
        .filter(file => 
          allowedTypes.some(type => file.name.toLowerCase().endsWith(type))
        )
        .map(file => ({
          id: file.id || file.name, // Use name as fallback for id
          name: file.name,
          updated_at: file.updated_at,
          created_at: file.created_at,
          last_accessed_at: file.last_accessed_at,
          metadata: file.metadata || {}
        }));

      setFiles(filteredFiles);
    } catch (err) {
      console.error('Error loading files:', err);
      setError(err instanceof Error ? err.message : 'Failed to load files');
      toast.error('Failed to load files from storage');
    } finally {
      setLoading(false);
    }
  };

  const getFileSize = (file: StorageFile): string => {
    const size = file.metadata?.size;
    if (!size) return 'Unknown size';
    
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return <FileText className="h-4 w-4 text-green-600" />;
    }
    if (fileName.endsWith('.csv')) {
      return <FileText className="h-4 w-4 text-blue-600" />;
    }
    return <FileText className="h-4 w-4 text-gray-600" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading files...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <HardDrive className="h-5 w-5" />
            Storage Files - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600 mb-4">{error}</div>
          <Button onClick={loadFiles} variant="outline" size="sm">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Storage Files
          <Badge variant="secondary">{files.length} files</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-sm text-muted-foreground">
              No Excel or CSV files found in storage
            </div>
            <Button onClick={loadFiles} variant="outline" size="sm" className="mt-4">
              Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedFile === file.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onFileSelect(file.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getFileIcon(file.name)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {file.name}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(file.updated_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {getFileSize(file)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedFile === file.name && (
                    <Badge className="ml-2">Selected</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
