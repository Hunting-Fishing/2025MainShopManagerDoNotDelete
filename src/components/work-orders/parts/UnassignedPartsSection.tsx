
import React, { useState } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { PartAssignmentControls } from './PartAssignmentControls';
import { AddPartDialog } from './AddPartDialog';

interface UnassignedPartsSectionProps {
  workOrderId: string;
  unassignedParts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartUpdate?: (updatedPart: WorkOrderPart) => Promise<void>;
  onPartDelete?: (partId: string) => Promise<void>;
  onPartAssigned?: () => void;
  isEditMode: boolean;
}

export function UnassignedPartsSection({
  workOrderId,
  unassignedParts,
  jobLines,
  onPartUpdate,
  onPartDelete,
  onPartAssigned,
  isEditMode
}: UnassignedPartsSectionProps) {
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);

  if (unassignedParts.length === 0) {
    return (
      <>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Unassigned Parts
              </CardTitle>
              {isEditMode && (
                <Button size="sm" className="h-8 px-3" onClick={() => setShowAddPartDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Part
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No unassigned parts</p>
              <p className="text-sm">All parts are assigned to job lines</p>
            </div>
          </CardContent>
        </Card>

        <AddPartDialog
          isOpen={showAddPartDialog}
          onClose={() => setShowAddPartDialog(false)}
          workOrderId={workOrderId}
          jobLines={jobLines}
          onPartAdded={onPartAssigned || (() => {})}
        />
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Unassigned Parts ({unassignedParts.length})
            </CardTitle>
            {isEditMode && (
              <Button size="sm" className="h-8 px-3" onClick={() => setShowAddPartDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Part
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {unassignedParts.map((part) => (
              <div key={part.id} className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{part.name}</h4>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                        Unassigned
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>Part #: {part.part_number}</div>
                      <div>Qty: {part.quantity}</div>
                      <div>Unit Price: ${part.unit_price}</div>
                      <div>Total: ${part.total_price}</div>
                    </div>
                    {part.description && (
                      <p className="text-sm text-muted-foreground mt-2">{part.description}</p>
                    )}
                  </div>
                  
                  {isEditMode && (
                    <div className="ml-4">
                      <PartAssignmentControls
                        part={part}
                        jobLines={jobLines}
                        onPartUpdate={onPartUpdate}
                        onPartDelete={onPartDelete}
                        onPartAssigned={onPartAssigned}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AddPartDialog
        isOpen={showAddPartDialog}
        onClose={() => setShowAddPartDialog(false)}
        workOrderId={workOrderId}
        jobLines={jobLines}
        onPartAdded={onPartAssigned || (() => {})}
      />
    </>
  );
}
