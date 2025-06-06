
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, FileText, RefreshCw, Database, AlertCircle } from 'lucide-react';
import { bucketViewerService } from '@/lib/services/bucketViewerService';
import type { SectorFiles } from '@/lib/services/types';

export function LiveBucketViewer() {
  const [sectorFiles, setSectorFiles] = useState<SectorFiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bucketStatus, setBucketStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setBucketStatus('checking');
      
      console.log('Loading bucket data...');
      const data = await bucketViewerService.getAllSectorFiles();
      console.log('Loaded sector files:', data);
      
      setSectorFiles(data);
      setBucketStatus('connected');
    } catch (err) {
      console.error('Error loading bucket data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setBucketStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalFolders = sectorFiles.length;
  const totalExcelFiles = sectorFiles.reduce((sum, sector) => sum + sector.totalFiles, 0);

  const getStatusColor = () => {
    switch (bucketStatus) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusText = () => {
    switch (bucketStatus) {
      case 'connected': return 'Connected';
      case 'error': return 'Error';
      default: return 'Checking...';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Live Storage Browser
        </CardTitle>
        <CardDescription>
          Real-time view of service import storage bucket contents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{totalFolders}</div>
                <div className="text-xs text-gray-500">Sector Folders</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{totalExcelFiles}</div>
                <div className="text-xs text-gray-500">Excel Files</div>
              </div>
            </div>
          </div>

          {sectorFiles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Available Sectors:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {sectorFiles.map((sector) => (
                  <div 
                    key={sector.sectorName}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                  >
                    <span className="text-sm font-medium">{sector.sectorName}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {sector.totalFiles} files
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && sectorFiles.length === 0 && !error && (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">No sector folders found</div>
              <div className="text-xs">Upload Excel files organized in sector folders to get started</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
