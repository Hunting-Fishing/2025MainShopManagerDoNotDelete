
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Edit, Save, X } from 'lucide-react';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { addWorkOrderPart, updateWorkOrderPart, deleteWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';

interface ComprehensivePartsTableProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsChange: () => Promise<void>;
  isEditMode?: boolean;
}

// Valid part types for database
const VALID_PART_TYPES = ['inventory', 'non-inventory'] as const;
type ValidPartType = typeof VALID_PART_TYPES[number];

// User-friendly part type options
const PART_TYPE_OPTIONS = [
  { label: 'OEM', value: 'inventory' },
  { label: 'Aftermarket', value: 'non-inventory' },
  { label: 'Used', value: 'non-inventory' },
  { label: 'Remanufactured', value: 'inventory' }
] as const;

// Helper functions for part type conversion
const getPartTypeLabel = (value: string): string => {
  const option = PART_TYPE_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
};

const getPartTypeValue = (label: string): ValidPartType => {
  const option = PART_TYPE_OPTIONS.find(opt => opt.label === label);
  return option ? option.value : 'non-inventory';
};

const calculateTotal = (quantity: number, unitPrice: number): number => {
  return quantity * unitPrice;
};

export function ComprehensivePartsTable({
  workOrderId,
  parts,
  jobLines,
  onPartsChange,
  isEditMode = false
}: ComprehensivePartsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newPart, setNewPart] = useState<Partial<WorkOrderPartFormValues>>({
    name: '',
    part_number: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    status: 'pending',
    notes: '',
    partType: 'non-inventory'
  });

  const handleAddPart = () => {
    setIsAdding(true);
    setNewPart({
      name: '',
      part_number: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      status: 'pending',
      notes: '',
      partType: 'non-inventory'
    });
  };

  const handleSave = async (formData: WorkOrderPartFormValues) => {
    try {
      console.log('Saving part with data:', formData);
      
      // Convert user-friendly part type to database value
      const partTypeValue = formData.partType ? getPartTypeValue(formData.partType) : 'non-inventory';
      
      const partData = {
        work_order_id: workOrderId,
        name: formData.name,
        part_number: formData.part_number,
        description: formData.description || '',
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        status: formData.status || 'pending',
        notes: formData.notes || '',
        partType: partTypeValue,
        job_line_id: formData.job_line_id
      };

      await addWorkOrderPart(partData);
      
      toast.success('Part added successfully');
      await onPartsChange();
      setIsAdding(false);
      setNewPart({
        name: '',
        part_number: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        status: 'pending',
        notes: '',
        partType: 'non-inventory'
      });
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error(`Failed to add part: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdate = async (id: string, formData: WorkOrderPartFormValues) => {
    try {
      console.log('Updating part with data:', formData);
      
      // Convert user-friendly part type to database value
      const partTypeValue = formData.partType ? getPartTypeValue(formData.partType) : 'non-inventory';
      
      const updateData = {
        name: formData.name,
        part_number: formData.part_number,
        description: formData.description || '',
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        status: formData.status || 'pending',
        notes: formData.notes || '',
        partType: partTypeValue,
        job_line_id: formData.job_line_id
      };

      await updateWorkOrderPart(id, updateData);
      
      toast.success('Part updated successfully');
      await onPartsChange();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating part:', error);
      toast.error(`Failed to update part: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkOrderPart(id);
      toast.success('Part deleted successfully');
      await onPartsChange();
    } catch (error) {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewPart({
      name: '',
      part_number: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      status: 'pending',
      notes: '',
      partType: 'non-inventory'
    });
  };

  if (!isEditMode && parts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No parts assigned to this work order.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Parts & Materials</CardTitle>
        {isEditMode && (
          <Button onClick={handleAddPart} size="sm" disabled={isAdding}>
            <Plus className="h-4 w-4 mr-2" />
            Add Part
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Part Number</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              {isEditMode && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.map((part) => (
              <PartRow
                key={part.id}
                part={part}
                jobLines={jobLines}
                isEditing={editingId === part.id}
                isEditMode={isEditMode}
                onEdit={() => setEditingId(part.id)}
                onSave={(formData) => handleUpdate(part.id, formData)}
                onCancel={() => setEditingId(null)}
                onDelete={() => handleDelete(part.id)}
              />
            ))}
            {isAdding && (
              <NewPartRow
                newPart={newPart}
                setNewPart={setNewPart}
                jobLines={jobLines}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            )}
          </TableBody>
        </Table>

        {parts.length === 0 && !isAdding && (
          <div className="text-center py-8 text-muted-foreground">
            No parts assigned to this work order.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface PartRowProps {
  part: WorkOrderPart;
  jobLines: WorkOrderJobLine[];
  isEditing: boolean;
  isEditMode: boolean;
  onEdit: () => void;
  onSave: (formData: WorkOrderPartFormValues) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function PartRow({ part, jobLines, isEditing, isEditMode, onEdit, onSave, onCancel, onDelete }: PartRowProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    name: part.name,
    part_number: part.part_number,
    description: part.description || '',
    quantity: part.quantity,
    unit_price: part.unit_price,
    status: part.status || 'pending',
    notes: part.notes || '',
    partType: getPartTypeLabel(part.partType || 'non-inventory'),
    job_line_id: part.job_line_id
  });

  if (isEditing && isEditMode) {
    return (
      <TableRow>
        <TableCell>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Part name"
          />
        </TableCell>
        <TableCell>
          <Input
            value={formData.part_number}
            onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
            placeholder="Part number"
          />
        </TableCell>
        <TableCell>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description"
            className="min-h-[60px]"
          />
        </TableCell>
        <TableCell>
          <Input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            min="1"
          />
        </TableCell>
        <TableCell>
          <Input
            type="number"
            value={formData.unit_price}
            onChange={(e) => setFormData({ ...formData, unit_price: Number(e.target.value) })}
            min="0"
            step="0.01"
          />
        </TableCell>
        <TableCell>
          ${calculateTotal(formData.quantity, formData.unit_price).toFixed(2)}
        </TableCell>
        <TableCell>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="installed">Installed</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <Select
            value={formData.partType}
            onValueChange={(value) => setFormData({ ...formData, partType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PART_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.label} value={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button size="sm" onClick={() => onSave(formData)}>
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{part.name}</TableCell>
      <TableCell>{part.part_number}</TableCell>
      <TableCell>{part.description}</TableCell>
      <TableCell>{part.quantity}</TableCell>
      <TableCell>${part.unit_price.toFixed(2)}</TableCell>
      <TableCell>${part.total_price.toFixed(2)}</TableCell>
      <TableCell>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {part.status}
        </span>
      </TableCell>
      <TableCell>{getPartTypeLabel(part.partType || 'non-inventory')}</TableCell>
      {isEditMode && (
        <TableCell>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}

interface NewPartRowProps {
  newPart: Partial<WorkOrderPartFormValues>;
  setNewPart: React.Dispatch<React.SetStateAction<Partial<WorkOrderPartFormValues>>>;
  jobLines: WorkOrderJobLine[];
  onSave: (formData: WorkOrderPartFormValues) => void;
  onCancel: () => void;
}

function NewPartRow({ newPart, setNewPart, jobLines, onSave, onCancel }: NewPartRowProps) {
  const handleSave = () => {
    if (!newPart.name || !newPart.part_number) {
      toast.error('Name and part number are required');
      return;
    }

    const formData: WorkOrderPartFormValues = {
      name: newPart.name,
      part_number: newPart.part_number,
      description: newPart.description || '',
      quantity: newPart.quantity || 1,
      unit_price: newPart.unit_price || 0,
      status: newPart.status || 'pending',
      notes: newPart.notes || '',
      partType: newPart.partType || 'non-inventory',
      job_line_id: newPart.job_line_id
    };

    onSave(formData);
  };

  return (
    <TableRow>
      <TableCell>
        <Input
          value={newPart.name || ''}
          onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
          placeholder="Part name"
        />
      </TableCell>
      <TableCell>
        <Input
          value={newPart.part_number || ''}
          onChange={(e) => setNewPart({ ...newPart, part_number: e.target.value })}
          placeholder="Part number"
        />
      </TableCell>
      <TableCell>
        <Textarea
          value={newPart.description || ''}
          onChange={(e) => setNewPart({ ...newPart, description: e.target.value })}
          placeholder="Description"
          className="min-h-[60px]"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={newPart.quantity || 1}
          onChange={(e) => setNewPart({ ...newPart, quantity: Number(e.target.value) })}
          min="1"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={newPart.unit_price || 0}
          onChange={(e) => setNewPart({ ...newPart, unit_price: Number(e.target.value) })}
          min="0"
          step="0.01"
        />
      </TableCell>
      <TableCell>
        ${calculateTotal(newPart.quantity || 1, newPart.unit_price || 0).toFixed(2)}
      </TableCell>
      <TableCell>
        <Select
          value={newPart.status || 'pending'}
          onValueChange={(value) => setNewPart({ ...newPart, status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="ordered">Ordered</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="installed">Installed</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select
          value={newPart.partType || 'non-inventory'}
          onValueChange={(value) => setNewPart({ ...newPart, partType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PART_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.label} value={option.label}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
