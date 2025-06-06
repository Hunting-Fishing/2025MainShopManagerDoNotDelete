
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from '@/components/ui/resizable';
import { bucketViewerService } from '@/lib/services';
import { useQuery } from '@tanstack/react-query';
import { 
  Folder, 
  FileSpreadsheet, 
  RefreshCw, 
  Database,
  HardDrive,
  Loader2 
} from 'lucide-react';

export function LiveBucketViewer() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const { 
    data: bucketInfo, 
    isLoading: bucketLoading, 
    refetch: refetchBucket 
  } = useQuery({
    queryKey: ['bucket-info'],
    queryFn: () => bucketViewerService.getBucketInfo(),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const { 
    data: folderFiles = [], 
    isLoading: filesLoading,
    refetch: refetchFiles 
  } = useQuery({
    queryKey: ['folder-files', selectedFolder],
    queryFn: () => selectedFolder ? bucketViewerService.getFilesInFolder(selectedFolder) : Promise.resolve([]),
    enabled: !!selectedFolder,
  });

  const handleRefresh = async () => {
    await refetchBucket();
    if (selectedFolder) {
      await refetchFiles();
    }
  };

  if (bucketLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Live Storage Browser
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!bucketInfo?.exists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Live Storage Browser
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <HardDrive className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Storage bucket not found</p>
            <p className="text-sm">Check bucket configuration</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalFiles = bucketInfo.files.length;
  const totalFolders = bucketInfo.folders.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Live Storage Browser
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{totalFolders} folders</Badge>
            <Badge variant="outline">{totalFiles} files</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={bucketLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResizablePanelGroup direction="horizontal" className="min-h-[400px]">
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="pr-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Sector Folders
              </h4>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {bucketInfo.folders.map((folder) => (
                  <Button
                    key={folder.name}
                    variant={selectedFolder === folder.name ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedFolder(folder.name)}
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    {folder.name}
                  </Button>
                ))}
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="pl-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Excel Files
                {selectedFolder && (
                  <span className="text-xs text-muted-foreground">
                    in {selectedFolder}
                  </span>
                )}
              </h4>
              
              {!selectedFolder ? (
                <div className="text-center py-8 text-gray-500">
                  <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Select a folder to view files</p>
                </div>
              ) : filesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : folderFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No Excel files found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {folderFiles.map((file) => (
                    <div
                      key={file.path}
                      className="flex items-center justify-between p-2 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{file.name}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {file.size ? `${Math.round(file.size / 1024)}KB` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </CardContent>
    </Card>
  );
}
