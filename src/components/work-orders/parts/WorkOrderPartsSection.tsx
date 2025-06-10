
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { getWorkOrderParts, deleteWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { AddPartsDialog } from './AddPartsDialog';
import { JobLinePartsDisplay } from './JobLinePartsDisplay';
import { toast } from 'sonner';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  isEditMode?: boolean;
}

export function WorkOrderPartsSection({
  workOrderId,
  isEditMode = false
}: WorkOrderPartsSectionProps) {
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [addPartsDialogOpen, setAddPartsDialogOpen] = useState(false);

  useEffect(() => {
    loadParts();
  }, [workOrderId]);

  const loadParts = async () => {
    try {
      setLoading(true);
      const workOrderParts = await getWorkOrderParts(workOrderId);
      setParts(workOrderParts);
    } catch (error) {
      console.error('Error loading parts:', error);
      toast.error('Failed to load parts');
    } finally {
      setLoading(false);
    }
  };

  const handlePartsAdded = () => {
    loadParts();
    setAddPartsDialogOpen(false);
  };

  const handleRemovePart = async (partId: string) => {
    try {
      const success = await deleteWorkOrderPart(partId);
      if (success) {
        await loadParts();
        toast.success('Part removed successfully');
      } else {
        toast.error('Failed to remove part');
      }
    } catch (error) {
      console.error('Error removing part:', error);
      toast.error('Failed to remove part');
    }
  };

  const handleEditPart = (part: WorkOrderPart) => {
    // TODO: Implement edit functionality
    console.log('Edit part:', part);
    toast.info('Edit functionality coming soon');
  };

  const totalValue = parts.reduce((total, part) => total + (part.customerPrice * part.quantity), 0);

  if (loading) {
    return (
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Parts & Materials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading parts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Parts & Materials</CardTitle>
            <Badge variant="secondary">{parts.length}</Badge>
          </div>
          {isEditMode && (
            <Button
              size="sm"
              onClick={() => setAddPartsDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Parts
            </Button>
          )}
        </div>
        
        {parts.length > 0 && (
          <div className="flex gap-4 text-sm text-slate-600">
            <span>Total Items: {parts.length}</span>
            <span>Total Value: ${totalValue.toFixed(2)}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {parts.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
            <Package className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <p className="text-slate-500 mb-4">No parts added yet</p>
            {isEditMode ? (
              <p className="text-sm text-slate-400">
                Add parts and materials needed for this work order
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Parts will appear here when added in edit mode
              </p>
            )}
          </div>
        ) : (
          <JobLinePartsDisplay 
            parts={parts}
            onRemovePart={handleRemovePart}
            onEditPart={handleEditPart}
            isEditMode={isEditMode}
          />
        )}
      </CardContent>

      {isEditMode && (
        <AddPartsDialog
          workOrderId={workOrderId}
          onPartsAdd={handlePartsAdded}
          open={addPartsDialogOpen}
          onOpenChange={setAddPartsDialogOpen}
        />
      )}
    </Card>
  );
}
