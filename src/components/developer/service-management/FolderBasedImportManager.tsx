
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Upload, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { importFromFolderStructure, importParsedDataToDatabase } from '@/lib/services/folderBasedImportService';

interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
}

export function FolderBasedImportManager() {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResults, setImportResults] = useState<{
    success: boolean;
    message: string;
    totalServices?: number;
  } | null>(null);

  const handleFolderImport = async () => {
    try {
      setIsImporting(true);
      setImportResults(null);
      
      // Step 1: Parse Excel files from folder structure
      const parsedData = await importFromFolderStructure(
        'work-order-files',
        setImportProgress
      );

      if (parsedData.length === 0) {
        setImportResults({
          success: false,
          message: 'No service data found in bucket folders. Please check your folder structure and Excel files.'
        });
        return;
      }

      // Step 2: Import to database
      await importParsedDataToDatabase(parsedData, setImportProgress);

      setImportResults({
        success: true,
        message: `Successfully imported ${parsedData.length} services from folder structure!`,
        totalServices: parsedData.length
      });

    } catch (error) {
      console.error('Import failed:', error);
      setImportResults({
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsImporting(false);
      setImportProgress(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FolderOpen className="h-5 w-5" />
          <span>Folder-Based Service Import</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p className="mb-2">Import services from the organized folder structure in your bucket:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Automotive/</strong> folder contains Excel files like Ignition.xlsx, Fuel.xlsx</li>
            <li><strong>Marine/</strong> folder contains category-specific Excel files</li>
            <li><strong>LawnCare/</strong> folder contains category-specific Excel files</li>
            <li>Each Excel file: Row 1 = subcategories, Row 2+ = job tasks</li>
          </ul>
        </div>

        {importProgress && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {importProgress.stage === 'scan' && 'Scanning Folders'}
                {importProgress.stage === 'process' && 'Processing Excel Files'}
                {importProgress.stage === 'database' && 'Importing to Database'}
                {importProgress.stage === 'complete' && 'Import Complete'}
              </span>
              <Badge variant="outline">{Math.round(importProgress.progress)}%</Badge>
            </div>
            <Progress value={importProgress.progress} className="w-full" />
            <p className="text-xs text-gray-500">{importProgress.message}</p>
          </div>
        )}

        {importResults && (
          <Alert className={importResults.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-center space-x-2">
              {importResults.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={importResults.success ? "text-green-800" : "text-red-800"}>
                {importResults.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="flex space-x-2">
          <Button 
            onClick={handleFolderImport}
            disabled={isImporting}
            className="flex items-center space-x-2"
          >
            {isImporting ? (
              <Database className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>{isImporting ? 'Importing...' : 'Import from Folders'}</span>
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Safe Import:</strong> Existing data will be preserved. Only new sectors, categories, and services will be added.</p>
        </div>
      </CardContent>
    </Card>
  );
}
