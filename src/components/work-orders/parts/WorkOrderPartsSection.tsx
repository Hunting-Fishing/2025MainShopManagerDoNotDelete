
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { EditPartDialog } from './EditPartDialog';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  jobLines?: WorkOrderJobLine[];
  onPartsChange: () => Promise<void>;
  isEditMode?: boolean;
}

export function WorkOrderPartsSection({
  workOrderId,
  parts,
  jobLines = [],
  onPartsChange,
  isEditMode = false
}: WorkOrderPartsSectionProps) {
  const [editingPart, setEditingPart] = useState<WorkOrderPart | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditPart = (part: WorkOrderPart) => {
    setEditingPart(part);
    setEditDialogOpen(true);
  };

  const handleDeletePart = async (partId: string) => {
    try {
      // TODO: Implement delete part API call
      console.log('Deleting part:', partId);
      await onPartsChange();
    } catch (error) {
      console.error('Error deleting part:', error);
    }
  };

  const handleAddPart = () => {
    const newPart: WorkOrderPart = {
      id: `temp-${Date.now()}`,
      work_order_id: workOrderId,
      part_number: '',
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      status: 'pending',
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setEditingPart(newPart);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingPart(null);
  };

  const handleSavePart = async (savedPart: WorkOrderPart) => {
    try {
      // TODO: Implement save part API call
      console.log('Saving part:', savedPart);
      await onPartsChange();
      handleCloseEditDialog();
    } catch (error) {
      console.error('Error saving part:', error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Parts & Materials</CardTitle>
        {isEditMode && (
          <Button
            onClick={handleAddPart}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Part
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {parts.length > 0 ? (
          <div className="space-y-4">
            {parts.map((part) => (
              <div
                key={part.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-slate-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="font-medium">{part.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Part #: {part.part_number}
                      </p>
                      {part.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {part.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        Qty: {part.quantity} × ${part.unit_price.toFixed(2)}
                      </p>
                      <p className="text-sm font-semibold">
                        Total: ${part.total_price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                {isEditMode && (
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPart(part)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePart(part.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {isEditMode ? 
              "No parts added yet. Click 'Add Part' to get started." :
              "No parts configured for this work order."
            }
          </div>
        )}

        {editingPart && (
          <EditPartDialog
            part={editingPart}
            open={editDialogOpen}
            onClose={handleCloseEditDialog}
            onSave={handleSavePart}
            jobLines={jobLines}
          />
        )}
      </CardContent>
    </Card>
  );
}
