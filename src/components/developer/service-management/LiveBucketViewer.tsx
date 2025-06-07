
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, Folder, FileText, RefreshCw, Eye, Calendar, HardDrive } from 'lucide-react';
import { bucketViewerService } from '@/lib/services/bucketViewerService';
import type { SectorFiles, StorageFile } from '@/types/service';

export function LiveBucketViewer() {
  const [isLoading, setIsLoading] = useState(true);
  const [sectorFiles, setSectorFiles] = useState<SectorFiles[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadBucketStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadBucketStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadBucketStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await bucketViewerService.getAllSectorFiles();
      setSectorFiles(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error loading bucket status:', err);
      setError('Failed to load live bucket status');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSectorExpansion = (sectorName: string) => {
    const newExpanded = new Set(expandedSectors);
    if (newExpanded.has(sectorName)) {
      newExpanded.delete(sectorName);
    } else {
      newExpanded.add(sectorName);
    }
    setExpandedSectors(newExpanded);
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Unknown date';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const totalFiles = sectorFiles.reduce((acc, sector) => acc + sector.totalFiles, 0);
  const totalSize = sectorFiles.reduce((acc, sector) => 
    acc + sector.excelFiles.reduce((fileAcc, file) => fileAcc + (file.size || 0), 0), 0);

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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Last updated: {formatDate(lastRefresh)}
        </div>
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
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Folder className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-semibold">{sectorFiles.length}</div>
                  <div className="text-sm text-gray-600">Sectors</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-semibold">{totalFiles}</div>
                  <div className="text-sm text-gray-600">Total Files</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <HardDrive className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-semibold">{formatFileSize(totalSize)}</div>
                  <div className="text-sm text-gray-600">Total Size</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                <Eye className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-semibold">Live</div>
                  <div className="text-sm text-gray-600">Real-time Data</div>
                </div>
              </div>
            </div>

            {sectorFiles.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sector Details</h3>
                {sectorFiles.map((sector) => (
                  <div key={sector.sectorName} className="border rounded-lg overflow-hidden">
                    <div 
                      className="p-4 bg-gray-50 cursor-pointer flex items-center justify-between hover:bg-gray-100"
                      onClick={() => toggleSectorExpansion(sector.sectorName)}
                    >
                      <div className="flex items-center gap-3">
                        <Folder className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">{sector.sectorName}</div>
                          <div className="text-sm text-gray-600">
                            {sector.totalFiles} file{sector.totalFiles !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">{sector.totalFiles}</Badge>
                    </div>
                    
                    {expandedSectors.has(sector.sectorName) && (
                      <div className="p-4 border-t">
                        <div className="space-y-2">
                          {sector.excelFiles.map((file: StorageFile, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white border rounded">
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-green-600" />
                                <div>
                                  <div className="font-medium text-sm">{file.name}</div>
                                  <div className="text-xs text-gray-500">
                                    Size: {formatFileSize(file.size)} • 
                                    Modified: {formatDate(file.lastModified)}
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                Excel
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
