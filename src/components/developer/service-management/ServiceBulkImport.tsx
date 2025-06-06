
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, FileSpreadsheet, Upload } from 'lucide-react';
import { storageService } from '@/lib/services/unifiedStorageService';
import { useToast } from '@/hooks/use-toast';

interface ServiceBulkImportProps {
  onImport: () => void;
  disabled?: boolean;
}

export function ServiceBulkImport({ onImport, disabled = false }: ServiceBulkImportProps) {
  const [bucketInfo, setBucketInfo] = useState<{
    folders: { name: string; fileCount: number; files: { name: string; size: number; lastModified: string; }[] }[];
    totalFiles: number;
  }>({ folders: [], totalFiles: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBucketInfo();
  }, []);

  const loadBucketInfo = async () => {
    try {
      setLoading(true);
      const info = await storageService.getBucketInfo('service-imports');
      
      // Get detailed info for each folder
      const foldersWithFiles = await Promise.all(
        info.folders.map(async (folder) => {
          try {
            const files = await storageService.getFilesInFolder('service-imports', folder.path, ['.xlsx']);
            return {
              name: folder.name,
              fileCount: files.length,
              files: files.map(file => ({
                name: file.name,
                size: file.size,
                lastModified: file.lastModified.toISOString() // Convert Date to string
              }))
            };
          } catch (error) {
            console.error(`Error loading files for folder ${folder.name}:`, error);
            return {
              name: folder.name,
              fileCount: 0,
              files: []
            };
          }
        })
      );

      const totalFiles = foldersWithFiles.reduce((acc, folder) => acc + folder.fileCount, 0);
      
      setBucketInfo({
        folders: foldersWithFiles,
        totalFiles
      });
    } catch (error) {
      console.error('Error loading bucket info:', error);
      toast({
        title: "Error",
        description: "Failed to load bucket information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Service Data Import
          </CardTitle>
          <CardDescription>
            Loading bucket information...
          </CardDescription>
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
          <Upload className="h-5 w-5" />
          Service Data Import
        </CardTitle>
        <CardDescription>
          Import service hierarchy data from structured files in storage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Expected Structure</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Upload Excel files to the 'service-imports' storage bucket</p>
            <p>• Organize files in folders (each folder represents a sector)</p>
            <p>• Files should contain sectors, categories, subcategories, and jobs</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Bucket Structure
            </h4>
            <Button variant="outline" size="sm" onClick={loadBucketInfo}>
              Refresh
            </Button>
          </div>

          {bucketInfo.folders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No folders found in the service-imports bucket</p>
              <p className="text-sm">Create folders and upload Excel files to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bucketInfo.folders.map((folder) => (
                <div key={folder.name} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{folder.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <FileSpreadsheet className="h-3 w-3" />
                      {folder.fileCount} Excel files
                    </div>
                  </div>
                  {folder.files.length > 0 && (
                    <div className="ml-6 space-y-1">
                      {folder.files.map((file) => (
                        <div key={file.name} className="text-sm text-muted-foreground flex items-center justify-between">
                          <span>📄 {file.name}</span>
                          <span>{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {bucketInfo.totalFiles === 0 
                ? "Ready to import! Upload files to get started." 
                : `Found ${bucketInfo.totalFiles} Excel files across ${bucketInfo.folders.length} sectors. Ready to import!`
              }
            </div>
            <Button 
              onClick={onImport} 
              disabled={disabled || bucketInfo.totalFiles === 0}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Start Import
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
