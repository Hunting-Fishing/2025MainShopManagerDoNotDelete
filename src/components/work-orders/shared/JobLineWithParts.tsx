
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
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
  const [showAddPart, setShowAddPart] = useState(false);

  const handlePartUpdate = async (updatedPart: WorkOrderPart) => {
    if (onPartUpdate) {
      await onPartUpdate(updatedPart);
      onPartsChange();
    }
  };

  const handlePartDelete = async (partId: string) => {
    if (onPartDelete) {
      await onPartDelete(partId);
      onPartsChange();
    }
  };

  const handlePartAdded = () => {
    onPartsChange();
    setShowAddPart(false);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{jobLine.name}</CardTitle>
            {jobLine.description && (
              <p className="text-sm text-muted-foreground mt-1">{jobLine.description}</p>
            )}
          </div>
          {isEditMode && jobLine.id !== 'unassigned' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddPart(true)}
              className="h-8 px-3"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {jobLineParts.length > 0 ? (
          <div className="space-y-3">
            {jobLineParts.map((part) => (
              <div key={part.id} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{part.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Part #{part.part_number} • Qty: {part.quantity} • ${part.unit_price}
                    </p>
                    {part.description && (
                      <p className="text-sm text-muted-foreground mt-1">{part.description}</p>
                    )}
                  </div>
                  {isEditMode && (
                    <div className="flex gap-2">
                      <button 
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        onClick={() => {/* Edit part logic */}}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800 text-sm"
                        onClick={() => handlePartDelete(part.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No parts assigned to this job line</p>
            {isEditMode && jobLine.id !== 'unassigned' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddPart(true)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Part
              </Button>
            )}
          </div>
        )}

        {/* Job line summary info */}
        {jobLine.id !== 'unassigned' && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {jobLine.estimated_hours && (
                <div>
                  <span className="text-muted-foreground">Est. Hours:</span>
                  <span className="ml-2">{jobLine.estimated_hours}</span>
                </div>
              )}
              {jobLine.labor_rate && (
                <div>
                  <span className="text-muted-foreground">Labor Rate:</span>
                  <span className="ml-2">${jobLine.labor_rate}</span>
                </div>
              )}
              {jobLine.status && (
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-2 capitalize">{jobLine.status}</span>
                </div>
              )}
              {jobLine.total_amount && (
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <span className="ml-2">${jobLine.total_amount}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {showAddPart && (
        <AddPartsDialog
          workOrderId={jobLine.work_order_id}
          jobLineId={jobLine.id !== 'unassigned' ? jobLine.id : undefined}
          onClose={() => setShowAddPart(false)}
          onPartAdded={handlePartAdded}
        />
      )}
    </Card>
  );
}
