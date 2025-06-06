
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, FileSpreadsheet, AlertCircle, RefreshCw } from 'lucide-react';
import { storageService, type SectorFiles } from '@/lib/services/unifiedStorageService';
import { useToast } from '@/hooks/use-toast';

interface ServiceBulkImportProps {
  onImport: () => void;
  disabled?: boolean;
}

export function ServiceBulkImport({ onImport, disabled = false }: ServiceBulkImportProps) {
  const [sectors, setSectors] = useState<SectorFiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadSectorData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use service-imports bucket instead of service-data
      const sectorFiles = await storageService.getAllSectorFiles('service-imports');
      
      if (sectorFiles.length === 0) {
        setError('No sector folders found in storage bucket. Please upload Excel files organized by sector.');
        setSectors([]);
        return;
      }
      
      console.log('Loaded sector files:', sectorFiles);
      setSectors(sectorFiles);
      
    } catch (err) {
      console.error('Error loading sector data:', err);
      setError('Failed to load sector data from storage');
      setSectors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSectorData();
  }, []);

  const handleRefresh = () => {
    loadSectorData();
  };

  const handleImport = () => {
    if (sectors.length === 0) {
      toast({
        title: "No Data Available",
        description: "Please upload sector files before importing",
        variant: "destructive",
      });
      return;
    }
    onImport();
  };

  const totalFiles = sectors.reduce((sum, sector) => sum + sector.totalFiles, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Loading Sector Data...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Storage Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Available Service Data
        </CardTitle>
        <CardDescription>
          Excel files found in the service-imports storage bucket, organized by sector
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{sectors.length}</div>
              <div className="text-sm text-blue-600">Sectors Found</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{totalFiles}</div>
              <div className="text-sm text-green-600">Excel Files Total</div>
            </div>
          </div>

          {/* Sector Details */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Sector Breakdown:</h4>
            <div className="grid gap-2">
              {sectors.map((sector) => (
                <div key={sector.sectorName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">{sector.sectorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                    <Badge variant="secondary">
                      {sector.totalFiles} files
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Import Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={handleImport}
              disabled={disabled || totalFiles === 0}
              className="flex-1"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Import All Service Data ({totalFiles} files)
            </Button>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {totalFiles === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  No Excel files found. Please upload .xlsx files to sector folders in the storage bucket.
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
