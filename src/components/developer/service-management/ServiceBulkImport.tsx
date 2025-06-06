
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FolderOpen, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { storageService } from '@/lib/services/unifiedStorageService';
import type { SectorFiles } from '@/lib/services/unifiedStorageService';

interface ServiceBulkImportProps {
  onImport: () => Promise<void>;
  disabled?: boolean;
}

export function ServiceBulkImport({ onImport, disabled = false }: ServiceBulkImportProps) {
  const [sectorFiles, setSectorFiles] = useState<SectorFiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSectorFiles();
  }, []);

  const loadSectorFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const files = await storageService.getAllSectorFiles('service-data');
      setSectorFiles(files);
      
      if (files.length === 0) {
        setError('No sector folders found in storage bucket');
      }
    } catch (err) {
      console.error('Error loading sector files:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sector files');
    } finally {
      setLoading(false);
    }
  };

  const totalFiles = sectorFiles.reduce((sum, sector) => sum + sector.totalFiles, 0);
  const totalSectors = sectorFiles.length;

  const handleImport = async () => {
    try {
      await onImport();
    } catch (error) {
      console.error('Import failed:', error);
      setError(error instanceof Error ? error.message : 'Import failed');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Loading storage information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Service Import
        </CardTitle>
        <CardDescription>
          Import services from Excel files organized in storage folders by sector
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Storage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Sectors</span>
            </div>
            <div className="text-2xl font-bold text-blue-700 mt-1">{totalSectors}</div>
            <div className="text-sm text-blue-600">Service sectors found</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Excel Files</span>
            </div>
            <div className="text-2xl font-bold text-green-700 mt-1">{totalFiles}</div>
            <div className="text-sm text-green-600">Ready for import</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Import Status</span>
            </div>
            <div className="text-2xl font-bold text-purple-700 mt-1">
              {totalFiles > 0 ? 'Ready' : 'No Files'}
            </div>
            <div className="text-sm text-purple-600">
              {totalFiles > 0 ? 'Files available for processing' : 'Upload Excel files to begin'}
            </div>
          </div>
        </div>

        {/* Sector Details */}
        {sectorFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Sector Breakdown:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sectorFiles.map((sector) => (
                <div 
                  key={sector.sectorName} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">{sector.sectorName}</span>
                  </div>
                  <Badge variant={sector.totalFiles > 0 ? "default" : "secondary"}>
                    {sector.totalFiles} files
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Import Actions */}
        <div className="pt-4 border-t">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleImport}
              disabled={disabled || totalFiles === 0}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import All Services ({totalFiles} files)
            </Button>
            
            <Button
              variant="outline"
              onClick={loadSectorFiles}
              disabled={loading}
            >
              Refresh Storage
            </Button>
          </div>
          
          {totalFiles === 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Upload Excel files to your storage bucket organized by sector folders to begin importing services.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
