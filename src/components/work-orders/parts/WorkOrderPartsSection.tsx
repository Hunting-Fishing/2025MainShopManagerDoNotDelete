
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { WorkOrderPart, partStatusMap } from '@/types/workOrderPart';
import { EditPartDialog } from './EditPartDialog';
import { toast } from '@/hooks/use-toast';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  onPartsChange: () => Promise<void>;
  isEditMode: boolean;
}

export function WorkOrderPartsSection({
  workOrderId,
  parts,
  onPartsChange,
  isEditMode
}: WorkOrderPartsSectionProps) {
  const [editingPart, setEditingPart] = useState<WorkOrderPart | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditPart = (part: WorkOrderPart) => {
    setEditingPart(part);
    setIsEditDialogOpen(true);
  };

  const handleDeletePart = async (partId: string) => {
    if (confirm('Are you sure you want to delete this part?')) {
      try {
        // TODO: Implement delete part API call
        console.log('Deleting part:', partId);
        await onPartsChange();
        toast({
          title: "Success",
          description: "Part deleted successfully",
        });
      } catch (error) {
        console.error('Error deleting part:', error);
        toast({
          title: "Error",
          description: "Failed to delete part",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddPart = () => {
    // Create a temporary part for adding new parts
    const newPart: WorkOrderPart = {
      id: '',
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
    setIsEditDialogOpen(true);
  };

  const handleUpdatePart = async (updatedPart: Partial<WorkOrderPart>) => {
    try {
      // TODO: Implement update part API call
      console.log('Updating part:', updatedPart);
      await onPartsChange();
      toast({
        title: "Success",
        description: "Part updated successfully",
      });
    } catch (error) {
      console.error('Error updating part:', error);
      throw error; // Re-throw to let the dialog handle the error
    }
  };

  const totalPartsValue = parts.reduce((sum, part) => sum + part.total_price, 0);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'installed':
        return 'success';
      case 'ordered':
        return 'info';
      case 'received':
        return 'secondary';
      case 'returned':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Parts & Materials
            {parts.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {parts.length}
              </Badge>
            )}
          </CardTitle>
          {isEditMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddPart}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Part
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {parts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No parts added yet.</p>
            {isEditMode && (
              <Button
                variant="outline"
                onClick={handleAddPart}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Part
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {parts.map((part) => (
              <div
                key={part.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{part.name}</h4>
                      <Badge 
                        variant={getStatusBadgeVariant(part.status || 'pending')}
                        className="text-xs"
                      >
                        {partStatusMap[part.status || 'pending']?.label || part.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Part #:</span> {part.part_number}
                    </div>
                    
                    {part.description && (
                      <p className="text-sm text-gray-600 mb-2">{part.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Quantity:</span> {part.quantity}
                      </div>
                      <div>
                        <span className="text-gray-500">Unit Price:</span> ${part.unit_price.toFixed(2)}
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span> ${part.total_price.toFixed(2)}
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span> {partStatusMap[part.status || 'pending']?.label || part.status}
                      </div>
                    </div>
                    
                    {part.notes && (
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Notes:</span> {part.notes}
                      </div>
                    )}
                  </div>
                  
                  {isEditMode && (
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPart(part)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePart(part.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Parts Value:</span>
                <span>${totalPartsValue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {editingPart && (
          <EditPartDialog
            part={editingPart}
            open={isEditDialogOpen}
            onClose={setIsEditDialogOpen}
            onUpdate={handleUpdatePart}
          />
        )}
      </CardContent>
    </Card>
  );
}
