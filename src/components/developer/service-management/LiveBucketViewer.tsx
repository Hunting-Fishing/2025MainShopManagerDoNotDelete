
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { bucketViewerService } from '@/lib/services/bucketViewerService';
import { Folder, FileText, RefreshCw, Eye, EyeOff } from 'lucide-react';
import type { StorageFile, SectorFiles } from '@/lib/services/types';

export function LiveBucketViewer() {
  const [bucketInfo, setBucketInfo] = useState<{
    exists: boolean;
    files: StorageFile[];
    folders: { name: string; path: string; lastModified?: Date }[];
  }>({ exists: false, files: [], folders: [] });
  const [sectorFiles, setSectorFiles] = useState<SectorFiles[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBucketInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Refreshing bucket info...');
      const info = await bucketViewerService.getBucketInfo();
      setBucketInfo(info);
      
      if (info.exists) {
        const sectors = await bucketViewerService.getAllSectorFiles();
        setSectorFiles(sectors);
        console.log('Loaded sector files:', sectors);
      }
    } catch (err) {
      console.error('Error refreshing bucket info:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bucket info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBucketInfo();
  }, []);

  const totalExcelFiles = sectorFiles.reduce((acc, sector) => acc + sector.totalFiles, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Folder className="h-5 w-5" />
            <span>Live Storage Bucket View</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshBucketInfo}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {!bucketInfo.exists ? (
          <div className="text-center py-8 text-gray-500">
            <Folder className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No service-data bucket found</p>
            <p className="text-sm">Upload Excel files to create the bucket</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Folder className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-800">{bucketInfo.folders.length}</div>
                <div className="text-sm text-blue-600">Sectors</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-800">{totalExcelFiles}</div>
                <div className="text-sm text-green-600">Excel Files</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {bucketInfo.exists ? 'Connected' : 'Not Found'}
                </Badge>
                <div className="text-sm text-purple-600 mt-1">Bucket Status</div>
              </div>
            </div>

            {showDetails && sectorFiles.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-4">Sector Details</h4>
                <div className="space-y-3">
                  {sectorFiles.map((sector, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium flex items-center">
                          <Folder className="h-4 w-4 mr-2 text-blue-500" />
                          {sector.sectorName}
                        </h5>
                        <Badge variant="secondary">{sector.totalFiles} files</Badge>
                      </div>
                      {showDetails && (
                        <div className="ml-6 space-y-1">
                          {sector.excelFiles.map((file, fileIndex) => (
                            <div key={fileIndex} className="text-sm text-gray-600 flex items-center">
                              <FileText className="h-3 w-3 mr-2" />
                              {file.name}
                              {file.size && (
                                <span className="ml-2 text-xs text-gray-400">
                                  ({Math.round(file.size / 1024)} KB)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
