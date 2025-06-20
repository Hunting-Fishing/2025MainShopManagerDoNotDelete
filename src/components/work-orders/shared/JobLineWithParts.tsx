
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Wrench, Package } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { SpecialOrderDialog } from './SpecialOrderDialog';

interface JobLineWithPartsProps {
  jobLine: WorkOrderJobLine;
  parts: WorkOrderPart[];
  onPartsChange: () => void;
  isEditMode?: boolean;
}

export function JobLineWithParts({
  jobLine,
  parts,
  onPartsChange,
  isEditMode = false
}: JobLineWithPartsProps) {
  const [showSpecialOrderDialog, setShowSpecialOrderDialog] = useState(false);

  const jobLineParts = parts.filter(part => part.job_line_id === jobLine.id);
  const totalPartsValue = jobLineParts.reduce((sum, part) => sum + (part.unit_price || 0) * part.quantity, 0);

  const handlePartAdded = () => {
    onPartsChange();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-base">{jobLine.name}</CardTitle>
            {jobLineParts.length > 0 && (
              <Badge variant="secondary">
                {jobLineParts.length} part{jobLineParts.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          {isEditMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSpecialOrderDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Job Line Details */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-blue-900">{jobLine.name}</h4>
              <p className="text-sm text-blue-700">
                {jobLine.estimated_hours || 0} hours @ ${jobLine.labor_rate || 0}/hr
              </p>
              {jobLine.description && (
                <p className="text-sm text-blue-600 mt-1">
                  {jobLine.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-medium text-blue-900">
                ${(jobLine.total_amount || 0).toFixed(2)}
              </p>
              <p className="text-xs text-blue-600">Labor Cost</p>
            </div>
          </div>
        </div>

        {/* Associated Parts */}
        {jobLineParts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No parts assigned to this job line</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-gray-900">Associated Parts</h5>
              <p className="text-sm font-medium text-gray-600">
                Total: ${totalPartsValue.toFixed(2)}
              </p>
            </div>
            {jobLineParts.map((part) => (
              <div key={part.id} className="p-3 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h6 className="font-medium text-gray-900">{part.name}</h6>
                    <p className="text-sm text-gray-600">
                      {part.part_number} | Qty: {part.quantity}
                    </p>
                    {part.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {part.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {part.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {part.part_type}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${((part.unit_price || 0) * part.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${(part.unit_price || 0).toFixed(2)} each
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <SpecialOrderDialog
        isOpen={showSpecialOrderDialog}
        onClose={() => setShowSpecialOrderDialog(false)}
        workOrderId={jobLine.work_order_id}
        jobLineId={jobLine.id}
        onPartAdded={handlePartAdded}
      />
    </Card>
  );
}
