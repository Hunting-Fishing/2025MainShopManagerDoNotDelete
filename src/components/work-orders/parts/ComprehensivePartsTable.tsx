
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit3, Save, X } from 'lucide-react';
import { WorkOrderPart, WorkOrderPartFormValues, WORK_ORDER_PART_STATUSES } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { createWorkOrderPart, updateWorkOrderPart, deleteWorkOrderPart } from '@/services/workOrder';
import { toast } from 'sonner';

interface ComprehensivePartsTableProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsChange: () => Promise<void>;
  isEditMode?: boolean;
}

interface EditingPart extends WorkOrderPartFormValues {
  id?: string;
}

export function ComprehensivePartsTable({
  workOrderId,
  parts,
  jobLines,
  onPartsChange,
  isEditMode = false
}: ComprehensivePartsTableProps) {
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [editingPart, setEditingPart] = useState<EditingPart | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPart, setNewPart] = useState<EditingPart>({
    name: '',
    part_number: '',
    quantity: 1,
    unit_price: 0,
    description: '',
    status: 'pending',
    job_line_id: '',
    category: '',
    supplierName: '',
    isTaxable: true
  });

  const handleEdit = (part: WorkOrderPart) => {
    setEditingPartId(part.id);
    setEditingPart({
      name: part.name,
      part_number: part.part_number,
      quantity: part.quantity,
      unit_price: part.unit_price,
      description: part.description || '',
      status: part.status || 'pending',
      job_line_id: part.job_line_id || '',
      category: part.category || '',
      supplierName: part.supplierName || '',
      isTaxable: part.isTaxable !== undefined ? part.isTaxable : true
    });
  };

  const handleSave = async (partId: string) => {
    if (!editingPart) return;

    try {
      await updateWorkOrderPart(partId, editingPart);
      toast.success('Part updated successfully');
      setEditingPartId(null);
      setEditingPart(null);
      await onPartsChange();
    } catch (error) {
      console.error('Error updating part:', error);
      toast.error('Failed to update part');
    }
  };

  const handleCancel = () => {
    setEditingPartId(null);
    setEditingPart(null);
  };

  const handleDelete = async (partId: string) => {
    try {
      await deleteWorkOrderPart(partId);
      toast.success('Part deleted successfully');
      await onPartsChange();
    } catch (error) {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    }
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
  };

  const handleSaveNew = async () => {
    try {
      await createWorkOrderPart(newPart, workOrderId);
      toast.success('Part added successfully');
      setIsAddingNew(false);
      setNewPart({
        name: '',
        part_number: '',
        quantity: 1,
        unit_price: 0,
        description: '',
        status: 'pending',
        job_line_id: '',
        category: '',
        supplierName: '',
        isTaxable: true
      });
      await onPartsChange();
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error('Failed to add part');
    }
  };

  const handleCancelNew = () => {
    setIsAddingNew(false);
    setNewPart({
      name: '',
      part_number: '',
      quantity: 1,
      unit_price: 0,
      description: '',
      status: 'pending',
      job_line_id: '',
      category: '',
      supplierName: '',
      isTaxable: true
    });
  };

  const updateEditingPartField = (field: keyof EditingPart, value: string | number | boolean) => {
    if (editingPart) {
      setEditingPart({ ...editingPart, [field]: value });
    }
  };

  const updateNewPartField = (field: keyof EditingPart, value: string | number | boolean) => {
    setNewPart({ ...newPart, [field]: value });
  };

  const renderEditableCell = (
    part: WorkOrderPart,
    field: keyof EditingPart,
    type: 'text' | 'number' | 'select' | 'checkbox' = 'text',
    options?: { value: string; label: string }[]
  ) => {
    const isEditing = editingPartId === part.id;
    const currentValue = editingPart?.[field];

    if (!isEditing) {
      if (type === 'checkbox') {
        return (
          <Badge variant={part[field as keyof WorkOrderPart] ? 'default' : 'secondary'}>
            {part[field as keyof WorkOrderPart] ? 'Yes' : 'No'}
          </Badge>
        );
      }
      return <span>{part[field as keyof WorkOrderPart] || '-'}</span>;
    }

    if (type === 'select' && options) {
      return (
        <Select
          value={String(currentValue || '')}
          onValueChange={(value) => updateEditingPartField(field, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (type === 'checkbox') {
      return (
        <Select
          value={String(currentValue)}
          onValueChange={(value) => updateEditingPartField(field, value === 'true')}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        type={type}
        value={String(currentValue || '')}
        onChange={(e) => {
          const value = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
          updateEditingPartField(field, value);
        }}
        className="w-full"
      />
    );
  };

  const renderNewPartCell = (
    field: keyof EditingPart,
    type: 'text' | 'number' | 'select' | 'checkbox' = 'text',
    options?: { value: string; label: string }[]
  ) => {
    const currentValue = newPart[field];

    if (type === 'select' && options) {
      return (
        <Select
          value={String(currentValue || '')}
          onValueChange={(value) => updateNewPartField(field, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (type === 'checkbox') {
      return (
        <Select
          value={String(currentValue)}
          onValueChange={(value) => updateNewPartField(field, value === 'true')}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        type={type}
        value={String(currentValue || '')}
        onChange={(e) => {
          const value = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
          updateNewPartField(field, value);
        }}
        className="w-full"
        placeholder={`Enter ${field.replace('_', ' ')}`}
      />
    );
  };

  const jobLineOptions = [
    { value: '', label: 'No job line' },
    ...jobLines.map(jl => ({ value: jl.id, label: `${jl.name}${jl.category ? ` (${jl.category})` : ''}` }))
  ];

  const statusOptions = WORK_ORDER_PART_STATUSES.map(status => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1).replace(/[-_]/g, ' ')
  }));

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part Name</TableHead>
              <TableHead>Part Number</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Job Line</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Taxable</TableHead>
              {isEditMode && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.map((part) => (
              <TableRow key={part.id}>
                <TableCell>
                  {renderEditableCell(part, 'name')}
                </TableCell>
                <TableCell>
                  {renderEditableCell(part, 'part_number')}
                </TableCell>
                <TableCell>
                  {renderEditableCell(part, 'quantity', 'number')}
                </TableCell>
                <TableCell>
                  ${renderEditableCell(part, 'unit_price', 'number')}
                </TableCell>
                <TableCell>
                  ${((editingPartId === part.id ? (editingPart?.quantity || 0) * (editingPart?.unit_price || 0) : part.total_price) || 0).toFixed(2)}
                </TableCell>
                <TableCell>
                  {renderEditableCell(part, 'status', 'select', statusOptions)}
                </TableCell>
                <TableCell>
                  {renderEditableCell(part, 'job_line_id', 'select', jobLineOptions)}
                </TableCell>
                <TableCell>
                  {renderEditableCell(part, 'supplierName')}
                </TableCell>
                <TableCell>
                  {renderEditableCell(part, 'isTaxable', 'checkbox')}
                </TableCell>
                {isEditMode && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {editingPartId === part.id ? (
                        <>
                          <Button size="sm" onClick={() => handleSave(part.id)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(part)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(part.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}

            {isAddingNew && (
              <TableRow>
                <TableCell>{renderNewPartCell('name')}</TableCell>
                <TableCell>{renderNewPartCell('part_number')}</TableCell>
                <TableCell>{renderNewPartCell('quantity', 'number')}</TableCell>
                <TableCell>{renderNewPartCell('unit_price', 'number')}</TableCell>
                <TableCell>${(newPart.quantity * newPart.unit_price).toFixed(2)}</TableCell>
                <TableCell>{renderNewPartCell('status', 'select', statusOptions)}</TableCell>
                <TableCell>{renderNewPartCell('job_line_id', 'select', jobLineOptions)}</TableCell>
                <TableCell>{renderNewPartCell('supplierName')}</TableCell>
                <TableCell>{renderNewPartCell('isTaxable', 'checkbox')}</TableCell>
                {isEditMode && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={handleSaveNew}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelNew}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isEditMode && !isAddingNew && (
        <Button onClick={handleAddNew} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Part
        </Button>
      )}

      {parts.length === 0 && !isAddingNew && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No parts added yet.</p>
          {isEditMode && (
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add First Part
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
