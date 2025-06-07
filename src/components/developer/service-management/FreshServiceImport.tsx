
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, RefreshCw, FolderOpen, Database, FileText } from 'lucide-react';
import { ServiceImportProgress } from './ServiceImportProgress';
import { FileBasedImportSelector } from './FileBasedImportSelector';
import { LiveBucketViewer } from './LiveBucketViewer';
import { useServiceManagement } from '@/hooks/useServiceManagement';
import { useFileBasedServiceImport } from '@/hooks/useFileBasedServiceImport';

interface FreshServiceImportProps {
  onImportComplete?: () => void;
}

export function FreshServiceImport({ onImportComplete }: FreshServiceImportProps) {
  const [activeTab, setActiveTab] = useState('file-upload');
  const { 
    importFromStorage, 
    isImporting: storageImporting, 
    importProgress: storageProgress 
  } = useServiceManagement();
  
  const {
    isImporting: fileImporting,
    importProgress: fileProgress,
    importSelectedFiles,
    handleCancel: handleFileCancel
  } = useFileBasedServiceImport();

  const handleStorageImport = async () => {
    try {
      await importFromStorage();
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Storage import failed:', error);
    }
  };

  const handleFileImport = async (files: File[]) => {
    try {
      await importSelectedFiles(files);
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error('File import failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Bucket Viewer - Show files from storage bucket */}
      <LiveBucketViewer />

      <Card>
        <CardHeader>
          <CardTitle>Import Services from Storage</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose your import method below. Both methods will save services directly to the database.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file-upload" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload Files</span>
              </TabsTrigger>
              <TabsTrigger value="bucket-import" className="flex items-center space-x-2">
                <FolderOpen className="h-4 w-4" />
                <span>Import from Bucket</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file-upload" className="space-y-4">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div><strong>Direct Upload:</strong> Select Excel files from your computer</div>
                    <div><strong>Processing:</strong> Files are processed and saved directly to the database</div>
                    <div><strong>Structure:</strong> Each file becomes a sector, with columns as subcategories</div>
                  </div>
                </AlertDescription>
              </Alert>

              <FileBasedImportSelector
                onImportFiles={handleFileImport}
                isImporting={fileImporting}
              />

              <ServiceImportProgress
                isImporting={fileImporting}
                progress={fileProgress.progress}
                stage={fileProgress.stage}
                message={fileProgress.message}
                error={fileProgress.error}
                completed={fileProgress.completed}
                operation="File Import"
                onCancel={handleFileCancel}
              />
            </TabsContent>

            <TabsContent value="bucket-import" className="space-y-4">
              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div><strong>Bucket Import:</strong> Import all Excel files from the storage bucket</div>
                    <div><strong>Structure:</strong> service-data/ → sectors → Excel files → categories → services</div>
                    <div><strong>Processing:</strong> All files are processed and saved to the database</div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Button
                  onClick={handleStorageImport}
                  disabled={storageImporting}
                  className="w-full"
                  size="lg"
                >
                  {storageImporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Importing from Storage...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Import All Files from Bucket
                    </>
                  )}
                </Button>

                <ServiceImportProgress
                  isImporting={storageImporting}
                  progress={storageProgress.progress}
                  stage={storageProgress.stage}
                  message={storageProgress.message}
                  error={storageProgress.error}
                  completed={storageProgress.completed}
                  operation="Storage Import"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
