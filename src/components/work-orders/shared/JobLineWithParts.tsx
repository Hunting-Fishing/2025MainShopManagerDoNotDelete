
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, Wrench } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { AddPartDialog } from '../parts/AddPartDialog';

interface JobLineWithPartsProps {
  jobLine: WorkOrderJobLine;
  parts: WorkOrderPart[];
  workOrderId: string;
  onPartAdded?: () => void;
  isEditMode?: boolean;
}

export function JobLineWithParts({
  jobLine,
  parts,
  workOrderId,
  onPartAdded,
  isEditMode = false
}: JobLineWithPartsProps) {
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);

  const handleAddPartClick = () => {
    console.log('Add Part button clicked for job line:', jobLine.id);
    setShowAddPartDialog(true);
  };

  const handlePartAdded = () => {
    console.log('Part added successfully, refreshing...');
    setShowAddPartDialog(false);
    if (onPartAdded) {
      onPartAdded();
    }
  };

  const handleDialogClose = () => {
    console.log('Add Part dialog closed');
    setShowAddPartDialog(false);
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            {jobLine.name}
          </CardTitle>
          {jobLine.description && (
            <p className="text-sm text-muted-foreground">{jobLine.description}</p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {/* Job Line Details */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <span className="font-medium">Hours:</span> {jobLine.estimated_hours || 0}
            </div>
            <div>
              <span className="font-medium">Rate:</span> ${jobLine.labor_rate || 0}
            </div>
            <div>
              <span className="font-medium">Total:</span> ${jobLine.total_amount || 0}
            </div>
          </div>

          {/* Parts Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Parts ({parts.length})
              </h4>
              {isEditMode && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddPartClick}
                  className="h-8 px-3"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Part
                </Button>
              )}
            </div>

            {/* Parts List */}
            {parts.length > 0 ? (
              <div className="space-y-2">
                {parts.map((part) => (
                  <div key={part.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div>
                      <div className="font-medium text-sm">{part.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Part #: {part.part_number} | Qty: {part.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">${part.total_price}</div>
                      <div className="text-xs text-muted-foreground">
                        ${part.unit_price} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No parts assigned to this job line</p>
                {isEditMode && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddPartClick}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Part
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Part Dialog */}
      <AddPartDialog
        isOpen={showAddPartDialog}
        onClose={handleDialogClose}
        workOrderId={workOrderId}
        jobLineId={jobLine.id}
        onPartAdded={handlePartAdded}
      />
    </>
  );
}
