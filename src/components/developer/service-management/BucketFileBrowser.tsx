
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Folder, FileText, Download, Database } from 'lucide-react';
import { bucketViewerService } from '@/lib/services/bucketViewerService';
import type { SectorFiles, StorageFile } from '@/types/service';

interface BucketFileBrowserProps {
  onImportSelected: (selectedData: { sectorName: string; files: StorageFile[] }[]) => Promise<void>;
  isImporting: boolean;
}

export function BucketFileBrowser({ onImportSelected, isImporting }: BucketFileBrowserProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [sectorFiles, setSectorFiles] = useState<SectorFiles[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBucketFiles();
  }, []);

  const loadBucketFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await bucketViewerService.getAllSectorFiles();
      setSectorFiles(data);
    } catch (err) {
      console.error('Error loading bucket files:', err);
      setError('Failed to load bucket files');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSectorSelection = (sectorName: string) => {
    const newSelectedSectors = new Set(selectedSectors);
    const newSelectedFiles = new Set(selectedFiles);
    
    if (newSelectedSectors.has(sectorName)) {
      newSelectedSectors.delete(sectorName);
      // Remove all files from this sector
      const sector = sectorFiles.find(s => s.sectorName === sectorName);
      sector?.excelFiles.forEach(file => {
        newSelectedFiles.delete(`${sectorName}/${file.name}`);
      });
    } else {
      newSelectedSectors.add(sectorName);
      // Add all files from this sector
      const sector = sectorFiles.find(s => s.sectorName === sectorName);
      sector?.excelFiles.forEach(file => {
        newSelectedFiles.add(`${sectorName}/${file.name}`);
      });
    }
    
    setSelectedSectors(newSelectedSectors);
    setSelectedFiles(newSelectedFiles);
  };

  const toggleFileSelection = (sectorName: string, fileName: string) => {
    const fileKey = `${sectorName}/${fileName}`;
    const newSelectedFiles = new Set(selectedFiles);
    const newSelectedSectors = new Set(selectedSectors);
    
    if (newSelectedFiles.has(fileKey)) {
      newSelectedFiles.delete(fileKey);
      // Check if all files in sector are deselected
      const sector = sectorFiles.find(s => s.sectorName === sectorName);
      const allSectorFiles = sector?.excelFiles.map(f => `${sectorName}/${f.name}`) || [];
      const hasSelectedInSector = allSectorFiles.some(f => newSelectedFiles.has(f));
      if (!hasSelectedInSector) {
        newSelectedSectors.delete(sectorName);
      }
    } else {
      newSelectedFiles.add(fileKey);
      // Check if all files in sector are selected
      const sector = sectorFiles.find(s => s.sectorName === sectorName);
      const allSectorFiles = sector?.excelFiles.map(f => `${sectorName}/${f.name}`) || [];
      const allSelected = allSectorFiles.every(f => newSelectedFiles.has(f) || f === fileKey);
      if (allSelected) {
        newSelectedSectors.add(sectorName);
      }
    }
    
    setSelectedFiles(newSelectedFiles);
    setSelectedSectors(newSelectedSectors);
  };

  const handleImport = async () => {
    const selectedData = sectorFiles
      .map(sector => ({
        sectorName: sector.sectorName,
        files: sector.excelFiles.filter(file => 
          selectedFiles.has(`${sector.sectorName}/${file.name}`)
        )
      }))
      .filter(sector => sector.files.length > 0);

    if (selectedData.length > 0) {
      await onImportSelected(selectedData);
    }
  };

  const selectedCount = selectedFiles.size;
  const totalFiles = sectorFiles.reduce((acc, sector) => acc + sector.totalFiles, 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading bucket files...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Select Files to Import
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedCount} of {totalFiles} files selected
          </div>
          <Button
            onClick={handleImport}
            disabled={selectedCount === 0 || isImporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isImporting ? 'Importing...' : `Import Selected (${selectedCount})`}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sectorFiles.length > 0 ? (
          <div className="space-y-4">
            {sectorFiles.map((sector) => (
              <div key={sector.sectorName} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Checkbox
                    checked={selectedSectors.has(sector.sectorName)}
                    onCheckedChange={() => toggleSectorSelection(sector.sectorName)}
                  />
                  <Folder className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium">{sector.sectorName}</div>
                    <div className="text-sm text-gray-600">
                      {sector.totalFiles} file{sector.totalFiles !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <Badge variant="secondary">{sector.totalFiles}</Badge>
                </div>
                
                <div className="ml-6 space-y-2">
                  {sector.excelFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 border rounded">
                      <Checkbox
                        checked={selectedFiles.has(`${sector.sectorName}/${file.name}`)}
                        onCheckedChange={() => toggleFileSelection(sector.sectorName, file.name)}
                      />
                      <FileText className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown size'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              No files found in storage bucket. Upload Excel files to the storage bucket first.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
