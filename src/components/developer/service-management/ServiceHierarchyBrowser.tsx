
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ServiceHierarchyTree } from './ServiceHierarchyTree';
import { StorageFileBrowser } from './StorageFileBrowser';
import { ServiceImportProgress } from './ServiceImportProgress';
import { batchImportServices } from '@/lib/services/batchServiceImporter';
import { importFromStorage } from '@/lib/services/storageImportService';

interface ImportState {
  isImporting: boolean;
  progress: number;
  stage: string;
  message: string;
  error: string | null;
  completed: boolean;
}

export function ServiceHierarchyBrowser() {
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [importState, setImportState] = useState<ImportState>({
    isImporting: false,
    progress: 0,
    stage: '',
    message: '',
    error: null,
    completed: false
  });

  const handleImportFromStorage = async (fileName: string) => {
    if (!fileName) return;

    setImportState({
      isImporting: true,
      progress: 0,
      stage: 'starting',
      message: 'Preparing import...',
      error: null,
      completed: false
    });

    try {
      console.log(`Starting import from storage file: ${fileName}`);
      
      // Parse Excel file with progress tracking
      const sheetsData = await importFromStorage('service-imports', fileName, (progress) => {
        setImportState(prev => ({
          ...prev,
          progress: Math.min(progress.progress, 70), // Reserve 70-100% for database operations
          stage: progress.stage,
          message: progress.message
        }));
      });

      console.log(`Parsed ${sheetsData.length} sheets from Excel file`);

      if (sheetsData.length === 0) {
        throw new Error('No valid data found in the Excel file');
      }

      // Import services with batch processing and progress tracking
      await batchImportServices(sheetsData, (progress) => {
        setImportState(prev => ({
          ...prev,
          progress: 70 + (progress.progress * 0.3), // Map 0-100% to 70-100%
          stage: progress.stage,
          message: progress.message
        }));
      });

      setImportState(prev => ({
        ...prev,
        progress: 100,
        stage: 'complete',
        message: 'Import completed successfully!',
        completed: true
      }));

      // Refresh the service sectors data
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Import failed:', error);
      setImportState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Import failed',
        isImporting: false
      }));
    }
  };

  const handleCancelImport = () => {
    setImportState(prev => ({
      ...prev,
      isImporting: false,
      stage: 'cancelling',
      message: 'Import cancelled',
      error: null
    }));
  };

  return (
    <div className="space-y-6">
      {/* Import Progress */}
      <ServiceImportProgress
        isImporting={importState.isImporting}
        progress={importState.progress}
        stage={importState.stage}
        message={importState.message}
        error={importState.error}
        completed={importState.completed}
        onCancel={handleCancelImport}
      />

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => setShowFileBrowser(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import from Storage
          </Button>
        </CardContent>
      </Card>

      {/* Storage File Browser Dialog */}
      <Dialog open={showFileBrowser} onOpenChange={setShowFileBrowser}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Import Services from Storage</DialogTitle>
          </DialogHeader>
          <StorageFileBrowser
            bucketName="service-imports"
            onFileSelect={handleImportFromStorage}
          />
        </DialogContent>
      </Dialog>

      {/* Enhanced Service Hierarchy Tree */}
      <ServiceHierarchyTree />
    </div>
  );
}
