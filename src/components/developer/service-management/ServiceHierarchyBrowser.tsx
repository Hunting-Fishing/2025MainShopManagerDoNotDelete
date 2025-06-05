
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Table, TreePine } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ServiceHierarchyTree } from './ServiceHierarchyTree';
import { ServiceHierarchyExcelView } from './ServiceHierarchyExcelView';
import { StorageFileBrowser } from './StorageFileBrowser';
import { ServiceImportProgress } from './ServiceImportProgress';
import { batchImportServices } from '@/lib/services/batchServiceImporter';
import { importFromStorage } from '@/lib/services/storageImportService';
import { useServiceSectors } from '@/hooks/useServiceCategories';

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
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
  const { sectors, loading, error, refetch } = useServiceSectors();
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
        refetch();
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

  const handleSaveTableChanges = async (data: any) => {
    // This would implement the actual save logic
    // For now, just show a success message and refetch data
    console.log('Saving table changes:', data);
    await refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service hierarchy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error loading service hierarchy: {error}</p>
        <Button onClick={refetch} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

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
          <div className="flex items-center justify-between">
            <CardTitle>Actions</CardTitle>
            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'tree' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('tree')}
                  className="h-8"
                >
                  <TreePine className="h-4 w-4 mr-1" />
                  Tree
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="h-8"
                >
                  <Table className="h-4 w-4 mr-1" />
                  Table
                </Button>
              </div>
            </div>
          </div>
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

      {/* View Content */}
      {viewMode === 'tree' ? (
        <ServiceHierarchyTree />
      ) : (
        <ServiceHierarchyExcelView 
          sectors={sectors} 
          onSave={handleSaveTableChanges}
        />
      )}
    </div>
  );
}
