import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Check, X } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { PartDetailsCard } from '../parts/PartDetailsCard';
import { formatCurrency } from '@/utils/formatters';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  onUpdate?: (updatedJobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  isEditMode?: boolean;
}

export function JobLineCard({
  jobLine,
  onUpdate,
  onDelete,
  isEditMode = false
}: JobLineCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedJobLine, setEditedJobLine] = useState<WorkOrderJobLine>(jobLine);
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [newPart, setNewPart] = useState<WorkOrderPartFormValues>({
    part_number: '',
    name: '',
    quantity: 1,
    unit_price: 0
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit
      setEditedJobLine(jobLine);
    } else {
      // Start edit
      setEditedJobLine({ ...jobLine });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedJobLine);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete && jobLine.id) {
      onDelete(jobLine.id);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedJobLine({
      ...editedJobLine,
      [name]: value
    });
  };

  const handleNewPartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPart({
      ...newPart,
      [name]: name === 'quantity' || name === 'unit_price' ? parseFloat(value) || 0 : value
    });
  };

  const handleAddPart = async () => {
    if (!newPart.name || !newPart.part_number) {
      toast.error('Part name and part number are required');
      return;
    }

    try {
      const partToAdd: WorkOrderPartFormValues & { work_order_id: string; job_line_id: string } = {
        ...newPart,
        work_order_id: jobLine.work_order_id,
        job_line_id: jobLine.id || ''
      };

      const addedPart = await createWorkOrderPart(partToAdd);

      // Update the job line with the new part
      const updatedJobLine = {
        ...jobLine,
        parts: [...(jobLine.parts || []), addedPart]
      };

      if (onUpdate) {
        onUpdate(updatedJobLine);
      }

      // Reset form
      setNewPart({
        part_number: '',
        name: '',
        quantity: 1,
        unit_price: 0
      });
      setIsAddingPart(false);
      toast.success('Part added successfully');
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error('Failed to add part');
    }
  };

  const handleRemovePart = (partId: string) => {
    const updatedParts = jobLine.parts?.filter(p => p.id !== partId) || [];
    const updatedJobLine = {
      ...jobLine,
      parts: updatedParts
    };
    
    if (onUpdate) {
      onUpdate(updatedJobLine);
    }
  };

  const calculateTotalAmount = () => {
    let laborTotal = 0;
    if (jobLine.estimated_hours && jobLine.labor_rate) {
      laborTotal = jobLine.estimated_hours * jobLine.labor_rate;
    }

    let partsTotal = 0;
    if (jobLine.parts && jobLine.parts.length > 0) {
      partsTotal = jobLine.parts.reduce((sum, part) => {
        return sum + (part.total_price || 0);
      }, 0);
    }

    return laborTotal + partsTotal;
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        {/* Header with name and actions */}
        <div className="flex justify-between items-start mb-3">
          <div>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editedJobLine.name}
                onChange={handleInputChange}
                className="border p-1 rounded w-full"
              />
            ) : (
              <h3 className="font-medium text-lg">{jobLine.name}</h3>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{jobLine.status || 'Pending'}</Badge>
              {jobLine.category && (
                <span className="text-xs text-muted-foreground">{jobLine.category}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isEditMode && !isEditing && (
              <>
                <Button variant="ghost" size="sm" onClick={handleEditToggle}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </>
            )}
            {isEditing && (
              <>
                <Button variant="ghost" size="sm" onClick={handleSave}>
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleEditToggle}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {isEditing ? (
          <textarea
            name="description"
            value={editedJobLine.description || ''}
            onChange={handleInputChange}
            className="border p-2 rounded w-full mb-3"
            rows={2}
          />
        ) : (
          jobLine.description && (
            <p className="text-sm text-muted-foreground mb-3">{jobLine.description}</p>
          )
        )}

        {/* Labor details */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Hours</p>
            {isEditing ? (
              <input
                type="number"
                name="estimated_hours"
                value={editedJobLine.estimated_hours || ''}
                onChange={handleInputChange}
                className="border p-1 rounded w-full"
              />
            ) : (
              <p>{jobLine.estimated_hours || 0}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rate</p>
            {isEditing ? (
              <input
                type="number"
                name="labor_rate"
                value={editedJobLine.labor_rate || ''}
                onChange={handleInputChange}
                className="border p-1 rounded w-full"
              />
            ) : (
              <p>{formatCurrency(jobLine.labor_rate || 0)}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-medium">{formatCurrency(calculateTotalAmount())}</p>
          </div>
        </div>

        {/* Parts section */}
        {(jobLine.parts && jobLine.parts.length > 0) || isEditMode ? (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Parts</h4>
              {isEditMode && !isAddingPart && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingPart(true)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Part
                </Button>
              )}
            </div>

            {/* Add new part form */}
            {isAddingPart && (
              <div className="bg-muted p-3 rounded mb-3">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="text-xs">Part Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newPart.name}
                      onChange={handleNewPartChange}
                      className="border p-1 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs">Part Number</label>
                    <input
                      type="text"
                      name="part_number"
                      value={newPart.part_number}
                      onChange={handleNewPartChange}
                      className="border p-1 rounded w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="text-xs">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={newPart.quantity}
                      onChange={handleNewPartChange}
                      className="border p-1 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs">Unit Price</label>
                    <input
                      type="number"
                      name="unit_price"
                      value={newPart.unit_price}
                      onChange={handleNewPartChange}
                      className="border p-1 rounded w-full"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingPart(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAddPart}
                  >
                    Add Part
                  </Button>
                </div>
              </div>
            )}

            {/* Parts list */}
            <div className="space-y-2">
              {jobLine.parts
                ?.filter((part): part is WorkOrderPart => 
                  typeof part === 'object' &&
                  'id' in part &&
                  'created_at' in part &&
                  'updated_at' in part &&
                  'total_price' in part
                )
                .map((part) => (
                  <PartDetailsCard
                    key={part.id}
                    part={part}
                    onRemove={isEditMode ? handleRemovePart : undefined}
                    isEditMode={isEditMode}
                  />
                ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
