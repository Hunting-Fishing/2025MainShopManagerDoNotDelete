
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkOrderPart } from '@/types/workOrderPart';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { InventorySectionHeader } from '../inventory/InventorySectionHeader';
import { AddInventoryDialog } from '../inventory/AddInventoryDialog';
import { SpecialOrderDialog } from '../shared/SpecialOrderDialog';
import { EditPartDialog } from './EditPartDialog';
import { InventoryItem } from '@/types/inventory';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  onPartsChange: () => void;
  isEditMode?: boolean;
}

export function WorkOrderPartsSection({
  workOrderId,
  parts,
  onPartsChange,
  isEditMode = false
}: WorkOrderPartsSectionProps) {
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [showSpecialOrderDialog, setShowSpecialOrderDialog] = useState(false);
  const [editingPart, setEditingPart] = useState<WorkOrderPart | null>(null);
  const [deletingPartId, setDeletingPartId] = useState<string | null>(null);

  const handleAddInventoryItem = async (item: InventoryItem) => {
    try {
      const partData = {
        work_order_id: workOrderId,
        job_line_id: null,
        part_name: item.name,
        part_number: item.sku,
        category: item.category || null,
        quantity: 1,
        customer_price: item.unit_price || item.price || 0,
        supplier_cost: 0,
        part_type: 'inventory',
        status: 'pending'
      };

      const { error } = await supabase
        .from('work_order_parts')
        .insert([partData]);

      if (error) {
        console.error('Error adding inventory item:', error);
        toast({
          title: "Error",
          description: "Failed to add inventory item",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Inventory item added successfully"
      });

      onPartsChange();
      setShowInventoryDialog(false);
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleEditPart = (part: WorkOrderPart) => {
    setEditingPart(part);
  };

  const handleUpdatePart = async (updatedPart: Partial<WorkOrderPart>) => {
    try {
      const { error } = await supabase
        .from('work_order_parts')
        .update({
          name: updatedPart.name,
          part_number: updatedPart.part_number,
          description: updatedPart.description,
          quantity: updatedPart.quantity,
          unit_price: updatedPart.unit_price,
          total_price: (updatedPart.quantity || 0) * (updatedPart.unit_price || 0),
          status: updatedPart.status,
          notes: updatedPart.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPart?.id);

      if (error) {
        console.error('Error updating part:', error);
        toast({
          title: "Error",
          description: "Failed to update part",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Part updated successfully"
      });

      onPartsChange();
      setEditingPart(null);
    } catch (error) {
      console.error('Error updating part:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleDeletePart = async (partId: string) => {
    try {
      const { error } = await supabase
        .from('work_order_parts')
        .delete()
        .eq('id', partId);

      if (error) {
        console.error('Error deleting part:', error);
        toast({
          title: "Error",
          description: "Failed to delete part",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Part deleted successfully"
      });

      onPartsChange();
      setDeletingPartId(null);
    } catch (error) {
      console.error('Error deleting part:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handlePartAdded = () => {
    onPartsChange();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'installed': return 'default';
      case 'received': return 'secondary';
      case 'ordered': return 'outline';
      case 'pending': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Parts ({parts.length})</CardTitle>
            {isEditMode && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowInventoryDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Part
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSpecialOrderDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Special Order
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {parts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No parts added to this work order.
              {isEditMode && (
                <div className="mt-4">
                  <Button onClick={() => setShowInventoryDialog(true)}>
                    Add Your First Part
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {parts.map((part) => (
                <div key={part.id} className="p-4 border rounded-lg bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-slate-900">{part.name}</h4>
                        <Badge variant={getStatusBadgeVariant(part.status || 'pending')}>
                          {part.status || 'pending'}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600 space-y-1">
                        <p><strong>Part #:</strong> {part.part_number}</p>
                        <p><strong>Quantity:</strong> {part.quantity}</p>
                        {part.description && (
                          <p><strong>Description:</strong> {part.description}</p>
                        )}
                        {part.notes && (
                          <p><strong>Notes:</strong> {part.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 mb-2">
                        ${part.total_price.toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-500">
                        ${(part.unit_price || 0).toFixed(2)} each
                      </p>
                      {isEditMode && (
                        <div className="flex items-center gap-1 mt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditPart(part)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingPartId(part.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddInventoryDialog
        open={showInventoryDialog}
        onOpenChange={setShowInventoryDialog}
        onAddItem={handleAddInventoryItem}
      />

      <SpecialOrderDialog
        open={showSpecialOrderDialog}
        onOpenChange={setShowSpecialOrderDialog}
        workOrderId={workOrderId}
        onPartAdded={handlePartAdded}
      />

      <EditPartDialog
        part={editingPart}
        open={!!editingPart}
        onOpenChange={(open) => !open && setEditingPart(null)}
        onUpdate={handleUpdatePart}
      />

      <AlertDialog open={!!deletingPartId} onOpenChange={() => setDeletingPartId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Part</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this part? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPartId && handleDeletePart(deletingPartId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
