import React, { useState } from 'react';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Package, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditPartDialog } from './EditPartDialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

interface WorkOrderPartsSectionProps {
  parts: WorkOrderPart[];
  isEditMode: boolean;
  onPartUpdate?: (partId: string, updates: Partial<WorkOrderPart>) => Promise<void>;
  onPartDelete?: (partId: string) => void;
  onAdd?: (partData: WorkOrderPartFormValues) => Promise<void>;
  workOrderId?: string;
  isLoading?: boolean;
}

interface PartRowProps {
  part: WorkOrderPart;
  isEditMode: boolean;
  onPartUpdate?: (partId: string, updates: Partial<WorkOrderPart>) => Promise<void>;
  onPartDelete?: (partId: string) => void;
}

function PartRow({ part, isEditMode, onPartUpdate, onPartDelete }: PartRowProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const totalPrice = (part.customerPrice || part.unit_price || 0) * (part.quantity || 1);

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleSaveEdit = async (partId: string, updates: Partial<WorkOrderPart>) => {
    if (!onPartUpdate) return;
    
    try {
      setIsUpdating(true);
      await onPartUpdate(partId, updates);
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating part:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (onPartDelete) {
      onPartDelete(part.id);
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <TableRow className="bg-blue-50/30 border-l-4 border-l-blue-500">
        {/* Type */}
        <TableCell>
          <div className="flex items-center gap-2">
            <Package className="h-3 w-3" />
            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
              Part
            </Badge>
          </div>
        </TableCell>
        
        {/* Name */}
        <TableCell className="font-medium">{part.name}</TableCell>
        
        {/* Description/Part Number */}
        <TableCell className="text-muted-foreground text-sm">
          {part.part_number && `Part #: ${part.part_number}`}
        </TableCell>
        
        {/* Quantity */}
        <TableCell>{part.quantity || 1}</TableCell>
        
        {/* Unit Price */}
        <TableCell>${(part.unit_price || 0).toFixed(2)}</TableCell>
        
        {/* Total */}
        <TableCell>
          <span className="font-medium">
            ${totalPrice.toFixed(2)}
          </span>
        </TableCell>
        
        {/* Status */}
        <TableCell>
          <Badge variant="secondary" className="text-xs">
            {part.status || 'Active'}
          </Badge>
        </TableCell>
        
        {/* Actions */}
        {isEditMode && (
          <TableCell>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-7 w-7 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              {onPartDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-7 w-7 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </TableCell>
        )}
      </TableRow>

      {/* Edit Dialog */}
      <EditPartDialog
        part={part}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSave={handleSaveEdit}
        isLoading={isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Part</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{part.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function WorkOrderPartsSection({
  parts,
  isEditMode,
  onPartUpdate,
  onPartDelete,
  onAdd,
  workOrderId,
  isLoading = false
}: WorkOrderPartsSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter for work order level parts (not associated with job lines)
  const workOrderLevelParts = parts.filter(part => !part.job_line_id);

  const handleAddPart = async () => {
    if (onAdd) {
      // For now, just show a placeholder - we'll implement a proper add form later
      console.log('Add part functionality will be implemented');
    }
    setShowAddForm(false);
  };

  const totalPartsValue = workOrderLevelParts.reduce((sum, part) => {
    return sum + ((part.customerPrice || part.unit_price || 0) * (part.quantity || 1));
  }, 0);

  if (workOrderLevelParts.length === 0 && !isEditMode) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Work Order Level Parts
            {workOrderLevelParts.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {workOrderLevelParts.length} parts
              </Badge>
            )}
          </CardTitle>
          {isEditMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Part
            </Button>
          )}
        </div>
        {workOrderLevelParts.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Total Value: <span className="font-medium">${totalPartsValue.toFixed(2)}</span>
          </p>
        )}
      </CardHeader>
      
      {workOrderLevelParts.length > 0 && (
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                {isEditMode && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrderLevelParts.map((part) => (
                <PartRow
                  key={part.id}
                  part={part}
                  isEditMode={isEditMode}
                  onPartUpdate={onPartUpdate}
                  onPartDelete={onPartDelete}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      )}

      {workOrderLevelParts.length === 0 && isEditMode && (
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No work order level parts added yet</p>
            <p className="text-sm">Use the "Add Part" button to add parts directly to this work order</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}