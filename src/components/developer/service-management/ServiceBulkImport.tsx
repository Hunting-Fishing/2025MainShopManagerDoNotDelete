
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, FolderOpen, Upload, Folder, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { storageService, type SectorFiles } from '@/lib/services/unifiedStorageService';

interface ServiceBulkImportProps {
  onImport: () => void;
  disabled?: boolean;
}

export function ServiceBulkImport({ onImport, disabled = false }: ServiceBulkImportProps) {
  const [sectorFiles, setSectorFiles] = useState<SectorFiles>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bucketExists, setBucketExists] = useState(false);

  const checkStorageBucket = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Checking if service-imports bucket exists...');
      const exists = await storageService.checkBucketExists('service-imports');
      setBucketExists(exists);
      
      if (!exists) {
        setError('The "service-imports" bucket does not exist in Supabase Storage');
        setSectorFiles({});
        return;
      }

      console.log('Bucket exists, fetching sector files...');
      const files = await storageService.getAllSectorFiles('service-imports');
      setSectorFiles(files);
      
      console.log('Found sector files:', files);
    } catch (err) {
      console.error("Error checking storage bucket:", err);
      setError(err instanceof Error ? err.message : "Failed to load service import files");
      setBucketExists(false);
      setSectorFiles({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStorageBucket();
  }, []);

  const handleRefresh = () => {
    storageService.clearCacheForBucket('service-imports');
    checkStorageBucket();
  };

  const totalFiles = Object.values(sectorFiles).reduce((total, files) => total + files.length, 0);
  const sectorCount = Object.keys(sectorFiles).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Checking storage bucket...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Button 
            onClick={onImport} 
            disabled={disabled || !bucketExists || totalFiles === 0} 
            className="flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Services from Storage
          </Button>
          
          <p className="text-xs text-muted-foreground">
            {!bucketExists ? 'Bucket "service-imports" not found' :
             totalFiles === 0 ? 'No Excel files found in sector folders' :
             `Found ${totalFiles} Excel file(s) across ${sectorCount} sector(s)`}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {bucketExists && sectorCount > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Folder className="h-4 w-4 mr-2" />
              Available Sectors ({sectorCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {Object.entries(sectorFiles).map(([sectorName, files]) => (
                <div key={sectorName} className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded text-sm">
                  <span className="font-medium">{sectorName}</span>
                  <div className="text-right">
                    <span className="text-muted-foreground">{files.length} file(s)</span>
                    {files.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {files.map(f => f.name).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!bucketExists && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The "service-imports" bucket was not found in your Supabase Storage. 
            Please create the bucket and organize your Excel files in sector folders 
            (e.g., "Automotive", "Lawn-Care") before importing.
          </AlertDescription>
        </Alert>
      )}

      {bucketExists && totalFiles === 0 && (
        <Alert variant="warning" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The "service-imports" bucket exists but no Excel files were found. 
            Please ensure the bucket contains sector folders (e.g., "Automotive", "Lawn-Care") 
            with Excel (.xlsx or .xls) files inside each folder.
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
