
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, FolderOpen, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { bucketViewerService } from '@/lib/services/bucketViewerService';
import { getStorageBucketInfo } from '@/lib/services/storageUtils';

export function LiveBucketViewer() {
  const [bucketInfo, setBucketInfo] = useState<any>(null);
  const [sectorFiles, setSectorFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error' | null>(null);

  const testBucketConnection = async () => {
    setIsLoading(true);
    setError(null);
    setConnectionStatus('testing');
    
    try {
      console.log('Testing bucket connection...');
      
      // Test bucket existence and structure
      const info = await getStorageBucketInfo('service-data');
      setBucketInfo(info);
      
      console.log('Bucket info:', info);
      
      if (!info.exists) {
        setConnectionStatus('error');
        setError('Bucket "service-data" does not exist');
        return;
      }
      
      // Test sector files
      const sectors = await bucketViewerService.getAllSectorFiles();
      setSectorFiles(sectors);
      
      console.log('Sector files found:', sectors);
      
      if (sectors.length === 0) {
        setConnectionStatus('error');
        setError('No sector folders found. Files need to be organized in folders by sector name.');
      } else {
        setConnectionStatus('success');
      }
      
    } catch (err: any) {
      console.error('Bucket connection test failed:', err);
      setConnectionStatus('error');
      setError(err.message || 'Failed to connect to storage bucket');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testBucketConnection();
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'Testing bucket connection...';
      case 'success':
        return `Connected successfully! Found ${sectorFiles.length} sector(s)`;
      case 'error':
        return error || 'Connection failed';
      default:
        return 'Ready to test connection';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Live Storage Bucket Viewer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <Alert variant={connectionStatus === 'error' ? 'destructive' : 'default'}>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <AlertDescription className="flex-1">
              <div className="font-medium">Connection Status</div>
              <div className="text-sm mt-1">{getStatusMessage()}</div>
            </AlertDescription>
          </div>
        </Alert>

        {/* Bucket Information */}
        {bucketInfo && (
          <div className="space-y-3">
            <h3 className="font-semibold">Bucket Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Bucket Name:</span> service-data
              </div>
              <div>
                <span className="font-medium">Exists:</span> {bucketInfo.exists ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="font-medium">Total Files:</span> {bucketInfo.files?.length || 0}
              </div>
              <div>
                <span className="font-medium">Total Folders:</span> {bucketInfo.folders?.length || 0}
              </div>
            </div>
          </div>
        )}

        {/* Current File Structure */}
        {bucketInfo && bucketInfo.exists && (
          <div className="space-y-3">
            <h3 className="font-semibold">Current Storage Structure</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="space-y-1 text-sm font-mono">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  <span className="font-semibold">service-data/</span>
                </div>
                
                {/* Show folders */}
                {bucketInfo.folders?.map((folder: any, index: number) => (
                  <div key={index} className="ml-6 flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-blue-500" />
                    <span>{folder.name}/</span>
                  </div>
                ))}
                
                {/* Show files in root */}
                {bucketInfo.files?.map((file: any, index: number) => (
                  <div key={index} className="ml-6 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Expected vs Actual Structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-green-700 mb-2">Expected Structure</h4>
            <div className="bg-green-50 rounded p-3 text-sm font-mono">
              <div>📁 service-data/</div>
              <div className="ml-4">📁 automotive/</div>
              <div className="ml-8">📄 brake-services.xlsx</div>
              <div className="ml-8">📄 engine-services.xlsx</div>
              <div className="ml-4">📁 electronics/</div>
              <div className="ml-8">📄 lighting.xlsx</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-red-700 mb-2">Current Structure (Issue)</h4>
            <div className="bg-red-50 rounded p-3 text-sm font-mono">
              <div>📁 service-data/</div>
              <div className="ml-4">📄 Basic Maintenance.xlsx</div>
              <div className="ml-4">📄 Brakes&Wheels.xlsx</div>
              <div className="ml-4">📄 Engine&Valve Train.xlsx</div>
              <div className="ml-4 text-red-600">❌ Files in root (should be in folders)</div>
            </div>
          </div>
        </div>

        {/* Sector Files Found */}
        {sectorFiles.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Sector Files Detected</h3>
            {sectorFiles.map((sector, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="font-medium">{sector.sectorName}</div>
                <div className="text-sm text-gray-600">
                  {sector.totalFiles} file(s): {sector.excelFiles.map((f: any) => f.name).join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Recommendation</div>
            <div className="text-sm mt-1">
              {bucketInfo?.files?.length > 0 && bucketInfo?.folders?.length === 0 ? (
                <>
                  Your files are in the root directory. To fix this:
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Create folders for each sector (e.g., "automotive", "electronics")</li>
                    <li>Move Excel files into appropriate sector folders</li>
                    <li>Refresh the connection to test again</li>
                  </ol>
                </>
              ) : (
                'The storage structure looks correct for processing.'
              )}
            </div>
          </AlertDescription>
        </Alert>

        <Button onClick={testBucketConnection} disabled={isLoading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Test Connection Again
        </Button>
      </CardContent>
    </Card>
  );
}
