
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Database, Upload, Trash2 } from 'lucide-react';
import { FileBasedImportSelector } from './FileBasedImportSelector';
import { FolderBasedImportManager } from './FolderBasedImportManager';
import { ServiceImportProgress } from './ServiceImportProgress';
import { useServiceManagement } from '@/hooks/useServiceManagement';

export function FreshServiceImport({ onImportComplete }: { onImportComplete?: () => void }) {
  const [activeTab, setActiveTab] = useState('folder');
  
  const {
    isImporting,
    isClearing,
    importProgress,
    handleServiceImport,
    importFromStorage,
    handleClearDatabase,
    handleCancel,
    handleRefreshData
  } = useServiceManagement();

  const handleImportComplete = async () => {
    await handleRefreshData();
    onImportComplete?.();
  };

  const handleFileImport = async (files: File[]) => {
    await importFromStorage(files);
    await handleImportComplete();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Service Data Import
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              onClick={handleRefreshData}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
            <Button
              onClick={handleClearDatabase}
              variant="destructive"
              size="sm"
              disabled={isImporting || isClearing}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isClearing ? 'Clearing...' : 'Clear Database'}
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="folder" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Storage Import
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                File Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="folder" className="space-y-4">
              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  Import services from organized folders in Supabase Storage. This method processes all sectors automatically.
                </AlertDescription>
              </Alert>
              <FolderBasedImportManager />
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              <Alert>
                <Upload className="h-4 w-4" />
                <AlertDescription>
                  Upload Excel files directly from your computer. Each file will be processed as a service category.
                </AlertDescription>
              </Alert>
              <FileBasedImportSelector 
                onImportFiles={handleFileImport}
                isImporting={isImporting}
              />
            </TabsContent>
          </Tabs>

          <ServiceImportProgress
            isImporting={isImporting || isClearing}
            progress={importProgress.progress}
            stage={importProgress.stage}
            message={importProgress.message}
            error={importProgress.error}
            completed={importProgress.completed}
            operation={isClearing ? 'Database Clear' : 'Service Import'}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
