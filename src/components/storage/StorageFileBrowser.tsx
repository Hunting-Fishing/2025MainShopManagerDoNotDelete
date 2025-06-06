
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storageService, type StorageFile } from '@/lib/services/unifiedStorageService';
import { FolderOpen, FileText, Download, RefreshCw } from 'lucide-react';

interface StorageFileBrowserProps {
  bucketName: string;
  onFileSelect?: (file: StorageFile) => void;
}

export function StorageFileBrowser({ bucketName, onFileSelect }: StorageFileBrowserProps) {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async (path: string = '') => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading files from ${bucketName}/${path}`);
      const fileList = await storageService.listFiles(bucketName, path);
      setFiles(fileList);
      setCurrentPath(path);
    } catch (err) {
      console.error('Error loading files:', err);
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [bucketName]);

  const handleFileClick = (file: StorageFile) => {
    if (file.isFolder) {
      // Navigate into folder
      loadFiles(file.path);
    } else {
      // Select file
      onFileSelect?.(file);
    }
  };

  const handleDownload = async (file: StorageFile) => {
    if (file.isFolder) return;
    
    try {
      const blob = await storageService.downloadFile(bucketName, file.path);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };

  const navigateUp = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      pathParts.pop();
      const newPath = pathParts.join('/');
      loadFiles(newPath);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Storage Browser
          </CardTitle>
          <Button onClick={() => loadFiles(currentPath)} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        {currentPath && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Path: /{currentPath}</span>
            <Button onClick={navigateUp} size="sm" variant="ghost">
              Go Up
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading files...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 py-4">
            Error: {error}
          </div>
        ) : files.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            No files found in this location
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => handleFileClick(file)}
              >
                <div className="flex items-center gap-3">
                  {file.isFolder ? (
                    <FolderOpen className="h-5 w-5 text-blue-600" />
                  ) : (
                    <FileText className="h-5 w-5 text-gray-600" />
                  )}
                  <div>
                    <div className="font-medium">{file.name}</div>
                    {!file.isFolder && (
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • {file.type}
                      </div>
                    )}
                  </div>
                </div>
                {!file.isFolder && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file);
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
