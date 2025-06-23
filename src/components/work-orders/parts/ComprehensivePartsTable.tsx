
import React, { useState, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Save, X, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { WorkOrderPart, WORK_ORDER_PART_STATUSES } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { createWorkOrderPart, updateWorkOrderPart, deleteWorkOrderPart } from '@/services/workOrder';

interface ComprehensivePartsTableProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsChange: () => Promise<void>;
  isEditMode?: boolean;
}

interface EditablePart extends Omit<WorkOrderPart, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
  isNew?: boolean;
  isEditing?: boolean;
}

// Helper functions to convert between display values and database values
const convertToDisplayValue = (value: string | null | undefined): string => {
  return value || 'none';
};

const convertToDatabaseValue = (value: string): string | null => {
  return value === 'none' ? null : value;
};

const convertBooleanToDisplayValue = (value: boolean | null | undefined): string => {
  if (value === null || value === undefined) return 'none';
  return value ? 'true' : 'false';
};

const convertDisplayToBoolean = (value: string): boolean | null => {
  if (value === 'none') return null;
  return value === 'true';
};

export function ComprehensivePartsTable({
  workOrderId,
  parts,
  jobLines,
  onPartsChange,
  isEditMode = false
}: ComprehensivePartsTableProps) {
  const [editableParts, setEditableParts] = useState<EditablePart[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const initializeNewPart = (): EditablePart => ({
    work_order_id: workOrderId,
    job_line_id: null,
    part_number: '',
    name: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    status: 'pending',
    notes: '',
    isNew: true,
    isEditing: true
  });

  const handleAddNew = () => {
    if (!isAddingNew) {
      const newPart = initializeNewPart();
      setEditableParts([newPart]);
      setIsAddingNew(true);
    }
  };

  const handleEdit = (part: WorkOrderPart) => {
    const editablePart: EditablePart = {
      ...part,
      isEditing: true
    };
    setEditableParts([editablePart]);
  };

  const handleCancel = () => {
    setEditableParts([]);
    setIsAddingNew(false);
  };

  const handleSave = async (part: EditablePart) => {
    try {
      if (!part.name?.trim() || !part.part_number?.trim()) {
        toast.error('Part name and part number are required');
        return;
      }

      // Convert display values back to database values
      const partData = {
        name: part.name.trim(),
        part_number: part.part_number.trim(),
        description: part.description || '',
        quantity: Number(part.quantity) || 1,
        unit_price: Number(part.unit_price) || 0,
        status: part.status || 'pending',
        notes: part.notes || '',
        job_line_id: convertToDatabaseValue(part.job_line_id as string),
        category: part.category || '',
        supplierName: part.supplierName || '',
        partType: part.partType || 'OEM',
        isTaxable: convertDisplayToBoolean(part.isTaxable as any) ?? true,
        coreChargeApplied: convertDisplayToBoolean(part.coreChargeApplied as any) ?? false,
        isStockItem: convertDisplayToBoolean(part.isStockItem as any) ?? false,
        supplierCost: Number(part.supplierCost) || 0,
        retailPrice: Number(part.retailPrice) || 0,
        markupPercentage: Number(part.markupPercentage) || 0,
        coreChargeAmount: Number(part.coreChargeAmount) || 0,
        warrantyDuration: part.warrantyDuration || '',
        invoiceNumber: part.invoiceNumber || '',
        poLine: part.poLine || ''
      };

      if (part.isNew) {
        await createWorkOrderPart(partData, workOrderId);
        toast.success('Part added successfully');
      } else if (part.id) {
        await updateWorkOrderPart(part.id, partData);
        toast.success('Part updated successfully');
      }

      await onPartsChange();
      handleCancel();
    } catch (error) {
      console.error('Error saving part:', error);
      toast.error(part.isNew ? 'Failed to add part' : 'Failed to update part');
    }
  };

  const handleDelete = async (partId: string) => {
    if (!window.confirm('Are you sure you want to delete this part?')) {
      return;
    }

    try {
      await deleteWorkOrderPart(partId);
      toast.success('Part deleted successfully');
      await onPartsChange();
    } catch (error) {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    }
  };

  const handleFieldChange = (index: number, field: string, value: string | number) => {
    setEditableParts(prev => prev.map((part, i) => {
      if (i === index) {
        const updatedPart = { ...part, [field]: value };
        
        // Recalculate total price when quantity or unit_price changes
        if (field === 'quantity' || field === 'unit_price') {
          const quantity = field === 'quantity' ? Number(value) : Number(part.quantity);
          const unitPrice = field === 'unit_price' ? Number(value) : Number(part.unit_price);
          updatedPart.total_price = quantity * unitPrice;
        }
        
        return updatedPart;
      }
      return part;
    }));
  };

  // Job line options with safe values
  const jobLineOptions = [
    { value: 'none', label: 'No job line' },
    ...jobLines.map(jobLine => ({
      value: jobLine.id,
      label: `${jobLine.name}${jobLine.category ? ` (${jobLine.category})` : ''}`
    }))
  ];

  // Status options
  const statusOptions = WORK_ORDER_PART_STATUSES.map(status => ({
    value: status,
    label: status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }));

  // Boolean options for various fields
  const booleanOptions = [
    { value: 'none', label: 'Not set' },
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' }
  ];

  const renderEditableRow = (part: EditablePart, index: number) => (
    <TableRow key={`editable-${index}`} className="bg-blue-50">
      <TableCell>
        <Input
          value={part.part_number}
          onChange={(e) => handleFieldChange(index, 'part_number', e.target.value)}
          placeholder="Part number"
          className="w-full"
        />
      </TableCell>
      <TableCell>
        <Input
          value={part.name}
          onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
          placeholder="Part name"
          className="w-full"
        />
      </TableCell>
      <TableCell>
        <Textarea
          value={part.description || ''}
          onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
          placeholder="Description"
          className="w-full min-h-[60px]"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={part.quantity}
          onChange={(e) => handleFieldChange(index, 'quantity', Number(e.target.value))}
          min="1"
          className="w-20"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="0.01"
          value={part.unit_price}
          onChange={(e) => handleFieldChange(index, 'unit_price', Number(e.target.value))}
          min="0"
          className="w-24"
        />
      </TableCell>
      <TableCell>
        <span className="font-medium">
          ${(part.total_price || 0).toFixed(2)}
        </span>
      </TableCell>
      <TableCell>
        <Select
          value={convertToDisplayValue(part.job_line_id as string)}
          onValueChange={(value) => handleFieldChange(index, 'job_line_id', convertToDatabaseValue(value) || '')}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200 shadow-lg z-50">
            {jobLineOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select
          value={part.status || 'pending'}
          onValueChange={(value) => handleFieldChange(index, 'status', value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200 shadow-lg z-50">
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={() => handleSave(part)}
            className="h-8 w-8 p-0"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  const renderDisplayRow = (part: WorkOrderPart) => {
    const jobLine = jobLines.find(jl => jl.id === part.job_line_id);
    
    return (
      <TableRow key={part.id}>
        <TableCell className="font-medium">{part.part_number}</TableCell>
        <TableCell>{part.name}</TableCell>
        <TableCell className="max-w-xs">
          <div className="truncate" title={part.description}>
            {part.description || '-'}
          </div>
        </TableCell>
        <TableCell className="text-center">{part.quantity}</TableCell>
        <TableCell className="text-right">${part.unit_price?.toFixed(2) || '0.00'}</TableCell>
        <TableCell className="text-right font-medium">
          ${part.total_price?.toFixed(2) || '0.00'}
        </TableCell>
        <TableCell>
          {jobLine ? (
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {jobLine.name}
            </span>
          ) : (
            <span className="text-sm text-gray-500">No job line</span>
          )}
        </TableCell>
        <TableCell>
          <span className={`text-xs px-2 py-1 rounded ${
            part.status === 'installed' ? 'bg-green-100 text-green-800' :
            part.status === 'ordered' ? 'bg-blue-100 text-blue-800' :
            part.status === 'received' ? 'bg-purple-100 text-purple-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {part.status?.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ') || 'Pending'}
          </span>
        </TableCell>
        <TableCell>
          {isEditMode && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(part)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(part.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-4">
      {isEditMode && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {parts.length} parts • Total: ${parts.reduce((sum, part) => sum + (part.total_price || 0), 0).toFixed(2)}
          </div>
          <Button
            onClick={handleAddNew}
            disabled={isAddingNew || editableParts.length > 0}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Part
          </Button>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Job Line</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editableParts.map((part, index) => renderEditableRow(part, index))}
            {parts.map(part => renderDisplayRow(part))}
            {parts.length === 0 && editableParts.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No parts added to this work order yet.
                  {isEditMode && (
                    <div className="mt-2">
                      <Button onClick={handleAddNew} size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Part
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
