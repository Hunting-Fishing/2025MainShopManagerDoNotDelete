
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Upload, Folder } from 'lucide-react';
import { BucketFileBrowser } from './BucketFileBrowser';
import { FileBasedImportSelector } from './FileBasedImportSelector';
import { useFileBasedServiceImport } from '@/hooks/useFileBasedServiceImport';
import type { StorageFile } from '@/types/service';

interface StorageImportManagerProps {
  onImportComplete?: () => void;
  isImporting: boolean;
}

export function StorageImportManager({ onImportComplete, isImporting }: StorageImportManagerProps) {
  const { importSelectedFiles } = useFileBasedServiceImport();

  const handleBucketImport = async (selectedData: { sectorName: string; files: StorageFile[] }[]) => {
    try {
      console.log('Importing selected bucket data:', selectedData);
      
      // Process each sector's files
      for (const sectorData of selectedData) {
        console.log(`Processing sector: ${sectorData.sectorName} with ${sectorData.files.length} files`);
        
        // Here you would implement the actual import logic
        // This might involve calling your existing import services
        // with the selected files from storage
      }
      
      onImportComplete?.();
    } catch (error) {
      console.error('Error importing from bucket:', error);
      throw error;
    }
  };

  const handleFileUpload = async (files: File[]) => {
    try {
      await importSelectedFiles(files);
      onImportComplete?.();
    } catch (error) {
      console.error('Error importing files:', error);
      throw error;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Import Services from Storage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Database className="h-4 w-4" />
          <AlertDescription>
            Choose your import method below. Both methods will save services directly to the database.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="bucket" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bucket" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Import from Bucket
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bucket" className="mt-6 space-y-4">
            <Alert>
              <Folder className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div><strong>Bucket Import:</strong> Import all Excel files from the storage bucket</div>
                  <div><strong>Structure:</strong> service-data/ → sectors → Excel files → categories → services</div>
                  <div><strong>Processing:</strong> All files are processed and saved to the database</div>
                </div>
              </AlertDescription>
            </Alert>
            
            <BucketFileBrowser 
              onImportSelected={handleBucketImport}
              isImporting={isImporting}
            />
          </TabsContent>

          <TabsContent value="upload" className="mt-6 space-y-4">
            <Alert>
              <Upload className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div><strong>File Upload:</strong> Upload Excel files directly from your computer</div>
                  <div><strong>Processing:</strong> Each file becomes a service category</div>
                  <div><strong>Structure:</strong> Column A = subcategory, rows 2-1000 = services</div>
                </div>
              </AlertDescription>
            </Alert>
            
            <FileBasedImportSelector 
              onImportFiles={handleFileUpload}
              isImporting={isImporting}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
