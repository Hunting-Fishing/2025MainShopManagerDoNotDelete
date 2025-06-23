
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
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

export function ComprehensivePartsTable({
  workOrderId,
  parts,
  jobLines,
  onPartsChange,
  isEditMode = false
}: ComprehensivePartsTableProps) {
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Partial<WorkOrderPartFormValues>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPartValues, setNewPartValues] = useState<WorkOrderPartFormValues>({
    name: '',
    part_number: '',
    quantity: 1,
    unit_price: 0,
    description: '',
    status: 'pending',
    category: '',
    supplierName: '',
    partType: 'OEM',
    isTaxable: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (part: WorkOrderPart) => {
    setEditingPartId(part.id);
    setEditingValues({
      name: part.name,
      part_number: part.part_number,
      quantity: part.quantity,
      unit_price: part.unit_price,
      description: part.description,
      status: part.status,
      category: part.category,
      supplierName: part.supplierName,
      partType: part.partType,
      job_line_id: part.job_line_id || undefined,
      isTaxable: part.isTaxable
    });
  };

  const handleSave = async (partId: string) => {
    try {
      setIsLoading(true);
      await updateWorkOrderPart(partId, editingValues);
      setEditingPartId(null);
      setEditingValues({});
      await onPartsChange();
      toast.success('Part updated successfully');
    } catch (error) {
      console.error('Error updating part:', error);
      toast.error('Failed to update part');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingPartId(null);
    setEditingValues({});
  };

  const handleDelete = async (partId: string) => {
    if (!confirm('Are you sure you want to delete this part?')) return;
    
    try {
      setIsLoading(true);
      await deleteWorkOrderPart(partId);
      await onPartsChange();
      toast.success('Part deleted successfully');
    } catch (error) {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = async () => {
    try {
      setIsLoading(true);
      await createWorkOrderPart(newPartValues, workOrderId);
      setIsAddingNew(false);
      setNewPartValues({
        name: '',
        part_number: '',
        quantity: 1,
        unit_price: 0,
        description: '',
        status: 'pending',
        category: '',
        supplierName: '',
        partType: 'OEM',
        isTaxable: true
      });
      await onPartsChange();
      toast.success('Part added successfully');
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error('Failed to add part');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEditableCell = (
    value: string | number,
    field: keyof WorkOrderPartFormValues,
    type: 'text' | 'number' | 'select' = 'text',
    options?: { value: string; label: string }[]
  ) => {
    if (type === 'select' && options) {
      return (
        <Select 
          value={String(editingValues[field] || value)} 
          onValueChange={(newValue) => setEditingValues(prev => ({ ...prev, [field]: newValue }))}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        type={type}
        value={editingValues[field] !== undefined ? editingValues[field] : value}
        onChange={(e) => {
          const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
          setEditingValues(prev => ({ ...prev, [field]: newValue }));
        }}
        className="h-8"
      />
    );
  };

  const renderAddNewRow = () => {
    if (!isAddingNew) return null;

    return (
      <TableRow>
        <TableCell>
          <Input
            placeholder="Part name"
            value={newPartValues.name}
            onChange={(e) => setNewPartValues(prev => ({ ...prev, name: e.target.value }))}
            className="h-8"
          />
        </TableCell>
        <TableCell>
          <Input
            placeholder="Part number"
            value={newPartValues.part_number}
            onChange={(e) => setNewPartValues(prev => ({ ...prev, part_number: e.target.value }))}
            className="h-8"
          />
        </TableCell>
        <TableCell>
          <Input
            type="number"
            value={newPartValues.quantity}
            onChange={(e) => setNewPartValues(prev => ({ ...prev, quantity: Number(e.target.value) }))}
            className="h-8"
          />
        </TableCell>
        <TableCell>
          <Input
            type="number"
            step="0.01"
            value={newPartValues.unit_price}
            onChange={(e) => setNewPartValues(prev => ({ ...prev, unit_price: Number(e.target.value) }))}
            className="h-8"
          />
        </TableCell>
        <TableCell>
          ${(newPartValues.quantity * newPartValues.unit_price).toFixed(2)}
        </TableCell>
        <TableCell>
          <Select 
            value={newPartValues.status} 
            onValueChange={(value) => setNewPartValues(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="installed">Installed</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <Select 
            value={newPartValues.job_line_id || "none"} 
            onValueChange={(value) => setNewPartValues(prev => ({ 
              ...prev, 
              job_line_id: value === "none" ? undefined : value 
            }))}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No job line</SelectItem>
              {jobLines.map(jobLine => (
                <SelectItem key={jobLine.id} value={jobLine.id}>
                  {jobLine.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <Input
            placeholder="Supplier"
            value={newPartValues.supplierName || ''}
            onChange={(e) => setNewPartValues(prev => ({ ...prev, supplierName: e.target.value }))}
            className="h-8"
          />
        </TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Button size="sm" onClick={handleAddNew} disabled={isLoading}>
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsAddingNew(false)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'ordered', label: 'Ordered' },
    { value: 'received', label: 'Received' },
    { value: 'installed', label: 'Installed' },
    { value: 'returned', label: 'Returned' }
  ];

  return (
    <div className="space-y-4">
      {isEditMode && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Parts & Materials</h3>
          <Button
            onClick={() => setIsAddingNew(true)}
            disabled={isAddingNew || isLoading}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Part
          </Button>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part Name</TableHead>
              <TableHead>Part Number</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Job Line</TableHead>
              <TableHead>Supplier</TableHead>
              {isEditMode && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderAddNewRow()}
            {parts.map((part) => {
              const isEditing = editingPartId === part.id;
              const assignedJobLine = jobLines.find(jl => jl.id === part.job_line_id);
              
              return (
                <TableRow key={part.id}>
                  <TableCell>
                    {isEditing ? (
                      renderEditableCell(part.name, 'name')
                    ) : (
                      <div>
                        <div className="font-medium">{part.name}</div>
                        {part.description && (
                          <div className="text-sm text-muted-foreground">{part.description}</div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? 
                      renderEditableCell(part.part_number, 'part_number') : 
                      part.part_number
                    }
                  </TableCell>
                  <TableCell>
                    {isEditing ? 
                      renderEditableCell(part.quantity, 'quantity', 'number') : 
                      part.quantity
                    }
                  </TableCell>
                  <TableCell>
                    {isEditing ? 
                      renderEditableCell(part.unit_price, 'unit_price', 'number') : 
                      `$${part.unit_price.toFixed(2)}`
                    }
                  </TableCell>
                  <TableCell>
                    ${part.total_price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      renderEditableCell(part.status || 'pending', 'status', 'select', statusOptions)
                    ) : (
                      <Badge variant="outline">{part.status || 'pending'}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Select 
                        value={editingValues.job_line_id || part.job_line_id || "none"} 
                        onValueChange={(value) => setEditingValues(prev => ({ 
                          ...prev, 
                          job_line_id: value === "none" ? undefined : value 
                        }))}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No job line</SelectItem>
                          {jobLines.map(jobLine => (
                            <SelectItem key={jobLine.id} value={jobLine.id}>
                              {jobLine.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      assignedJobLine ? (
                        <Badge variant="secondary" className="text-xs">
                          {assignedJobLine.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Unassigned</span>
                      )
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? 
                      renderEditableCell(part.supplierName || '', 'supplierName') : 
                      (part.supplierName || '-')
                    }
                  </TableCell>
                  {isEditMode && (
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => handleSave(part.id)} disabled={isLoading}>
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(part)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(part.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={isLoading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {parts.length === 0 && !isAddingNew && (
              <TableRow>
                <TableCell colSpan={isEditMode ? 9 : 8} className="text-center py-8 text-muted-foreground">
                  No parts added yet. {isEditMode && 'Click "Add Part" to get started.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {parts.length > 0 && (
        <div className="flex justify-end">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Parts Value</div>
            <div className="text-lg font-semibold">
              ${parts.reduce((sum, part) => sum + part.total_price, 0).toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
