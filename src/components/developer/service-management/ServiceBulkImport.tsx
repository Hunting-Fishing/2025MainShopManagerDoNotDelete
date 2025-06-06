
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Database, FileSpreadsheet, CheckCircle, AlertTriangle, Infinity } from 'lucide-react';
import { storageService } from '@/lib/services/unifiedStorageService';

interface ServiceBulkImportProps {
  onImport: () => void;
  disabled?: boolean;
}

export function ServiceBulkImport({ onImport, disabled }: ServiceBulkImportProps) {
  const [storageInfo, setStorageInfo] = useState<{
    sectors: number;
    totalFiles: number;
    estimatedServices: number;
    isLoading: boolean;
    error: string | null;
  }>({
    sectors: 0,
    totalFiles: 0,
    estimatedServices: 0,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const checkStorageInfo = async () => {
      try {
        setStorageInfo(prev => ({ ...prev, isLoading: true, error: null }));
        
        console.log('Checking storage for sector files...');
        const sectorFiles = await storageService.getAllSectorFiles('service-imports');
        
        const totalFiles = sectorFiles.reduce((sum, sector) => sum + sector.totalFiles, 0);
        const estimatedServices = totalFiles * 50; // Rough estimate of 50 services per file
        
        console.log(`Found ${sectorFiles.length} sectors with ${totalFiles} files`);
        
        setStorageInfo({
          sectors: sectorFiles.length,
          totalFiles: totalFiles,
          estimatedServices: estimatedServices,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error checking storage info:', error);
        setStorageInfo(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to check storage'
        }));
      }
    };

    checkStorageInfo();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Unlimited Service Import
        </CardTitle>
        <CardDescription>
          Import ALL services from Excel files in storage with no limits or restrictions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Storage Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">
                  {storageInfo.isLoading ? '...' : storageInfo.sectors} Sectors
                </div>
                <div className="text-sm text-gray-600">Ready to import</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">
                  {storageInfo.isLoading ? '...' : storageInfo.totalFiles} Files
                </div>
                <div className="text-sm text-gray-600">Excel documents</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
              <Infinity className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-medium">Unlimited</div>
                <div className="text-sm text-gray-600">No import limits</div>
              </div>
            </div>
          </div>

          {/* Import Capabilities */}
          <div className="space-y-2">
            <h4 className="font-medium">Import Capabilities</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Unlimited file processing
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                All sectors & categories
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Comprehensive error handling
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Progress tracking
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Data validation
              </Badge>
            </div>
          </div>

          {/* Estimated Import Info */}
          {!storageInfo.isLoading && storageInfo.totalFiles > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-700">
                <strong>Ready to import:</strong> Approximately {storageInfo.estimatedServices.toLocaleString()} services 
                from {storageInfo.totalFiles} Excel files across {storageInfo.sectors} sectors
              </div>
            </div>
          )}

          {/* Error Display */}
          {storageInfo.error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div className="text-sm text-red-700">{storageInfo.error}</div>
            </div>
          )}

          {/* Import Button */}
          <Button 
            onClick={onImport} 
            disabled={disabled || storageInfo.isLoading || storageInfo.totalFiles === 0}
            className="w-full"
            size="lg"
          >
            {storageInfo.isLoading 
              ? 'Checking Storage...' 
              : `Import All ${storageInfo.totalFiles} Files (No Limits)`
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
