
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUploader } from '@/components/shared/FileUploader';
import { StorageFileBrowser } from './StorageFileBrowser';
import { ServiceImportProgress } from './ServiceImportProgress';
import { importFromStorage } from '@/lib/services/storageImportService';
import { importServicesInBatches } from '@/lib/services/batchServiceImporter';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Database, AlertCircle, RefreshCw } from 'lucide-react';
import { useServiceSectors } from '@/hooks/useServiceCategories';

export function ServiceHierarchyBrowser() {
  const { sectors, loading, error, refetch } = useServiceSectors();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedStorageFile, setSelectedStorageFile] = useState<string>('');
  
  // Import progress state
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStage, setImportStage] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importCompleted, setImportCompleted] = useState(false);
  const [importController, setImportController] = useState<AbortController | null>(null);

  const resetImportState = () => {
    setIsImporting(false);
    setImportProgress(0);
    setImportStage('');
    setImportMessage('');
    setImportError(null);
    setImportCompleted(false);
    setImportController(null);
  };

  const handleCancelImport = () => {
    if (importController) {
      importController.abort();
      resetImportState();
    }
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return;

    const file = selectedFiles[0];
    resetImportState();
    setIsImporting(true);

    const controller = new AbortController();
    setImportController(controller);

    try {
      // Upload to storage first
      setImportStage('upload');
      setImportMessage('Uploading file to storage...');
      setImportProgress(5);

      const fileName = `import-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('service-imports')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      setImportProgress(10);
      setImportMessage('File uploaded successfully. Processing...');

      // Parse the file from storage
      const sheetsData = await importFromStorage('service-imports', fileName, (progress) => {
        setImportStage(progress.stage);
        setImportProgress(Math.min(progress.progress, 70)); // Reserve 70-100 for database operations
        setImportMessage(progress.message);
      });

      // Import services in batches
      await importServicesInBatches(sheetsData, (progress) => {
        setImportStage(progress.stage);
        setImportProgress(70 + (progress.progress * 0.3)); // Map 0-100 to 70-100
        setImportMessage(progress.message);
      }, controller.signal);

      setImportCompleted(true);
      setImportProgress(100);
      setImportMessage('Import completed successfully!');
      
      // Refresh the service data
      refetch();

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setImportMessage('Import cancelled by user');
      } else {
        console.error('Import failed:', error);
        setImportError(error instanceof Error ? error.message : 'Import failed');
      }
    } finally {
      setIsImporting(false);
      setImportController(null);
    }
  };

  const handleStorageFileImport = async () => {
    if (!selectedStorageFile) return;

    resetImportState();
    setIsImporting(true);

    const controller = new AbortController();
    setImportController(controller);

    try {
      // Parse the file from storage
      const sheetsData = await importFromStorage('service-imports', selectedStorageFile, (progress) => {
        setImportStage(progress.stage);
        setImportProgress(Math.min(progress.progress, 70)); // Reserve 70-100 for database operations
        setImportMessage(progress.message);
      });

      // Import services in batches
      await importServicesInBatches(sheetsData, (progress) => {
        setImportStage(progress.stage);
        setImportProgress(70 + (progress.progress * 0.3)); // Map 0-100 to 70-100
        setImportMessage(progress.message);
      }, controller.signal);

      setImportCompleted(true);
      setImportProgress(100);
      setImportMessage('Import completed successfully!');
      
      // Refresh the service data
      refetch();

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setImportMessage('Import cancelled by user');
      } else {
        console.error('Import failed:', error);
        setImportError(error instanceof Error ? error.message : 'Import failed');
      }
    } finally {
      setIsImporting(false);
      setImportController(null);
    }
  };

  const handleCloseImportDialog = () => {
    if (isImporting) {
      handleCancelImport();
    }
    setImportDialogOpen(false);
    resetImportState();
    setSelectedFiles([]);
    setSelectedStorageFile('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading service hierarchy...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load service hierarchy: {error}
        </AlertDescription>
      </Alert>
    );
  }

  const totalCategories = sectors.reduce((acc, sector) => acc + sector.categories.length, 0);
  const totalSubcategories = sectors.reduce((acc, sector) => 
    acc + sector.categories.reduce((catAcc, category) => catAcc + category.subcategories.length, 0), 0);
  const totalServices = sectors.reduce((acc, sector) => 
    acc + sector.categories.reduce((catAcc, category) => 
      catAcc + category.subcategories.reduce((subAcc, subcategory) => 
        subAcc + subcategory.jobs.length, 0), 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Service Hierarchy</h2>
          <p className="text-muted-foreground">
            Browse and manage service sectors, categories, and jobs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import Services
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sectors.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Subcategories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubcategories}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
          </CardContent>
        </Card>
      </div>

      {/* Service Hierarchy Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Service Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sectors.map((sector) => (
              <div key={sector.id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{sector.name}</h3>
                <div className="space-y-3">
                  {sector.categories.map((category) => (
                    <div key={category.id} className="ml-4 border-l-2 border-gray-200 pl-4">
                      <h4 className="font-medium text-base mb-1">{category.name}</h4>
                      <div className="space-y-2">
                        {category.subcategories.map((subcategory) => (
                          <div key={subcategory.id} className="ml-4">
                            <h5 className="font-medium text-sm text-gray-700 mb-1">
                              {subcategory.name} ({subcategory.jobs.length} services)
                            </h5>
                            <div className="ml-4 text-xs text-gray-500">
                              {subcategory.jobs.slice(0, 3).map(job => job.name).join(', ')}
                              {subcategory.jobs.length > 3 && ` ... and ${subcategory.jobs.length - 3} more`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Import Services</DialogTitle>
          </DialogHeader>
          
          <ServiceImportProgress
            isImporting={isImporting}
            progress={importProgress}
            stage={importStage}
            message={importMessage}
            onCancel={handleCancelImport}
            error={importError}
            completed={importCompleted}
          />

          {!isImporting && !importCompleted && (
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload New File</TabsTrigger>
                <TabsTrigger value="storage">From Storage</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4">
                <FileUploader
                  onFilesSelected={setSelectedFiles}
                  acceptedFileTypes={['.xlsx', '.xls', '.csv']}
                  maxFiles={1}
                  currentFiles={selectedFiles}
                />
                <Button 
                  onClick={handleFileUpload}
                  disabled={selectedFiles.length === 0}
                  className="w-full"
                >
                  Upload and Import
                </Button>
              </TabsContent>
              
              <TabsContent value="storage" className="space-y-4">
                <StorageFileBrowser
                  bucketName="service-imports"
                  onFileSelect={setSelectedStorageFile}
                />
                <Button 
                  onClick={handleStorageFileImport}
                  disabled={!selectedStorageFile}
                  className="w-full"
                >
                  Import from Storage
                </Button>
              </TabsContent>
            </Tabs>
          )}

          {importCompleted && (
            <div className="flex justify-end gap-2">
              <Button onClick={handleCloseImportDialog}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
