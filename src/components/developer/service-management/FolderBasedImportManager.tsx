
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  FolderOpen, 
  Upload, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Trash2,
  AlertTriangle 
} from 'lucide-react';
import { 
  importFromFolderStructure, 
  importParsedDataToDatabase,
  clearServiceDatabase,
  getServiceCounts
} from '@/lib/services/folderBasedImportService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
}

interface ServiceCounts {
  sectors: number;
  categories: number;
  subcategories: number;
  jobs: number;
}

export function FolderBasedImportManager() {
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResults, setImportResults] = useState<{
    success: boolean;
    message: string;
    totalServices?: number;
  } | null>(null);
  const [serviceCounts, setServiceCounts] = useState<ServiceCounts>({
    sectors: 0,
    categories: 0,
    subcategories: 0,
    jobs: 0
  });

  // Load service counts on component mount
  useEffect(() => {
    loadServiceCounts();
  }, []);

  const loadServiceCounts = async () => {
    const counts = await getServiceCounts();
    setServiceCounts(counts);
  };

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

      // Reload counts after import
      await loadServiceCounts();

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

  const handleClearDatabase = async () => {
    try {
      setIsClearing(true);
      setImportResults(null);
      
      await clearServiceDatabase(setImportProgress);
      
      setImportResults({
        success: true,
        message: 'Database cleared successfully! All service data has been removed.'
      });

      // Reload counts after clearing
      await loadServiceCounts();

    } catch (error) {
      console.error('Clear database failed:', error);
      setImportResults({
        success: false,
        message: `Clear failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsClearing(false);
      setImportProgress(null);
    }
  };

  const totalRecords = serviceCounts.sectors + serviceCounts.categories + serviceCounts.subcategories + serviceCounts.jobs;
  const hasData = totalRecords > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FolderOpen className="h-5 w-5" />
          <span>Folder-Based Service Import</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Database Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Current Database Status</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-lg">{serviceCounts.sectors}</div>
              <div className="text-gray-600">Sectors</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">{serviceCounts.categories}</div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">{serviceCounts.subcategories}</div>
              <div className="text-gray-600">Subcategories</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">{serviceCounts.jobs}</div>
              <div className="text-gray-600">Services</div>
            </div>
          </div>
          <div className="mt-2 text-center text-sm text-gray-500">
            Total: {totalRecords.toLocaleString()} records
          </div>
        </div>

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
                {importProgress.stage === 'clear' && 'Clearing Database'}
                {importProgress.stage === 'complete' && 'Complete'}
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
            disabled={isImporting || isClearing}
            className="flex items-center space-x-2"
          >
            {isImporting ? (
              <Database className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>{isImporting ? 'Importing...' : 'Import from Folders'}</span>
          </Button>

          {hasData && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive"
                  disabled={isImporting || isClearing}
                  className="flex items-center space-x-2"
                >
                  {isClearing ? (
                    <Database className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span>{isClearing ? 'Clearing...' : 'Clear Database'}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>Clear All Service Data</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all service data from the database:
                    <div className="mt-3 p-3 bg-red-50 rounded">
                      <ul className="text-sm space-y-1">
                        <li>• {serviceCounts.sectors} Sectors</li>
                        <li>• {serviceCounts.categories} Categories</li>
                        <li>• {serviceCounts.subcategories} Subcategories</li>
                        <li>• {serviceCounts.jobs} Services</li>
                      </ul>
                      <div className="mt-2 font-medium">
                        Total: {totalRecords.toLocaleString()} records will be deleted
                      </div>
                    </div>
                    <div className="mt-3 text-red-600 font-medium">
                      This action cannot be undone.
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearDatabase}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Yes, Clear Database
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Safe Import:</strong> Existing data will be preserved. Only new sectors, categories, and services will be added.</p>
          {hasData && (
            <p className="mt-1"><strong>Clear Database:</strong> Removes all imported service data to start fresh.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
