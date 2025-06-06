
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, File, Folder, Upload, RefreshCw, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { storageService, type StorageFile } from '@/lib/services/unifiedStorageService';

export interface StorageFileBrowserProps {
  bucketName: string;
  onFileSelect: (filePath: string) => void;
  disabled?: boolean;
}

export function StorageFileBrowser({ bucketName, onFileSelect, disabled = false }: StorageFileBrowserProps) {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [bucketExists, setBucketExists] = useState(false);

  const loadFiles = async () => {
    setLoading(true);
    try {
      // First check if bucket exists
      const exists = await storageService.checkBucketExists(bucketName);
      setBucketExists(exists);
      
      if (!exists) {
        console.log(`Bucket ${bucketName} does not exist`);
        setFiles([]);
        return;
      }

      console.log(`Loading files from ${bucketName}/${currentFolder}`);
      const fileList = await storageService.listFiles(bucketName, currentFolder);
      console.log('Loaded files:', fileList);
      setFiles(fileList);
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [bucketName, currentFolder]);

  const handleFileClick = (file: StorageFile) => {
    if (disabled) return;
    
    // If it's a folder, navigate into it
    if (file.isFolder) {
      setCurrentFolder(file.path);
      setSelectedFile(null);
      return;
    }
    
    // If it's a file, select it
    setSelectedFile(file.path);
    onFileSelect(file.path);
  };

  const goBack = () => {
    const pathParts = currentFolder.split('/');
    pathParts.pop();
    setCurrentFolder(pathParts.join('/'));
    setSelectedFile(null);
  };

  const handleRefresh = () => {
    storageService.clearCacheForBucket(bucketName);
    loadFiles();
  };

  const formatFileSize = (size?: number): string => {
    if (!size) return '';
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Storage Browser</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!bucketExists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Storage Browser</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">Bucket "{bucketName}" not found</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Storage Browser</CardTitle>
          <div className="flex items-center gap-2">
            {currentFolder && (
              <Button variant="outline" size="sm" onClick={goBack}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {currentFolder && (
          <p className="text-sm text-muted-foreground">
            Current path: /{currentFolder}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No files found in this folder</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file, index) => {
              const isSelected = selectedFile === file.path;
              
              return (
                <div
                  key={`${file.path}-${index}`}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                    isSelected ? 'bg-primary/10 border-primary' : 'border-border'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleFileClick(file)}
                >
                  {file.isFolder ? (
                    <Folder className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <File className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {file.lastModified && (
                        <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                      )}
                      {file.size && (
                        <span>• {formatFileSize(file.size)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
