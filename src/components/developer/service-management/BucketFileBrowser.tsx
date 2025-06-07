
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Folder, FileText, Download } from 'lucide-react';
import { bucketViewerService } from '@/lib/services/bucketViewerService';
import type { SectorFiles, StorageFile } from '@/types/service';

interface BucketFileBrowserProps {
  onImportSelected: (selectedData: { sectorName: string; files: StorageFile[] }[]) => void;
  isImporting: boolean;
}

export function BucketFileBrowser({ onImportSelected, isImporting }: BucketFileBrowserProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [sectorFiles, setSectorFiles] = useState<SectorFiles[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBucketData();
  }, []);

  const loadBucketData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await bucketViewerService.getAllSectorFiles();
      setSectorFiles(data);
      
      if (data.length === 0) {
        setError('No files found in the service-data bucket. Please upload Excel files first.');
      }
    } catch (err) {
      console.error('Error loading bucket data:', err);
      setError('Failed to load bucket data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectorToggle = (sectorName: string, checked: boolean) => {
    const newSelectedSectors = new Set(selectedSectors);
    const newSelectedFiles = new Set(selectedFiles);
    
    if (checked) {
      newSelectedSectors.add(sectorName);
      // Add all files in this sector
      const sector = sectorFiles.find(s => s.sectorName === sectorName);
      sector?.excelFiles.forEach(file => {
        newSelectedFiles.add(`${sectorName}/${file.name}`);
      });
    } else {
      newSelectedSectors.delete(sectorName);
      // Remove all files in this sector
      const sector = sectorFiles.find(s => s.sectorName === sectorName);
      sector?.excelFiles.forEach(file => {
        newSelectedFiles.delete(`${sectorName}/${file.name}`);
      });
    }
    
    setSelectedSectors(newSelectedSectors);
    setSelectedFiles(newSelectedFiles);
  };

  const handleFileToggle = (sectorName: string, fileName: string, checked: boolean) => {
    const fileKey = `${sectorName}/${fileName}`;
    const newSelectedFiles = new Set(selectedFiles);
    
    if (checked) {
      newSelectedFiles.add(fileKey);
    } else {
      newSelectedFiles.delete(fileKey);
    }
    
    setSelectedFiles(newSelectedFiles);
    
    // Update sector selection based on file selection
    const sector = sectorFiles.find(s => s.sectorName === sectorName);
    if (sector) {
      const sectorFileKeys = sector.excelFiles.map(f => `${sectorName}/${f.name}`);
      const allSectorFilesSelected = sectorFileKeys.every(key => newSelectedFiles.has(key));
      
      const newSelectedSectors = new Set(selectedSectors);
      if (allSectorFilesSelected && sectorFileKeys.length > 0) {
        newSelectedSectors.add(sectorName);
      } else {
        newSelectedSectors.delete(sectorName);
      }
      setSelectedSectors(newSelectedSectors);
    }
  };

  const handleImport = () => {
    const selectedData: { sectorName: string; files: StorageFile[] }[] = [];
    
    sectorFiles.forEach(sector => {
      const sectorSelectedFiles = sector.excelFiles.filter(file => 
        selectedFiles.has(`${sector.sectorName}/${file.name}`)
      );
      
      if (sectorSelectedFiles.length > 0) {
        selectedData.push({
          sectorName: sector.sectorName,
          files: sectorSelectedFiles
        });
      }
    });
    
    if (selectedData.length > 0) {
      onImportSelected(selectedData);
    }
  };

  const getSelectedCount = () => {
    return selectedFiles.size;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading bucket contents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button onClick={loadBucketData} variant="outline" size="sm">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {sectorFiles.length} sectors found, {getSelectedCount()} files selected
        </div>
        <div className="flex gap-2">
          <Button onClick={loadBucketData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleImport}
            disabled={getSelectedCount() === 0 || isImporting}
            className="flex items-center gap-2"
          >
            {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
            Import Selected ({getSelectedCount()})
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {sectorFiles.map((sector) => (
          <Card key={sector.sectorName}>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`sector-${sector.sectorName}`}
                  checked={selectedSectors.has(sector.sectorName)}
                  onCheckedChange={(checked) => 
                    handleSectorToggle(sector.sectorName, checked as boolean)
                  }
                />
                <Folder className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-base">
                  {sector.sectorName}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  ({sector.totalFiles} files)
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {sector.excelFiles.map((file) => (
                  <div key={file.name} className="flex items-center space-x-2 p-2 border rounded">
                    <Checkbox
                      id={`file-${sector.sectorName}-${file.name}`}
                      checked={selectedFiles.has(`${sector.sectorName}/${file.name}`)}
                      onCheckedChange={(checked) => 
                        handleFileToggle(sector.sectorName, file.name, checked as boolean)
                      }
                    />
                    <FileText className="h-4 w-4 text-green-600" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown size'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sectorFiles.length === 0 && (
        <Alert>
          <AlertDescription>
            No Excel files found in the storage bucket. Please upload some Excel files to the service-data bucket first.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
