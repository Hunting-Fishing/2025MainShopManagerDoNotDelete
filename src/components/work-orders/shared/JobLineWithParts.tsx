
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { AddPartDialog } from '../parts/AddPartDialog';

interface JobLineWithPartsProps {
  jobLine: WorkOrderJobLine;
  jobLineParts: WorkOrderPart[];
  onPartUpdate?: (updatedPart: WorkOrderPart) => Promise<void>;
  onPartDelete?: (partId: string) => Promise<void>;
  onPartsChange: () => void;
  isEditMode: boolean;
}

export function JobLineWithParts({
  jobLine,
  jobLineParts,
  onPartUpdate,
  onPartDelete,
  onPartsChange,
  isEditMode
}: JobLineWithPartsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalPartsValue = jobLineParts.reduce((sum, part) => sum + (part.total_price || 0), 0);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <CardTitle className="text-base">{jobLine.name}</CardTitle>
            </div>
            <div className="flex items-center gap-4">
              {jobLineParts.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {jobLineParts.length} parts • {formatCurrency(totalPartsValue)}
                </span>
              )}
              {isEditMode && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowAddPartDialog(true)}
                  className="h-8 px-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Part
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0">
            {/* Job Line Details */}
            <div className="mb-4 p-3 bg-muted/50 rounded">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Labor Rate</p>
                  <p className="text-sm">{formatCurrency(jobLine.labor_rate || 0)}/hr</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Est. Hours</p>
                  <p className="text-sm">{jobLine.estimated_hours || 0}h</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Labor Total</p>
                  <p className="text-sm">{formatCurrency(jobLine.total_amount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-sm capitalize">{jobLine.status || 'pending'}</p>
                </div>
              </div>
              {jobLine.description && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{jobLine.description}</p>
                </div>
              )}
            </div>

            {/* Parts List */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Parts ({jobLineParts.length})</h4>
              {jobLineParts.length > 0 ? (
                <div className="space-y-2">
                  {jobLineParts.map((part) => (
                    <div key={part.id} className="border rounded p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-sm">{part.name}</h5>
                            <span className="text-xs text-muted-foreground">
                              #{part.part_number}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-muted-foreground">
                            <div>Qty: {part.quantity}</div>
                            <div>Unit: {formatCurrency(part.unit_price)}</div>
                            <div>Total: {formatCurrency(part.total_price || 0)}</div>
                          </div>
                          {part.description && (
                            <p className="text-sm text-muted-foreground mt-1">{part.description}</p>
                          )}
                        </div>
                        {isEditMode && (
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                              Edit
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-800 text-sm"
                              onClick={() => onPartDelete?.(part.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No parts assigned to this job line
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {showAddPartDialog && (
        <AddPartDialog
          workOrderId={jobLine.work_order_id}
          preSelectedJobLineId={jobLine.id}
          onClose={() => setShowAddPartDialog(false)}
          onPartAdded={onPartsChange}
        />
      )}
    </>
  );
}
