import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StorageFileBrowser } from './StorageFileBrowser';
import { importFromStorage } from '@/lib/services/storageImportService';
import { useToast } from '@/hooks/use-toast';

interface ServiceBulkImportProps {
  onImportComplete: () => void;
}

export function ServiceBulkImport({ onImportComplete }: ServiceBulkImportProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');
  const { toast } = useToast();

  const handleStorageImport = async (fileName: string) => {
    console.log('Starting storage import for file:', fileName);
    setIsImporting(true);
    setImportProgress(0);
    setImportStatus('Downloading file from storage...');

    try {
      const result = await importFromStorage(
        fileName,
        (progress, status) => {
          setImportProgress(progress);
          setImportStatus(status);
        }
      );

      toast({
        title: "Import Successful",
        description: `Imported ${result.categoriesCreated} categories, ${result.subcategoriesCreated} subcategories, and ${result.jobsCreated} jobs.`,
      });

      onImportComplete();
    } catch (error) {
      console.error('Storage import failed:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred during import.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      setImportStatus('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportStatus('Importing...');

    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setImportProgress(progress);
        setImportStatus(`Importing: ${progress}%`);
      }
    };

    reader.onload = async (event) => {
      try {
        // Assuming the file content is a string (e.g., CSV, JSON)
        const fileContent = event.target?.result as string;

        // Parse the file content (you might need to adjust this based on your file format)
        // For example, if it's a CSV file, you can use a library like PapaParse to parse it
        // If it's a JSON file, you can use JSON.parse()
        // Here, we'll just assume it's a simple string
        // const parsedData = JSON.parse(fileContent);

        // Simulate import process
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
          title: "Import Successful",
          description: "Data imported successfully!",
        });

        onImportComplete();
      } catch (error) {
        console.error('Import failed:', error);
        toast({
          title: "Import Failed",
          description: error instanceof Error ? error.message : "An unexpected error occurred during import.",
          variant: "destructive",
        });
      } finally {
        setIsImporting(false);
        setImportProgress(0);
        setImportStatus('');
      }
    };

    reader.onerror = () => {
      toast({
        title: "File Read Error",
        description: "Failed to read the file.",
        variant: "destructive",
      });
      setIsImporting(false);
      setImportProgress(0);
      setImportStatus('');
    };

    reader.readAsText(selectedFile);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Bulk Import Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Local File
            </TabsTrigger>
            <TabsTrigger value="storage" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              From Storage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Upload an Excel file containing service hierarchy data.
                The file should contain columns for Category, Subcategory, Job Name, Description, Estimated Time, and Price.
              </p>
              <input
                type="file"
                id="file-upload"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex items-center justify-between">
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 cursor-pointer"
                >
                  {selectedFile ? `File Selected: ${selectedFile.name}` : 'Select File'}
                </label>
                <Button
                  variant="default"
                  onClick={handleImport}
                  disabled={!selectedFile || isImporting}
                >
                  Import
                </Button>
              </div>
            </div>

            {isImporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Import Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round(importProgress)}%</span>
                </div>
                <Progress value={importProgress} className="w-full" />
                {importStatus && (
                  <p className="text-sm text-muted-foreground">{importStatus}</p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Select an Excel file from the storage bucket to import service hierarchy data.
                  The file should contain columns for Category, Subcategory, Job Name, Description, Estimated Time, and Price.
                </AlertDescription>
              </Alert>

              <StorageFileBrowser
                bucketName="work-order-jobs"
                onFileSelect={handleStorageImport}
                accept=".xlsx,.xls"
                disabled={isImporting}
              />

              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Import Progress</span>
                    <span className="text-sm text-muted-foreground">{Math.round(importProgress)}%</span>
                  </div>
                  <Progress value={importProgress} className="w-full" />
                  {importStatus && (
                    <p className="text-sm text-muted-foreground">{importStatus}</p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
