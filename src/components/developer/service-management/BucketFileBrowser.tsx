
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Folder, FileText, RefreshCw, Download, Database } from 'lucide-react';
import { bucketViewerService } from '@/lib/services/bucketViewerService';
import type { SectorFiles, StorageFile } from '@/types/service';

interface BucketFileBrowserProps {
  onImportSelected: (selectedFiles: { sectorName: string; files: StorageFile[] }[]) => Promise<void>;
  isImporting: boolean;
}

export function BucketFileBrowser({ onImportSelected, isImporting }: BucketFileBrowserProps) {
  const [sectorFiles, setSectorFiles] = useState<SectorFiles[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());

  const loadBucketData = async () => {
    setIsLoading(true);
    try {
      const data = await bucketViewerService.getAllSectorFiles();
      setSectorFiles(data);
    } catch (error) {
      console.error('Error loading bucket data:', error);
      setSectorFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBucketData();
  }, []);

  const toggleSectorExpansion = (sectorName: string) => {
    const newExpanded = new Set(expandedSectors);
    if (newExpanded.has(sectorName)) {
      newExpanded.delete(sectorName);
    } else {
      newExpanded.add(sectorName);
    }
    setExpandedSectors(newExpanded);
  };

  const toggleSectorSelection = (sectorName: string) => {
    const newSelected = new Set(selectedSectors);
    const sector = sectorFiles.find(s => s.sectorName === sectorName);
    
    if (newSelected.has(sectorName)) {
      newSelected.delete(sectorName);
      // Remove all files from this sector
      const newSelectedFiles = new Set(selectedFiles);
      sector?.excelFiles.forEach(file => {
        newSelectedFiles.delete(`${sectorName}/${file.name}`);
      });
      setSelectedFiles(newSelectedFiles);
    } else {
      newSelected.add(sectorName);
      // Add all files from this sector
      const newSelectedFiles = new Set(selectedFiles);
      sector?.excelFiles.forEach(file => {
        newSelectedFiles.add(`${sectorName}/${file.name}`);
      });
      setSelectedFiles(newSelectedFiles);
    }
    setSelectedSectors(newSelected);
  };

  const toggleFileSelection = (sectorName: string, fileName: string) => {
    const fileKey = `${sectorName}/${fileName}`;
    const newSelectedFiles = new Set(selectedFiles);
    
    if (newSelectedFiles.has(fileKey)) {
      newSelectedFiles.delete(fileKey);
    } else {
      newSelectedFiles.add(fileKey);
    }
    setSelectedFiles(newSelectedFiles);

    // Update sector selection based on file selections
    const sector = sectorFiles.find(s => s.sectorName === sectorName);
    const sectorFileKeys = sector?.excelFiles.map(f => `${sectorName}/${f.name}`) || [];
    const selectedSectorFiles = sectorFileKeys.filter(key => newSelectedFiles.has(key));
    
    const newSelectedSectors = new Set(selectedSectors);
    if (selectedSectorFiles.length === sectorFileKeys.length && sectorFileKeys.length > 0) {
      newSelectedSectors.add(sectorName);
    } else {
      newSelectedSectors.delete(sectorName);
    }
    setSelectedSectors(newSelectedSectors);
  };

  const handleImportSelected = async () => {
    const selectedData: { sectorName: string; files: StorageFile[] }[] = [];
    
    sectorFiles.forEach(sector => {
      const selectedSectorFiles = sector.excelFiles.filter(file => 
        selectedFiles.has(`${sector.sectorName}/${file.name}`)
      );
      
      if (selectedSectorFiles.length > 0) {
        selectedData.push({
          sectorName: sector.sectorName,
          files: selectedSectorFiles
        });
      }
    });
    
    if (selectedData.length > 0) {
      await onImportSelected(selectedData);
    }
  };

  const getSelectedCount = () => {
    return selectedFiles.size;
  };

  const getTotalFiles = () => {
    return sectorFiles.reduce((acc, sector) => acc + sector.totalFiles, 0);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading bucket contents...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sectorFiles.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              No files found in storage bucket. Upload Excel files to the service-data bucket to get started.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Storage Bucket Browser
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {getSelectedCount()} of {getTotalFiles()} files selected
            </Badge>
            <Button variant="outline" size="sm" onClick={loadBucketData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Import Actions */}
        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">
            Select folders or individual files to import to the live database
          </div>
          <Button 
            onClick={handleImportSelected}
            disabled={getSelectedCount() === 0 || isImporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Import Selected ({getSelectedCount()})
          </Button>
        </div>

        {/* File Browser */}
        <div className="space-y-3">
          {sectorFiles.map((sector) => (
            <div key={sector.sectorName} className="border rounded-lg overflow-hidden">
              {/* Sector Header */}
              <div className="flex items-center justify-between p-3 bg-muted/50">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedSectors.has(sector.sectorName)}
                    onCheckedChange={() => toggleSectorSelection(sector.sectorName)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSectorExpansion(sector.sectorName)}
                    className="flex items-center gap-2 p-0"
                  >
                    <Folder className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{sector.sectorName}</span>
                  </Button>
                  <Badge variant="secondary">
                    {sector.totalFiles} files
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSectorExpansion(sector.sectorName)}
                >
                  {expandedSectors.has(sector.sectorName) ? '▼' : '▶'}
                </Button>
              </div>

              {/* Files List */}
              {expandedSectors.has(sector.sectorName) && (
                <div className="p-3 space-y-2">
                  {sector.excelFiles.map((file) => {
                    const fileKey = `${sector.sectorName}/${file.name}`;
                    const isSelected = selectedFiles.has(fileKey);
                    
                    return (
                      <div
                        key={file.name}
                        className={`flex items-center justify-between p-2 rounded border ${
                          isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleFileSelection(sector.sectorName, file.name)}
                          />
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">{file.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {((file.size || 0) / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div><strong>Selection Options:</strong></div>
              <div>• Check a folder to select all files in that sector</div>
              <div>• Expand folders to select individual files</div>
              <div>• Selected files will be imported to the live database</div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
