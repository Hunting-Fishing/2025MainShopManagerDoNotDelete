
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, RefreshCw, FolderOpen, FileSpreadsheet, SelectAll, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StorageFile } from '@/types/service';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileBasedImportSelectorProps {
  onImportFiles: (selectedFiles: StorageFile[], folderName: string) => Promise<void>;
  isImporting: boolean;
}

export function FileBasedImportSelector({ onImportFiles, isImporting }: FileBasedImportSelectorProps) {
  const [availableFiles, setAvailableFiles] = useState<StorageFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [folderName, setFolderName] = useState('automotive');
  const { toast } = useToast();

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      // Try to list files in the specified folder
      const { data: filesList, error } = await supabase.storage
        .from('service-data')
        .list(folderName, { 
          limit: 1000, 
          sortBy: { column: 'name', order: 'asc' } 
        });

      if (error) {
        console.error('Error fetching files:', error);
        toast({
          title: "Error",
          description: `Failed to fetch files from ${folderName} folder: ${error.message}`,
          variant: "destructive",
        });
        setAvailableFiles([]);
        return;
      }

      // Filter for Excel files only
      const excelFiles = filesList?.filter(item => 
        item.metadata && item.name.toLowerCase().endsWith('.xlsx')
      ).map(item => ({
        name: item.name,
        path: `${folderName}/${item.name}`,
        size: item.metadata?.size,
        type: item.metadata?.mimetype,
        lastModified: new Date(item.updated_at),
        id: item.id,
        updated_at: item.updated_at,
        created_at: item.created_at,
        last_accessed_at: item.last_accessed_at,
        metadata: item.metadata
      })) || [];

      setAvailableFiles(excelFiles);
      
      if (excelFiles.length === 0) {
        toast({
          title: "No Excel Files Found",
          description: `No .xlsx files found in the ${folderName} folder. Please upload some Excel files first.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Error in fetchFiles:', error);
      toast({
        title: "Error",
        description: "Failed to connect to storage",
        variant: "destructive",
      });
      setAvailableFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [folderName]);

  const handleFileToggle = (fileName: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileName)) {
      newSelected.delete(fileName);
    } else {
      newSelected.add(fileName);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === availableFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(availableFiles.map(file => file.name)));
    }
  };

  const handleImport = async () => {
    if (selectedFiles.size === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to import",
        variant: "destructive",
      });
      return;
    }

    const filesToImport = availableFiles.filter(file => selectedFiles.has(file.name));
    await onImportFiles(filesToImport, folderName);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${kb.toFixed(1)} KB`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          File-Based Service Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Folder Selection */}
        <Alert>
          <FolderOpen className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div><strong>Current Folder:</strong> <code>service-data/{folderName}/</code></div>
              <div className="text-xs text-muted-foreground">
                All Excel files in this folder will be listed for selection
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Refresh Button */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchFiles}
            disabled={isLoading || isImporting}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Files
          </Button>
        </div>

        {/* File List */}
        {availableFiles.length > 0 && (
          <div className="space-y-3">
            {/* Select All Controls */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedFiles.size === availableFiles.length && availableFiles.length > 0}
                  onCheckedChange={handleSelectAll}
                  disabled={isImporting}
                />
                <span className="text-sm font-medium">
                  Select All ({availableFiles.length} files)
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {selectedFiles.size} selected
              </div>
            </div>

            {/* Individual Files */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {availableFiles.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedFiles.has(file.name)}
                    onCheckedChange={() => handleFileToggle(file.name)}
                    disabled={isImporting}
                  />
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.lastModified?.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Import Button */}
            <Button
              onClick={handleImport}
              disabled={isImporting || selectedFiles.size === 0}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting 
                ? 'Importing...' 
                : `Import ${selectedFiles.size} Selected File${selectedFiles.size !== 1 ? 's' : ''}`
              }
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading files...</p>
          </div>
        )}

        {!isLoading && availableFiles.length === 0 && (
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No Excel files found in the {folderName} folder</p>
            <p className="text-sm text-gray-400 mt-1">
              Upload .xlsx files to service-data/{folderName}/ to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
