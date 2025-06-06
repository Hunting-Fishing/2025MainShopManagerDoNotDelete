
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ServiceImportProgress } from './ServiceImportProgress';
import { importServicesFromStorage } from '@/lib/services/folderBasedImportService';
import { Upload, FileText, AlertCircle, CheckCircle, Folder } from 'lucide-react';
import { useServiceSectors } from '@/hooks/useServiceCategories';

interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
  error?: string;
  completed?: boolean;
}

interface ServiceCounts {
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
}

interface StorageFileBrowserProps {
  bucketName: string;
  onFileSelect: (filePath: string) => void;
  selectedFiles: string[];
  disabled: boolean;
}

// Simple file browser component
function StorageFileBrowser({ bucketName, onFileSelect, selectedFiles, disabled }: StorageFileBrowserProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFiles = async () => {
    setLoading(true);
    try {
      // This would normally fetch from Supabase storage
      // For now, we'll show some example paths
      const exampleFiles = [
        'Automotive/services.xlsx',
        'HVAC/hvac-services.xlsx',
        'Plumbing/plumbing-services.xlsx',
        'Electrical/electrical-services.xlsx'
      ];
      setFiles(exampleFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadFiles();
  }, [bucketName]);

  if (loading) {
    return <div className="text-center py-4">Loading files...</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Folder className="h-4 w-4" />
        <span className="text-sm font-medium">Available Excel Files</span>
      </div>
      {files.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No Excel files found in the storage bucket. Upload files to the '{bucketName}' bucket first.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-2">
          {files.map((filePath) => {
            const isSelected = selectedFiles.includes(filePath);
            return (
              <div
                key={filePath}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !disabled && onFileSelect(filePath)}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{filePath}</span>
                  {isSelected && <CheckCircle className="h-4 w-4 text-blue-600 ml-auto" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function FolderBasedImportManager() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResults, setImportResults] = useState<ServiceCounts | null>(null);
  const { refetch } = useServiceSectors();

  const handleFileSelect = (filePath: string) => {
    setSelectedFiles(prev => {
      if (prev.includes(filePath)) {
        return prev.filter(f => f !== filePath);
      } else {
        return [...prev, filePath];
      }
    });
  };

  const handleImport = async () => {
    if (selectedFiles.length === 0) return;

    setIsImporting(true);
    setImportProgress(null);
    setImportResults(null);

    try {
      console.log('Starting import for files:', selectedFiles);
      
      let totalCounts: ServiceCounts = {
        sectors: 0,
        categories: 0,
        subcategories: 0,
        services: 0
      };

      for (let i = 0; i < selectedFiles.length; i++) {
        const filePath = selectedFiles[i];
        
        setImportProgress({
          stage: 'importing',
          progress: (i / selectedFiles.length) * 100,
          message: `Processing file ${i + 1}/${selectedFiles.length}: ${filePath}`
        });

        const counts = await importServicesFromStorage(
          'service-imports',
          filePath,
          (progress) => {
            setImportProgress({
              ...progress,
              progress: ((i / selectedFiles.length) * 100) + (progress.progress / selectedFiles.length)
            });
          }
        );

        totalCounts.sectors += counts.sectors;
        totalCounts.categories += counts.categories;
        totalCounts.subcategories += counts.subcategories;
        totalCounts.services += counts.services;
      }

      setImportProgress({
        stage: 'complete',
        progress: 100,
        message: 'Import completed successfully!',
        completed: true
      });

      setImportResults(totalCounts);
      await refetch();

    } catch (error) {
      console.error('Import failed:', error);
      setImportProgress({
        stage: 'error',
        progress: 0,
        message: 'Import failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setImportProgress(null);
    setImportResults(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Folder-Based Service Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This tool imports Excel files from storage and automatically assigns services to sectors based on the folder structure.
              Files in 'Automotive/' folder will be assigned to the 'Automotive' sector, etc.
            </AlertDescription>
          </Alert>

          <StorageFileBrowser
            bucketName="service-imports"
            onFileSelect={handleFileSelect}
            selectedFiles={selectedFiles}
            disabled={isImporting}
          />

          {selectedFiles.length > 0 && (
            <div className="flex gap-2">
              <Button 
                onClick={handleImport} 
                disabled={isImporting}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClear}
                disabled={isImporting}
              >
                Clear Selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {importProgress && (
        <ServiceImportProgress
          isImporting={isImporting}
          progress={importProgress.progress}
          stage={importProgress.stage}
          message={importProgress.message}
          error={importProgress.error}
          completed={importProgress.completed}
        />
      )}

      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{importResults.sectors}</div>
                <div className="text-sm text-gray-600">Sectors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{importResults.categories}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{importResults.subcategories}</div>
                <div className="text-sm text-gray-600">Subcategories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{importResults.services}</div>
                <div className="text-sm text-gray-600">Services</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
