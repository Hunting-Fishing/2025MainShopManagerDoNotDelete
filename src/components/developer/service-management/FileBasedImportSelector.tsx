
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare, Square, Upload, RefreshCw, Folder, FileText } from 'lucide-react';
import { StorageFile } from '@/types/service';
import { supabase } from '@/integrations/supabase/client';

interface FileBasedImportSelectorProps {
  onImportFiles: (files: StorageFile[], folderName: string) => void;
  isImporting: boolean;
}

export function FileBasedImportSelector({ onImportFiles, isImporting }: FileBasedImportSelectorProps) {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folderName] = useState('automotive'); // Fixed folder for now

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching files from folder: service-data/${folderName}/`);
      
      const { data, error: listError } = await supabase.storage
        .from('service-data')
        .list(folderName, {
          limit: 100,
          offset: 0,
        });

      if (listError) {
        throw new Error(`Failed to fetch files: ${listError.message}`);
      }

      console.log('Files fetched:', data);

      const excelFiles = (data || [])
        .filter(file => 
          file.name.toLowerCase().endsWith('.xlsx') || 
          file.name.toLowerCase().endsWith('.xls')
        )
        .map(file => ({
          name: file.name,
          id: file.id || file.name,
          path: `${folderName}/${file.name}`,
          size: file.metadata?.size || 0,
          type: file.metadata?.mimetype || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          updated_at: file.updated_at,
          created_at: file.created_at,
          last_accessed_at: file.last_accessed_at,
          lastModified: file.updated_at ? new Date(file.updated_at) : new Date(),
          metadata: file.metadata
        }));

      setFiles(excelFiles);
      console.log(`Found ${excelFiles.length} Excel files`);
      
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [folderName]);

  const toggleFileSelection = (fileName: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileName)) {
      newSelected.delete(fileName);
    } else {
      newSelected.add(fileName);
    }
    setSelectedFiles(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(f => f.name)));
    }
  };

  const handleImport = () => {
    const filesToImport = files.filter(file => selectedFiles.has(file.name));
    if (filesToImport.length > 0) {
      onImportFiles(filesToImport, folderName);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Select Files from {folderName} Folder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFiles}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Files
          </Button>
          
          {files.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
              disabled={isImporting}
            >
              {selectedFiles.size === files.length ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Select All
                </>
              )}
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <Alert>
            <Folder className="h-4 w-4" />
            <AlertDescription>
              No Excel files found in the service-data/{folderName}/ folder. 
              Please upload Excel files to this folder in your Supabase storage.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Found {files.length} Excel file{files.length !== 1 ? 's' : ''} • {selectedFiles.size} selected
            </p>
            
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center space-x-3 p-3 border-b last:border-b-0 hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedFiles.has(file.name)}
                    onCheckedChange={() => toggleFileSelection(file.name)}
                    disabled={isImporting}
                  />
                  <FileText className="h-4 w-4 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size || 0)} • Modified {file.lastModified?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedFiles.size > 0 && (
          <Button
            onClick={handleImport}
            disabled={isImporting || selectedFiles.size === 0}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? 'Importing...' : `Import ${selectedFiles.size} Selected File${selectedFiles.size !== 1 ? 's' : ''}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
