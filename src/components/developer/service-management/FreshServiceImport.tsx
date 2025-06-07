
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, RefreshCw, FolderOpen, Database, FileText } from 'lucide-react';
import { ServiceImportProgress } from './ServiceImportProgress';
import { FileBasedImportSelector } from './FileBasedImportSelector';
import { LiveBucketViewer } from './LiveBucketViewer';
import { useServiceManagement } from '@/hooks/useServiceManagement';
import { useFileBasedServiceImport } from '@/hooks/useFileBasedServiceImport';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function FreshServiceImport() {
  const [activeTab, setActiveTab] = useState('file-based');
  
  // Original folder-based import
  const {
    isImporting: isFolderImporting,
    importProgress: folderProgress,
    handleServiceImport,
    handleRefreshData
  } = useServiceManagement();

  // New file-based import
  const {
    isImporting: isFileImporting,
    importProgress: fileProgress,
    importSelectedFiles,
    handleCancel: handleFileCancel
  } = useFileBasedServiceImport();

  const isImporting = isFolderImporting || isFileImporting;
  const currentProgress = activeTab === 'file-based' ? fileProgress : folderProgress;

  return (
    <div className="space-y-6">
      {/* Live Bucket Viewer - Show files from storage bucket */}
      <LiveBucketViewer />

      <Card>
        <CardHeader>
          <CardTitle>Import Services from Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file-based" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                File Selection
              </TabsTrigger>
              <TabsTrigger value="folder-based" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Folder Structure
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file-based" className="space-y-4">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div><strong>Recommended Approach:</strong> Select individual Excel files from a single folder</div>
                    <div><strong>Storage Path:</strong> <code>service-data/automotive/</code></div>
                    <div className="text-xs text-muted-foreground">
                      Each Excel file becomes a service category with unlimited subcategories and services
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <FileBasedImportSelector
                onImportFiles={importSelectedFiles}
                isImporting={isFileImporting}
              />
            </TabsContent>

            <TabsContent value="folder-based" className="space-y-4">
              {/* Storage Route Information */}
              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div><strong>Storage Bucket:</strong> <code>service-data</code></div>
                    <div><strong>Expected Folder Structure:</strong></div>
                    <div className="ml-4 space-y-1 text-sm font-mono">
                      <div>📁 service-data/</div>
                      <div className="ml-4">📁 {`{sector-name}/`}</div>
                      <div className="ml-8">📄 {`{category}.xlsx`}</div>
                      <div className="ml-8">📄 {`{category}.xlsx`}</div>
                      <div className="ml-8">📄 ...</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Example: service-data/automotive/brake-services.xlsx
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleServiceImport}
                  disabled={isImporting}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {isFolderImporting ? 'Importing...' : 'Import All Sector Folders'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleRefreshData}
                  disabled={isImporting}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
              
              <div className="text-sm text-gray-600 flex items-center">
                <FolderOpen className="h-4 w-4 mr-2" />
                Automatically processes all Excel files in sector folders with unlimited services per subcategory
              </div>
            </TabsContent>
          </Tabs>

          <ServiceImportProgress
            isImporting={isImporting}
            progress={currentProgress.progress}
            stage={currentProgress.stage}
            message={currentProgress.message}
            error={currentProgress.error}
            completed={currentProgress.completed}
            operation="import"
            onCancel={activeTab === 'file-based' ? handleFileCancel : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
