
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

interface StorageFileBrowserProps {
  bucketName: string;
  onFileSelect: (file: File) => void;
  loading?: boolean;
}

export function StorageFileBrowser({ bucketName, onFileSelect, loading }: StorageFileBrowserProps) {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, [bucketName]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('Error fetching files:', error);
        toast.error('Failed to fetch files from storage');
        return;
      }

      // Filter for Excel files only
      const excelFiles = data?.filter(file => 
        file.name.endsWith('.xlsx') || 
        file.name.endsWith('.xls') ||
        file.metadata?.mimetype?.includes('spreadsheet')
      ) || [];

      setFiles(excelFiles);
    } catch (error) {
      console.error('Error in fetchFiles:', error);
      toast.error('Failed to fetch files');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAndProcessFile = async (fileName: string) => {
    setDownloading(fileName);
    try {
      console.log(`Downloading file: ${fileName} from bucket: ${bucketName}`);
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(fileName);

      if (error) {
        console.error('Storage download error:', error);
        toast.error(`Failed to download ${fileName}: ${error.message}`);
        return;
      }

      if (!data) {
        toast.error('No data received from storage');
        return;
      }

      // Convert blob to File object
      const file = new File([data], fileName, {
        type: data.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      console.log('File downloaded successfully:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      onFileSelect(file);
      toast.success(`Successfully loaded ${fileName}`);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(`Failed to process ${fileName}`);
    } finally {
      setDownloading(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Loading Files...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Storage Files ({bucketName})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select an Excel file from storage to import services
        </p>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Excel Files Found</h3>
            <p className="text-sm text-muted-foreground">
              Upload an Excel file to the {bucketName} bucket to get started
            </p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.name}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedFile === file.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedFile(file.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div>
                        <h4 className="font-medium text-sm">{file.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(file.created_at)}
                          </span>
                          {file.metadata?.size && (
                            <Badge variant="secondary" className="text-xs">
                              {formatFileSize(file.metadata.size)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadAndProcessFile(file.name);
                      }}
                      disabled={downloading === file.name || loading}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {downloading === file.name ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download className="h-3 w-3" />
                          Import
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Button
            onClick={fetchFiles}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Files'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
