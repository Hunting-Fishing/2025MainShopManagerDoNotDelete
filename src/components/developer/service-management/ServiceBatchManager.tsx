
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, Play } from 'lucide-react';
import { ImportBatch } from '@/hooks/useServiceStagedImport';

interface ServiceBatchManagerProps {
  batches: ImportBatch[];
  onProcessBatch: (batchId: string) => Promise<void>;
  onProcessAll: () => Promise<void>;
  isProcessing: boolean;
}

export const ServiceBatchManager: React.FC<ServiceBatchManagerProps> = ({
  batches,
  onProcessBatch,
  onProcessAll,
  isProcessing
}) => {
  const getStatusIcon = (batch: ImportBatch) => {
    const status = batch.status || (batch.processed ? 'completed' : 'pending');
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (batch: ImportBatch) => {
    const status = batch.status || (batch.processed ? 'completed' : 'pending');
    
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Import Batches</CardTitle>
          <Button onClick={onProcessAll} disabled={isProcessing}>
            <Play className="h-4 w-4 mr-2" />
            Process All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {batches.map((batch) => {
            const status = batch.status || (batch.processed ? 'completed' : 'pending');
            const progress = batch.progress || 0;
            
            return (
              <div key={batch.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(batch)}
                    <span className="font-medium">{batch.name}</span>
                  </div>
                  {getStatusBadge(batch)}
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  {batch.categories.length} categories
                </div>

                {status === 'processing' && (
                  <div className="mb-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
                  </div>
                )}

                {batch.errors && batch.errors.length > 0 && (
                  <div className="text-sm text-red-600 mb-2">
                    {batch.errors.length} error{batch.errors.length !== 1 ? 's' : ''}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onProcessBatch(batch.id)}
                    disabled={status === 'completed' || status === 'processing' || isProcessing}
                  >
                    {status === 'completed' ? 'Completed' : 'Process'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
