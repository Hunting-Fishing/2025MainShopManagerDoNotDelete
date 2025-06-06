
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, FolderOpen, Upload, Folder } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAllSectorFiles } from '@/lib/services';

interface ServiceBulkImportProps {
  onImport: () => void;
  disabled?: boolean;
}

interface SectorInfo {
  [sectorName: string]: Array<{
    name: string;
    path: string;
    size?: number;
    type?: string;
    lastModified?: string;
  }>;
}

export function ServiceBulkImport({ onImport, disabled = false }: ServiceBulkImportProps) {
  const [sectorFiles, setSectorFiles] = useState<SectorInfo>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStorageBucket = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const files = await getAllSectorFiles('service-imports');
        setSectorFiles(files);
        
        console.log('Found sector files:', files);
      } catch (err) {
        console.error("Error checking storage bucket:", err);
        setError("Failed to load service import files");
      } finally {
        setLoading(false);
      }
    };

    checkStorageBucket();
  }, []);

  const totalFiles = Object.values(sectorFiles).reduce((total, files) => total + files.length, 0);
  const sectorCount = Object.keys(sectorFiles).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Button 
          onClick={onImport} 
          disabled={disabled || loading || totalFiles === 0} 
          className="flex items-center"
        >
          <Upload className="h-4 w-4 mr-2" />
          Import Services from Storage
        </Button>
        
        <p className="text-xs text-muted-foreground">
          {loading ? 'Checking storage bucket...' : 
            totalFiles === 0 ? 'No Excel files found in sector folders' :
            `Found ${totalFiles} Excel file(s) across ${sectorCount} sector(s)`}
        </p>
      </div>

      {!loading && sectorCount > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Folder className="h-4 w-4 mr-2" />
              Available Sectors
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {Object.entries(sectorFiles).map(([sectorName, files]) => (
                <div key={sectorName} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded text-sm">
                  <span className="font-medium">{sectorName}</span>
                  <span className="text-gray-500">{files.length} file(s)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && totalFiles === 0 && (
        <Alert variant="warning" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please ensure the "service-imports" bucket contains sector folders (e.g., "Automotive", "Lawn-Care") with Excel files inside each folder.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
