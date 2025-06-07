
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FolderOpen, FileText, CheckSquare, Square, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { StorageFile } from '@/types/service';

interface FileBasedImportSelectorProps {
  onImportFiles: (selectedFiles: StorageFile[], folderName: string) => Promise<void>;
  isImporting: boolean;
}

export function FileBasedImportSelector({ onImportFiles, isImporting }: FileBasedImportSelectorProps) {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const folderPath = 'automotive'; // Default to automotive folder

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: storageError } = await supabase.storage
        .from('service-data')
        .list(folderPath, {
          limit: 100,
          offset: 0,
        });

      if (storageError) {
        throw storageError;
      }

      const excelFiles = (data || [])
        .filter(file => file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls'))
        .map(file => ({
          name: file.name,
          size: file.metadata?.size || 0,
          lastModified: file.updated_at || file.created_at || '',
          fullPath: `${folderPath}/${file.name}`
        }));

      setFiles(excelFiles);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (fileName: string, checked: boolean) => {
    const newSelected = new Set(selectedFiles);
    if (checked) {
      newSelected.add(fileName);
    } else {
      newSelected.delete(fileName);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(f => f.name)));
    }
  };

  const handleImport = async () => {
    if (selectedFiles.size === 0) return;
    
    const filesToImport = files.filter(f => selectedFiles.has(f.name));
    await onImportFiles(filesToImport, folderPath);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const allSelected = files.length > 0 && selectedFiles.size === files.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Select Files from {folderPath}/ folder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="text-center py-4">
            <div className="text-sm text-muted-foreground">Loading files...</div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && files.length === 0 && (
          <Alert>
            <FolderOpen className="h-4 w-4" />
            <AlertDescription>
              No Excel files found in the {folderPath}/ folder. Please upload Excel files to the service-data/{folderPath}/ storage bucket.
            </AlertDescription>
          </Alert>
        )}

        {files.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center gap-2"
              >
                {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                {allSelected ? 'Deselect All' : 'Select All'}
              </Button>
              
              <div className="text-sm text-muted-foreground">
                {selectedFiles.size} of {files.length} files selected
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedFiles.has(file.name)}
                    onCheckedChange={(checked) => handleFileSelect(file.name, !!checked)}
                  />
                  <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {new Date(file.lastModified).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleImport}
                disabled={selectedFiles.size === 0 || isImporting}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isImporting ? 'Importing...' : `Import ${selectedFiles.size} File${selectedFiles.size !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
