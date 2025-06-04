
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Database, CheckCircle } from 'lucide-react';

interface ServiceBatchManagerProps {
  progress: number;
  currentBatch?: string;
  totalBatches?: number;
  processedItems?: number;
}

export const ServiceBatchManager: React.FC<ServiceBatchManagerProps> = ({
  progress,
  currentBatch = "Processing...",
  totalBatches = 1,
  processedItems = 0
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Batch Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-semibold text-blue-900">{processedItems}</div>
            <div className="text-xs text-blue-700">Items Processed</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-semibold text-green-900">{totalBatches}</div>
            <div className="text-xs text-green-700">Total Batches</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50">
            {currentBatch}
          </Badge>
          {progress === 100 && (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
