
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckSquare, Square, Upload, RefreshCw, FolderOpen } from 'lucide-react';
import { StorageFile } from '@/types/service';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileBasedImportSelectorProps {
  onImportFiles: (selectedFiles: StorageFile[], folderName: string) => void;
  isImporting: boolean;
}

export const FileBasedImportSelector: React.FC<FileBasedImportSelectorProps> = ({
  onImportFiles,
  isImporting
}) => {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [folderName] = useState('automotive'); // Fixed folder for now
  const { toast } = useToast();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('service-data')
        .list(folderName, {
          limit: 100,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) throw error;

      if (data) {
        const excelFiles = data
          .filter(file => file.name.toLowerCase().endsWith('.xlsx'))
          .map(file => ({
            id: file.id || file.name,
            name: file.name,
            path: `${folderName}/${file.name}`,
            size: file.metadata?.size || 0,
            type: file.metadata?.mimetype || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            lastModified: new Date(file.updated_at || file.created_at),
            updated_at: file.updated_at,
            created_at: file.created_at,
            last_accessed_at: file.last_accessed_at,
            metadata: file.metadata
          }));
        
        setFiles(excelFiles);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
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
    fetchFiles();
  }, []);

  const toggleFileSelection = (file: StorageFile) => {
    setSelectedFiles(prev => {
      const isSelected = prev.some(f => f.name === file.name);
      if (isSelected) {
        return prev.filter(f => f.name !== file.name);
      } else {
        return [...prev, file];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles([...files]);
    }
  };

  const handleImport = () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to import",
        variant: "destructive",
      });
      return;
    }
    onImportFiles(selectedFiles, folderName);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Select Files from {folderName} Folder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={fetchFiles}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Files
          </Button>
          
          {files.length > 0 && (
            <Button
              variant="outline"
              onClick={toggleSelectAll}
              className="flex items-center gap-2"
            >
              {selectedFiles.length === files.length ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              {selectedFiles.length === files.length ? 'Deselect All' : 'Select All'}
            </Button>
          )}
        </div>

        {loading && (
          <Alert>
            <AlertDescription>Loading files...</AlertDescription>
          </Alert>
        )}

        {!loading && files.length === 0 && (
          <Alert>
            <AlertDescription>
              No Excel files found in the {folderName} folder. Please upload .xlsx files to service-data/{folderName}/
            </AlertDescription>
          </Alert>
        )}

        {files.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              Found {files.length} Excel file{files.length !== 1 ? 's' : ''} • {selectedFiles.length} selected
            </div>
            
            <div className="max-h-60 overflow-y-auto border rounded-md">
              {files.map((file) => {
                const isSelected = selectedFiles.some(f => f.name === file.name);
                return (
                  <div
                    key={file.name}
                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => toggleFileSelection(file)}
                  >
                    <div className="flex items-center gap-3">
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {file.size ? `${Math.round(file.size / 1024)} KB` : 'Size unknown'} • 
                          {file.lastModified ? ` Updated ${file.lastModified.toLocaleDateString()}` : ' Date unknown'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedFiles.length > 0 && (
          <Button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isImporting ? 'Importing...' : `Import ${selectedFiles.length} Selected File${selectedFiles.length !== 1 ? 's' : ''}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
