
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, RefreshCw, FolderOpen, Database } from 'lucide-react';
import { ServiceImportProgress } from './ServiceImportProgress';
import { useServiceManagement } from '@/hooks/useServiceManagement';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function FreshServiceImport() {
  const {
    isImporting,
    importProgress,
    handleServiceImport,
    handleRefreshData
  } = useServiceManagement();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Services from Storage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Storage Route Information */}
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div><strong>Storage Bucket:</strong> <code>service-data</code></div>
                <div><strong>Expected Folder Structure:</strong></div>
                <div className="ml-4 space-y-1 text-sm font-mono">
                  <div>📁 service-data/</div>
                  <div className="ml-4">📁 {`{sector-name}/`}</div>
                  <div className="ml-8">📄 {`{category}.xlsx`}</div>
                  <div className="ml-8">📄 {`{category}.xlsx`}</div>
                  <div className="ml-8">📄 ...</div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Example: service-data/automotive/brake-services.xlsx
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleServiceImport}
              disabled={isImporting}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isImporting ? 'Importing...' : 'Import Services from Storage'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRefreshData}
              disabled={isImporting}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
          
          <div className="text-sm text-gray-600 flex items-center">
            <FolderOpen className="h-4 w-4 mr-2" />
            Automatically processes all Excel files in sector folders with unlimited services per subcategory
          </div>

          <ServiceImportProgress
            isImporting={isImporting}
            progress={importProgress.progress}
            stage={importProgress.stage}
            message={importProgress.message}
            error={importProgress.error}
            completed={importProgress.completed}
            operation="import"
          />
        </CardContent>
      </Card>
    </div>
  );
}
