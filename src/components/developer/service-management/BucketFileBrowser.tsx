
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Folder, FileText, Download, AlertCircle, Loader2 } from 'lucide-react';
import { bucketViewerService } from '@/lib/services/bucketViewerService';
import type { StorageFile, SectorFiles } from '@/types/service';

interface BucketFileBrowserProps {
  onImportSelected: (selectedData: { sectorName: string; files: StorageFile[] }[]) => void;
  isImporting: boolean;
}

export function BucketFileBrowser({ onImportSelected, isImporting }: BucketFileBrowserProps) {
  const [sectorFiles, setSectorFiles] = useState<SectorFiles[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSectorFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading sector files from bucket...');
      
      const files = await bucketViewerService.getAllSectorFiles();
      console.log('Loaded sector files:', files);
      
      setSectorFiles(files);
      
      if (files.length === 0) {
        setError('No files found in the service-data bucket. Please upload Excel files organized in sector folders.');
      }
    } catch (err) {
      console.error('Error loading sector files:', err);
      setError('Failed to load files from storage bucket. Please check your bucket configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSectorFiles();
  }, []);

  const toggleSectorSelection = (sectorName: string) => {
    setSelectedFiles(prev => {
      const newSelection = { ...prev };
      if (newSelection[sectorName]) {
        delete newSelection[sectorName];
      } else {
        const sector = sectorFiles.find(s => s.sectorName === sectorName);
        if (sector) {
          newSelection[sectorName] = new Set(sector.excelFiles.map(f => f.name));
        }
      }
      return newSelection;
    });
  };

  const toggleFileSelection = (sectorName: string, fileName: string) => {
    setSelectedFiles(prev => {
      const newSelection = { ...prev };
      if (!newSelection[sectorName]) {
        newSelection[sectorName] = new Set();
      }
      
      if (newSelection[sectorName].has(fileName)) {
        newSelection[sectorName].delete(fileName);
        if (newSelection[sectorName].size === 0) {
          delete newSelection[sectorName];
        }
      } else {
        newSelection[sectorName].add(fileName);
      }
      
      return newSelection;
    });
  };

  const handleImport = () => {
    const selectedData = Object.entries(selectedFiles).map(([sectorName, fileNames]) => {
      const sector = sectorFiles.find(s => s.sectorName === sectorName);
      const files = sector?.excelFiles.filter(f => fileNames.has(f.name)) || [];
      return { sectorName, files };
    }).filter(item => item.files.length > 0);

    onImportSelected(selectedData);
  };

  const getTotalSelectedFiles = () => {
    return Object.values(selectedFiles).reduce((total, fileSet) => total + fileSet.size, 0);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading files from storage bucket...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <div className="mt-2">
                <Button onClick={loadSectorFiles} variant="outline" size="sm">
                  Retry Loading
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Storage Bucket Browser
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sectorFiles.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No sectors found in the storage bucket. Please upload Excel files organized in sector folders.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Found {sectorFiles.length} sector(s) with {sectorFiles.reduce((total, s) => total + s.totalFiles, 0)} Excel file(s)
                </span>
                <Button onClick={loadSectorFiles} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
              
              <div className="space-y-3">
                {sectorFiles.map((sector) => {
                  const isSelected = selectedFiles[sector.sectorName];
                  const allFilesSelected = isSelected && isSelected.size === sector.excelFiles.length;
                  
                  return (
                    <div key={sector.sectorName} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Checkbox
                          checked={allFilesSelected}
                          onCheckedChange={() => toggleSectorSelection(sector.sectorName)}
                        />
                        <Folder className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{sector.sectorName}</span>
                        <span className="text-sm text-muted-foreground">
                          ({sector.totalFiles} files)
                        </span>
                      </div>
                      
                      <div className="pl-6 space-y-2">
                        {sector.excelFiles.map((file) => (
                          <div key={file.name} className="flex items-center space-x-2">
                            <Checkbox
                              checked={selectedFiles[sector.sectorName]?.has(file.name) || false}
                              onCheckedChange={() => toggleFileSelection(sector.sectorName, file.name)}
                            />
                            <FileText className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{file.name}</span>
                            {file.size && (
                              <span className="text-xs text-muted-foreground">
                                ({Math.round(file.size / 1024)} KB)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {getTotalSelectedFiles() > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                Selected {getTotalSelectedFiles()} file(s) from {Object.keys(selectedFiles).length} sector(s)
              </span>
              <Button 
                onClick={handleImport}
                disabled={isImporting || getTotalSelectedFiles() === 0}
                className="flex items-center gap-2"
              >
                {isImporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isImporting ? 'Importing...' : 'Import Selected Files'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
