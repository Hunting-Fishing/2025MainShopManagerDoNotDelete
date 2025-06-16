
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from '@/hooks/use-toast';

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  onReorderJobLines?: (jobLines: WorkOrderJobLine[]) => void;
  onReorderParts?: (parts: WorkOrderPart[]) => void;
  isEditMode: boolean;
  showType: 'labor' | 'parts';
  workOrderId?: string;
}

export function UnifiedItemsTable({
  jobLines,
  allParts,
  onJobLineUpdate,
  onJobLineDelete,
  onPartUpdate,
  onPartDelete,
  onReorderJobLines,
  onReorderParts,
  isEditMode,
  showType,
  workOrderId
}: UnifiedItemsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>({});
  const [showAddPartForm, setShowAddPartForm] = useState(false);
  const [newPartData, setNewPartData] = useState<WorkOrderPartFormValues>({
    part_number: '',
    name: '',
    unit_price: 0,
    quantity: 1,
    description: '',
    status: 'pending',
    notes: ''
  });

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleEdit = (item: WorkOrderJobLine | WorkOrderPart) => {
    setEditingId(item.id);
    setEditingData({ ...item });
  };

  const handleSave = async (item: WorkOrderJobLine | WorkOrderPart) => {
    try {
      if ('estimated_hours' in item) {
        // It's a job line
        onJobLineUpdate?.(editingData as WorkOrderJobLine);
      } else {
        // It's a part
        onPartUpdate?.(editingData as WorkOrderPart);
      }
      setEditingId(null);
      setEditingData({});
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleDelete = (item: WorkOrderJobLine | WorkOrderPart) => {
    if ('estimated_hours' in item) {
      onJobLineDelete?.(item.id);
    } else {
      onPartDelete?.(item.id);
    }
  };

  const handleAddPart = async () => {
    try {
      if (!workOrderId) {
        toast({
          title: "Error",
          description: "Work Order ID is required to add parts",
          variant: "destructive"
        });
        return;
      }

      console.log('Adding new part:', newPartData);
      
      const partToCreate = {
        work_order_id: workOrderId,
        part_number: newPartData.part_number,
        name: newPartData.name,
        description: newPartData.description || '',
        quantity: newPartData.quantity,
        unit_price: newPartData.unit_price,
        total_price: newPartData.quantity * newPartData.unit_price,
        status: newPartData.status || 'pending',
        notes: newPartData.notes || ''
      };

      const createdPart = await createWorkOrderPart(partToCreate);
      
      toast({
        title: "Success",
        description: "Part added successfully",
      });

      // Reset form
      setNewPartData({
        part_number: '',
        name: '',
        unit_price: 0,
        quantity: 1,
        description: '',
        status: 'pending',
        notes: ''
      });
      setShowAddPartForm(false);

      // Trigger a refresh by calling onPartUpdate with the new part
      if (onPartUpdate) {
        onPartUpdate(createdPart);
      }
    } catch (error) {
      console.error('Error adding part:', error);
      toast({
        title: "Error",
        description: "Failed to add part",
        variant: "destructive"
      });
    }
  };

  const renderJobLineRow = (jobLine: WorkOrderJobLine) => {
    const isEditing = editingId === jobLine.id;
    
    return (
      <div key={jobLine.id} className="border rounded-lg p-4 mb-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isEditMode && <GripVertical className="h-4 w-4 text-gray-400" />}
            <h4 className="font-medium">{jobLine.name}</h4>
            <Badge variant="outline">{jobLine.status}</Badge>
          </div>
          {isEditMode && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={() => handleSave(jobLine)}>Save</Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(jobLine)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(jobLine)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={editingData.name || ''}
                onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={editingData.status || ''}
                onValueChange={(value) => setEditingData({ ...editingData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hours</label>
              <Input
                type="number"
                step="0.5"
                value={editingData.estimated_hours || ''}
                onChange={(e) => setEditingData({ ...editingData, estimated_hours: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rate</label>
              <Input
                type="number"
                step="0.01"
                value={editingData.labor_rate || ''}
                onChange={(e) => setEditingData({ ...editingData, labor_rate: parseFloat(e.target.value) })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Textarea
                value={editingData.notes || ''}
                onChange={(e) => setEditingData({ ...editingData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Category:</span> {jobLine.category}
            </div>
            <div>
              <span className="text-gray-600">Hours:</span> {jobLine.estimated_hours || 0}
            </div>
            <div>
              <span className="text-gray-600">Rate:</span> {formatCurrency(jobLine.labor_rate)}
            </div>
            <div>
              <span className="text-gray-600">Total:</span> {formatCurrency(jobLine.total_amount)}
            </div>
            {jobLine.notes && (
              <div className="col-span-2">
                <span className="text-gray-600">Notes:</span> {jobLine.notes}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderPartRow = (part: WorkOrderPart) => {
    const isEditing = editingId === part.id;
    
    return (
      <div key={part.id} className="border rounded-lg p-4 mb-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isEditMode && <GripVertical className="h-4 w-4 text-gray-400" />}
            <h4 className="font-medium">{part.name}</h4>
            <Badge variant="outline">{part.status}</Badge>
          </div>
          {isEditMode && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={() => handleSave(part)}>Save</Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(part)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(part)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Part Number</label>
              <Input
                value={editingData.part_number || ''}
                onChange={(e) => setEditingData({ ...editingData, part_number: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={editingData.name || ''}
                onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <Input
                type="number"
                value={editingData.quantity || ''}
                onChange={(e) => setEditingData({ ...editingData, quantity: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit Price</label>
              <Input
                type="number"
                step="0.01"
                value={editingData.unit_price || ''}
                onChange={(e) => setEditingData({ ...editingData, unit_price: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={editingData.status || ''}
                onValueChange={(value) => setEditingData({ ...editingData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="installed">Installed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Textarea
                value={editingData.notes || ''}
                onChange={(e) => setEditingData({ ...editingData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Part #:</span> {part.part_number}
            </div>
            <div>
              <span className="text-gray-600">Quantity:</span> {part.quantity}
            </div>
            <div>
              <span className="text-gray-600">Unit Price:</span> {formatCurrency(part.unit_price)}
            </div>
            <div>
              <span className="text-gray-600">Total:</span> {formatCurrency(part.total_price)}
            </div>
            {part.notes && (
              <div className="col-span-2">
                <span className="text-gray-600">Notes:</span> {part.notes}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAddPartForm = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-base">Add New Part</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Part Number *</label>
            <Input
              value={newPartData.part_number}
              onChange={(e) => setNewPartData({ ...newPartData, part_number: e.target.value })}
              placeholder="Enter part number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <Input
              value={newPartData.name}
              onChange={(e) => setNewPartData({ ...newPartData, name: e.target.value })}
              placeholder="Enter part name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity *</label>
            <Input
              type="number"
              min="1"
              value={newPartData.quantity}
              onChange={(e) => setNewPartData({ ...newPartData, quantity: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit Price *</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={newPartData.unit_price}
              onChange={(e) => setNewPartData({ ...newPartData, unit_price: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={newPartData.description || ''}
              onChange={(e) => setNewPartData({ ...newPartData, description: e.target.value })}
              placeholder="Enter part description"
              rows={2}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Textarea
              value={newPartData.notes || ''}
              onChange={(e) => setNewPartData({ ...newPartData, notes: e.target.value })}
              placeholder="Enter any notes"
              rows={2}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setShowAddPartForm(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddPart}
            disabled={!newPartData.part_number || !newPartData.name || !workOrderId}
          >
            Add Part
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (showType === 'labor') {
    return (
      <div>
        {jobLines.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No job lines found
          </div>
        ) : (
          jobLines.map(renderJobLineRow)
        )}
      </div>
    );
  }

  return (
    <div>
      {showAddPartForm && renderAddPartForm()}
      
      {allParts.length === 0 && !showAddPartForm ? (
        <div className="text-center py-8 text-gray-500">
          <p>No parts found</p>
          {isEditMode && (
            <Button 
              className="mt-2" 
              onClick={() => setShowAddPartForm(true)}
              disabled={!workOrderId}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          )}
        </div>
      ) : (
        <>
          {allParts.map(renderPartRow)}
          {isEditMode && !showAddPartForm && (
            <Button 
              className="mt-2" 
              onClick={() => setShowAddPartForm(true)}
              disabled={!workOrderId}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          )}
        </>
      )}
    </div>
  );
}
