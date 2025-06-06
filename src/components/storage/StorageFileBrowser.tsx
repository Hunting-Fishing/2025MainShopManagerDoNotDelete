
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, File, Folder, Upload } from 'lucide-react';
import { toast } from 'sonner';

export interface StorageFileBrowserProps {
  bucketName: string;
  onFileSelect: (filePath: string) => void;
  disabled?: boolean;
}

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: any;
}

export function StorageFileBrowser({ bucketName, onFileSelect, disabled = false }: StorageFileBrowserProps) {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [bucketName, currentFolder]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(currentFolder, {
          limit: 100,
          offset: 0
        });

      if (error) {
        console.error('Error loading files:', error);
        toast.error('Failed to load files');
        return;
      }

      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = (file: StorageFile) => {
    const filePath = currentFolder ? `${currentFolder}/${file.name}` : file.name;
    
    // If it's a folder, navigate into it
    if (!file.name.includes('.')) {
      setCurrentFolder(filePath);
      return;
    }
    
    // If it's a file, select it
    setSelectedFile(filePath);
    onFileSelect(filePath);
  };

  const goBack = () => {
    const pathParts = currentFolder.split('/');
    pathParts.pop();
    setCurrentFolder(pathParts.join('/'));
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Storage Browser</CardTitle>
          {currentFolder && (
            <Button variant="outline" size="sm" onClick={goBack}>
              Back
            </Button>
          )}
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
            {files.map((file) => {
              const filePath = currentFolder ? `${currentFolder}/${file.name}` : file.name;
              const isFolder = !file.name.includes('.');
              const isSelected = selectedFile === filePath;
              
              return (
                <div
                  key={file.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                    isSelected ? 'bg-primary/10 border-primary' : 'border-border'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !disabled && handleFileClick(file)}
                >
                  {isFolder ? (
                    <Folder className="h-5 w-5 text-blue-500" />
                  ) : (
                    <File className="h-5 w-5 text-gray-500" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(file.updated_at).toLocaleDateString()}
                    </p>
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
