
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, RefreshCw } from 'lucide-react';
import { ServiceImportProgress } from './ServiceImportProgress';
import { useServiceManagement } from '@/hooks/useServiceManagement';

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
