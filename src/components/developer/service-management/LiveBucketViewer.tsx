
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, Folder, FileText, RefreshCw } from 'lucide-react';
import { bucketViewerService } from '@/lib/services/bucketViewerService';
import type { SectorFiles } from '@/types/service';

export function LiveBucketViewer() {
  const [isLoading, setIsLoading] = useState(true);
  const [sectorFiles, setSectorFiles] = useState<SectorFiles[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBucketStatus();
  }, []);

  const loadBucketStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await bucketViewerService.getAllSectorFiles();
      setSectorFiles(data);
    } catch (err) {
      console.error('Error loading bucket status:', err);
      setError('Failed to load live bucket status');
    } finally {
      setIsLoading(false);
    }
  };

  const totalFiles = sectorFiles.reduce((acc, sector) => acc + sector.totalFiles, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Live Storage Bucket Status
          <Button
            onClick={loadBucketStatus}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Checking live bucket...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Sectors: </span>
                <Badge variant="secondary">{sectorFiles.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-sm">Total Files: </span>
                <Badge variant="secondary">{totalFiles}</Badge>
              </div>
            </div>

            {sectorFiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {sectorFiles.map((sector) => (
                  <div key={sector.sectorName} className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">{sector.sectorName}</div>
                    <div className="text-xs text-muted-foreground">
                      {sector.totalFiles} files
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No files found in storage bucket. Upload Excel files to start importing.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
