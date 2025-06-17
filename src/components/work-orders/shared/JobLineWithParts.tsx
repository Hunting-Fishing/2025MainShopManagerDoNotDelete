
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { AddPartsDialog } from '../parts/AddPartsDialog';

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

  const handlePartAdd = async (partData: any) => {
    // This will be handled by the AddPartsDialog component internally
    // and will trigger onPartsChange through the parent component
    onPartsChange();
    setShowAddPartDialog(false);
  };

  const handlePartUpdate = async (updatedPart: WorkOrderPart) => {
    if (onPartUpdate) {
      await onPartUpdate(updatedPart);
    }
  };

  const handlePartDelete = async (partId: string) => {
    if (onPartDelete) {
      await onPartDelete(partId);
    }
  };

  // Calculate totals
  const totalParts = jobLineParts.length;
  const totalValue = jobLineParts.reduce((sum, part) => sum + (part.total_price || 0), 0);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <div>
              <CardTitle className="text-base">{jobLine.name}</CardTitle>
              {jobLine.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {jobLine.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="font-medium">{totalParts} parts</div>
              <div className="text-muted-foreground">${totalValue.toFixed(2)}</div>
            </div>
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
          {jobLineParts.length > 0 ? (
            <div className="space-y-3">
              {jobLineParts.map((part) => (
                <div key={part.id} className="border rounded p-3 bg-muted/30">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{part.name}</h4>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          #{part.part_number}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">Qty:</span> {part.quantity}
                        </div>
                        <div>
                          <span className="font-medium">Unit:</span> ${part.unit_price?.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> ${part.total_price?.toFixed(2)}
                        </div>
                      </div>
                      {part.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {part.description}
                        </p>
                      )}
                      {part.status && (
                        <div className="mt-2">
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                            {part.status}
                          </span>
                        </div>
                      )}
                    </div>
                    {isEditMode && (
                      <div className="flex gap-1 ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-7 px-2 text-xs text-blue-600 hover:text-blue-800"
                          onClick={() => handlePartUpdate(part)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-7 px-2 text-xs text-red-600 hover:text-red-800"
                          onClick={() => handlePartDelete(part.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No parts assigned to this job line</p>
              {isEditMode && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setShowAddPartDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Part
                </Button>
              )}
            </div>
          )}
        </CardContent>
      )}

      {showAddPartDialog && (
        <AddPartsDialog
          workOrderId={jobLine.work_order_id}
          jobLineId={jobLine.id}
          onPartAdd={handlePartAdd}
        />
      )}
    </Card>
  );
}
