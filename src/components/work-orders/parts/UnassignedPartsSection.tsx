
import React, { useState } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { PartAssignmentControls } from './PartAssignmentControls';
import { InventorySectionHeader } from '../inventory/InventorySectionHeader';
import { InventorySelectionDialog } from '../inventory/InventorySelectionDialog';
import { SpecialOrderDialog } from './SpecialOrderDialog';
import { InventoryItemExtended } from '@/types/inventory';

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
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showSpecialOrderDialog, setShowSpecialOrderDialog] = useState(false);

  const handleShowInventoryDialog = () => {
    console.log('Showing inventory dialog for unassigned parts');
    setShowInventoryDialog(true);
  };

  const handleShowSpecialOrderDialog = () => {
    console.log('Showing special order dialog for unassigned parts');
    setShowSpecialOrderDialog(true);
  };

  const handleInventoryItemAdded = (item: InventoryItemExtended) => {
    console.log('Inventory item added as unassigned part:', item);
    setShowInventoryDialog(false);
    if (onPartAssigned) {
      onPartAssigned();
    }
  };

  const handleSpecialOrderAdded = () => {
    console.log('Special order part added as unassigned');
    setShowSpecialOrderDialog(false);
    if (onPartAssigned) {
      onPartAssigned();
    }
  };

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
                <InventorySectionHeader
                  onShowDialog={handleShowInventoryDialog}
                  onShowSpecialOrderDialog={handleShowSpecialOrderDialog}
                  totalItems={0}
                />
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

        <InventorySelectionDialog
          open={showInventoryDialog}
          onOpenChange={setShowInventoryDialog}
          onAddItem={handleInventoryItemAdded}
        />

        <SpecialOrderDialog
          isOpen={showSpecialOrderDialog}
          onClose={() => setShowSpecialOrderDialog(false)}
          workOrderId={workOrderId}
          onPartAdded={handleSpecialOrderAdded}
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
              <InventorySectionHeader
                onShowDialog={handleShowInventoryDialog}
                onShowSpecialOrderDialog={handleShowSpecialOrderDialog}
                totalItems={unassignedParts.length}
              />
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

      <InventorySelectionDialog
        open={showInventoryDialog}
        onOpenChange={setShowInventoryDialog}
        onAddItem={handleInventoryItemAdded}
      />

      <SpecialOrderDialog
        isOpen={showSpecialOrderDialog}
        onClose={() => setShowSpecialOrderDialog(false)}
        workOrderId={workOrderId}
        onPartAdded={handleSpecialOrderAdded}
      />
    </>
  );
}
