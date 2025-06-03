
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImportBatch } from '@/hooks/useServiceStagedImport';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock,
  Package
} from 'lucide-react';

interface ServiceBatchManagerProps {
  batches: ImportBatch[];
  onImportBatch: (batchId: string, onProgress?: (progress: number) => void) => Promise<void>;
  onComplete: () => void;
}

export const ServiceBatchManager: React.FC<ServiceBatchManagerProps> = ({
  batches,
  onImportBatch,
  onComplete
}) => {
  const [importingBatchId, setImportingBatchId] = useState<string | null>(null);

  const handleImportBatch = async (batchId: string) => {
    setImportingBatchId(batchId);
    try {
      await onImportBatch(batchId, (progress) => {
        // Progress is handled by the hook
      });
    } finally {
      setImportingBatchId(null);
    }
  };

  const handleImportAll = async () => {
    for (const batch of batches) {
      if (batch.status === 'pending') {
        await handleImportBatch(batch.id);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'importing': return <Play className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'importing': return <Badge variant="default">Importing</Badge>;
      case 'completed': return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return null;
    }
  };

  const completedBatches = batches.filter(b => b.status === 'completed').length;
  const totalBatches = batches.length;
  const overallProgress = totalBatches > 0 ? (completedBatches / totalBatches) * 100 : 0;

  const allCompleted = batches.every(b => b.status === 'completed');
  const hasFailures = batches.some(b => b.status === 'failed');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Import Batches ({completedBatches}/{totalBatches})
            </span>
            <div className="flex gap-2">
              <Button 
                onClick={handleImportAll}
                disabled={importingBatchId !== null || allCompleted}
                size="sm"
              >
                Import All Batches
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-3">
              {batches.map((batch) => (
                <Card key={batch.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(batch.status)}
                        <span className="font-medium">{batch.name}</span>
                        {getStatusBadge(batch.status)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {batch.categories.length} categories
                        </span>
                        
                        {batch.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleImportBatch(batch.id)}
                            disabled={importingBatchId !== null}
                          >
                            Import
                          </Button>
                        )}
                        
                        {batch.status === 'failed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleImportBatch(batch.id)}
                            disabled={importingBatchId !== null}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>

                    {(batch.status === 'importing' || batch.status === 'completed') && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Progress</span>
                          <span className="text-xs text-gray-600">{batch.progress}%</span>
                        </div>
                        <Progress value={batch.progress} className="h-1" />
                      </div>
                    )}

                    {batch.error && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        Error: {batch.error}
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Categories: {batch.categories.map(c => c.name).join(', ')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {allCompleted && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Batches Completed!</h3>
              <p className="text-gray-600 mb-4">
                Successfully imported {totalBatches} batches with all service data.
              </p>
              <Button onClick={onComplete}>
                Complete Import
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {hasFailures && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-8 w-8 mx-auto text-red-500 mb-4" />
              <h4 className="font-semibold mb-2">Some Batches Failed</h4>
              <p className="text-sm text-gray-600 mb-4">
                You can retry failed batches or continue with the successful imports.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={onComplete}>
                  Continue with Successful Imports
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
