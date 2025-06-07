
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { bucketViewerService } from '@/lib/services/bucketViewerService';
import { Database, RefreshCw, FileText, Folder, Info } from 'lucide-react';
import type { SectorFiles } from '@/types/service';

export function LiveBucketViewer() {
  const [sectorFiles, setSectorFiles] = useState<SectorFiles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadBucketData = async () => {
    setIsLoading(true);
    try {
      const data = await bucketViewerService.getAllSectorFiles();
      setSectorFiles(data);
      setLastRefresh(new Date());
      console.log('LiveBucketViewer: Loaded sector files', data);
    } catch (error) {
      console.error('LiveBucketViewer: Error loading bucket data:', error);
      setSectorFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBucketData();
  }, []);

  const totalFiles = sectorFiles.reduce((acc, sector) => acc + sector.totalFiles, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Live Storage Bucket Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              {sectorFiles.length} Sectors
            </Badge>
            <Badge variant="outline">
              {totalFiles} Total Files
            </Badge>
            <Badge variant="secondary">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadBucketData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading bucket data...</p>
            </div>
          </div>
        ) : sectorFiles.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div><strong>Storage Status:</strong> No Excel files found in service-data bucket</div>
                <div><strong>Expected Structure:</strong></div>
                <div className="ml-4 space-y-1 text-sm font-mono">
                  <div>📁 service-data/</div>
                  <div className="ml-4">📁 automotive/</div>
                  <div className="ml-8">📄 brake-services.xlsx</div>
                  <div className="ml-8">📄 engine-services.xlsx</div>
                  <div className="ml-8">📄 ...</div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {sectorFiles.map((sector) => (
              <div key={sector.sectorName} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{sector.sectorName}</span>
                    <Badge variant="secondary" className="text-xs">
                      {sector.totalFiles} files
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {sector.excelFiles.slice(0, 6).map((file) => (
                    <div key={file.name} className="flex items-center gap-2 text-sm">
                      <FileText className="h-3 w-3 text-green-600" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size || 0 / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  ))}
                  {sector.excelFiles.length > 6 && (
                    <div className="text-xs text-muted-foreground">
                      +{sector.excelFiles.length - 6} more files...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div><strong>Bucket:</strong> service-data</div>
              <div><strong>File Processing:</strong> Rows 2-1000 in each column contain services</div>
              <div className="text-xs text-muted-foreground">
                Live view updates automatically when files are added to storage
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
