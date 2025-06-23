
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit2, Plus, Save, X } from 'lucide-react';
import { WorkOrderPart, WorkOrderPartFormValues, partStatusMap } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { createWorkOrderPart, updateWorkOrderPart, deleteWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';
import { useSuppliers } from '@/hooks/inventory/useSuppliers';

interface ComprehensivePartsTableProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsChange: () => Promise<void>;
  isEditMode?: boolean;
}

// User-friendly part type options mapped to database values
const PART_TYPE_OPTIONS = [
  { label: 'OEM', value: 'inventory' },
  { label: 'Aftermarket', value: 'non-inventory' },
  { label: 'Used', value: 'non-inventory' },
  { label: 'Remanufactured', value: 'inventory' }
];

// Helper functions to convert between display and database values
const convertToDisplayValue = (dbValue: string | boolean | undefined, field: string): string => {
  if (dbValue === undefined || dbValue === null) return 'none';
  
  if (field === 'partType') {
    const option = PART_TYPE_OPTIONS.find(opt => opt.value === dbValue);
    return option ? option.label : 'none';
  }
  
  if (typeof dbValue === 'boolean') {
    return dbValue ? 'true' : 'false';
  }
  
  return String(dbValue);
};

const convertToDatabaseValue = (displayValue: string, field: string): any => {
  if (displayValue === 'none' || displayValue === '') return undefined;
  
  if (field === 'partType') {
    const option = PART_TYPE_OPTIONS.find(opt => opt.label === displayValue);
    return option ? option.value : undefined;
  }
  
  if (field === 'isTaxable' || field === 'coreChargeApplied' || field === 'isStockItem') {
    return displayValue === 'true';
  }
  
  if (field === 'quantity' || field === 'unit_price' || field === 'customerPrice' || 
      field === 'supplierCost' || field === 'retailPrice' || field === 'markupPercentage' || 
      field === 'coreChargeAmount') {
    const num = parseFloat(displayValue);
    return isNaN(num) ? 0 : num;
  }
  
  return displayValue;
};

export function ComprehensivePartsTable({
  workOrderId,
  parts,
  jobLines,
  onPartsChange,
  isEditMode = false
}: ComprehensivePartsTableProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { suppliers } = useSuppliers();

  const [newPart, setNewPart] = useState<WorkOrderPartFormValues>({
    name: '',
    part_number: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    status: 'pending',
    notes: '',
    job_line_id: '',
    category: '',
    customerPrice: 0,
    supplierCost: 0,
    retailPrice: 0,
    markupPercentage: 0,
    isTaxable: false,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    warrantyDuration: '',
    warrantyExpiryDate: '',
    installDate: '',
    installedBy: '',
    invoiceNumber: '',
    poLine: '',
    isStockItem: false,
    supplierName: '',
    supplierOrderRef: '',
    notesInternal: '',
    inventoryItemId: '',
    partType: 'inventory',
    estimatedArrivalDate: '',
    itemStatus: 'pending'
  });

  const [editPart, setEditPart] = useState<WorkOrderPartFormValues | null>(null);

  const resetNewPart = () => {
    setNewPart({
      name: '',
      part_number: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      status: 'pending',
      notes: '',
      job_line_id: '',
      category: '',
      customerPrice: 0,
      supplierCost: 0,
      retailPrice: 0,
      markupPercentage: 0,
      isTaxable: false,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      warrantyDuration: '',
      warrantyExpiryDate: '',
      installDate: '',
      installedBy: '',
      invoiceNumber: '',
      poLine: '',
      isStockItem: false,
      supplierName: '',
      supplierOrderRef: '',
      notesInternal: '',
      inventoryItemId: '',
      partType: 'inventory',
      estimatedArrivalDate: '',
      itemStatus: 'pending'
    });
  };

  const handleSaveNewPart = async () => {
    if (!newPart.name.trim() || !newPart.part_number.trim()) {
      toast.error('Part name and part number are required');
      return;
    }

    setSaving(true);
    try {
      console.log('Saving new part with data:', newPart);
      
      await createWorkOrderPart(workOrderId, {
        ...newPart,
        total_price: newPart.quantity * newPart.unit_price
      });

      toast.success('Part added successfully');
      resetNewPart();
      setIsAddingNew(false);
      await onPartsChange();
    } catch (error) {
      console.error('Error saving part:', error);
      toast.error(`Failed to add part: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEditPart = async () => {
    if (!editPart || !editingPartId) return;

    if (!editPart.name.trim() || !editPart.part_number.trim()) {
      toast.error('Part name and part number are required');
      return;
    }

    setSaving(true);
    try {
      console.log('Updating part with data:', editPart);
      
      await updateWorkOrderPart(editingPartId, {
        ...editPart,
        total_price: editPart.quantity * editPart.unit_price
      });

      toast.success('Part updated successfully');
      setEditingPartId(null);
      setEditPart(null);
      await onPartsChange();
    } catch (error) {
      console.error('Error updating part:', error);
      toast.error(`Failed to update part: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePart = async (partId: string) => {
    if (!confirm('Are you sure you want to delete this part?')) return;

    try {
      await deleteWorkOrderPart(partId);
      toast.success('Part deleted successfully');
      await onPartsChange();
    } catch (error) {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    }
  };

  const startEditPart = (part: WorkOrderPart) => {
    setEditingPartId(part.id);
    setEditPart({
      name: part.name || '',
      part_number: part.part_number || '',
      description: part.description || '',
      quantity: part.quantity || 1,
      unit_price: part.unit_price || 0,
      status: part.status || 'pending',
      notes: part.notes || '',
      job_line_id: part.job_line_id || '',
      category: part.category || '',
      customerPrice: part.customerPrice || 0,
      supplierCost: part.supplierCost || 0,
      retailPrice: part.retailPrice || 0,
      markupPercentage: part.markupPercentage || 0,
      isTaxable: part.isTaxable || false,
      coreChargeAmount: part.coreChargeAmount || 0,
      coreChargeApplied: part.coreChargeApplied || false,
      warrantyDuration: part.warrantyDuration || '',
      warrantyExpiryDate: part.warrantyExpiryDate || '',
      installDate: part.installDate || '',
      installedBy: part.installedBy || '',
      invoiceNumber: part.invoiceNumber || '',
      poLine: part.poLine || '',
      isStockItem: part.isStockItem || false,
      supplierName: part.supplierName || '',
      supplierOrderRef: part.supplierOrderRef || '',
      notesInternal: part.notesInternal || '',
      inventoryItemId: part.inventoryItemId || '',
      partType: part.partType || 'inventory',
      estimatedArrivalDate: part.estimatedArrivalDate || '',
      itemStatus: part.itemStatus || 'pending'
    });
  };

  const cancelEdit = () => {
    setEditingPartId(null);
    setEditPart(null);
  };

  const cancelAdd = () => {
    setIsAddingNew(false);
    resetNewPart();
  };

  const renderFormRow = (
    part: WorkOrderPartFormValues,
    onChange: (field: keyof WorkOrderPartFormValues, value: any) => void,
    isNew: boolean = false
  ) => (
    <TableRow key={isNew ? 'new-part' : 'edit-part'}>
      <TableCell>
        <Input
          value={part.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Part name"
          className="min-w-[150px]"
        />
      </TableCell>
      <TableCell>
        <Input
          value={part.part_number}
          onChange={(e) => onChange('part_number', e.target.value)}
          placeholder="Part number"
          className="min-w-[120px]"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={part.quantity}
          onChange={(e) => onChange('quantity', parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
          className="w-20"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={part.unit_price}
          onChange={(e) => onChange('unit_price', parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
          className="w-24"
        />
      </TableCell>
      <TableCell>
        <span className="font-medium">
          ${(part.quantity * part.unit_price).toFixed(2)}
        </span>
      </TableCell>
      <TableCell>
        <Select
          value={convertToDisplayValue(part.status, 'status')}
          onValueChange={(value) => onChange('status', convertToDatabaseValue(value, 'status'))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="ordered">Ordered</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="installed">Installed</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
            <SelectItem value="backordered">Backordered</SelectItem>
            <SelectItem value="defective">Defective</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select
          value={convertToDisplayValue(part.job_line_id, 'job_line_id')}
          onValueChange={(value) => onChange('job_line_id', convertToDatabaseValue(value, 'job_line_id'))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No job line</SelectItem>
            {jobLines.map((jobLine) => (
              <SelectItem key={jobLine.id} value={jobLine.id}>
                {jobLine.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          value={part.category || ''}
          onChange={(e) => onChange('category', e.target.value)}
          placeholder="Category"
          className="w-28"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={part.customerPrice || 0}
          onChange={(e) => onChange('customerPrice', parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
          className="w-24"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={part.supplierCost || 0}
          onChange={(e) => onChange('supplierCost', parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
          className="w-24"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={part.retailPrice || 0}
          onChange={(e) => onChange('retailPrice', parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
          className="w-24"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={part.markupPercentage || 0}
          onChange={(e) => onChange('markupPercentage', parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
          className="w-20"
        />
      </TableCell>
      <TableCell>
        <Switch
          checked={part.isTaxable || false}
          onCheckedChange={(checked) => onChange('isTaxable', checked)}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={part.coreChargeAmount || 0}
          onChange={(e) => onChange('coreChargeAmount', parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
          className="w-24"
        />
      </TableCell>
      <TableCell>
        <Switch
          checked={part.coreChargeApplied || false}
          onCheckedChange={(checked) => onChange('coreChargeApplied', checked)}
        />
      </TableCell>
      <TableCell>
        <Input
          value={part.warrantyDuration || ''}
          onChange={(e) => onChange('warrantyDuration', e.target.value)}
          placeholder="Duration"
          className="w-24"
        />
      </TableCell>
      <TableCell>
        <Input
          type="date"
          value={part.warrantyExpiryDate || ''}
          onChange={(e) => onChange('warrantyExpiryDate', e.target.value)}
          className="w-32"
        />
      </TableCell>
      <TableCell>
        <Input
          type="date"
          value={part.installDate || ''}
          onChange={(e) => onChange('installDate', e.target.value)}
          className="w-32"
        />
      </TableCell>
      <TableCell>
        <Input
          value={part.installedBy || ''}
          onChange={(e) => onChange('installedBy', e.target.value)}
          placeholder="Installer"
          className="w-28"
        />
      </TableCell>
      <TableCell>
        <Input
          value={part.invoiceNumber || ''}
          onChange={(e) => onChange('invoiceNumber', e.target.value)}
          placeholder="Invoice #"
          className="w-28"
        />
      </TableCell>
      <TableCell>
        <Input
          value={part.poLine || ''}
          onChange={(e) => onChange('poLine', e.target.value)}
          placeholder="PO Line"
          className="w-24"
        />
      </TableCell>
      <TableCell>
        <Switch
          checked={part.isStockItem || false}
          onCheckedChange={(checked) => onChange('isStockItem', checked)}
        />
      </TableCell>
      <TableCell>
        <Select
          value={convertToDisplayValue(part.supplierName, 'supplierName')}
          onValueChange={(value) => onChange('supplierName', convertToDatabaseValue(value, 'supplierName'))}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select supplier</SelectItem>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.name}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          value={part.supplierOrderRef || ''}
          onChange={(e) => onChange('supplierOrderRef', e.target.value)}
          placeholder="Order Ref"
          className="w-28"
        />
      </TableCell>
      <TableCell>
        <Textarea
          value={part.notesInternal || ''}
          onChange={(e) => onChange('notesInternal', e.target.value)}
          placeholder="Internal notes"
          className="w-32 h-12"
          rows={2}
        />
      </TableCell>
      <TableCell>
        <Input
          value={part.inventoryItemId || ''}
          onChange={(e) => onChange('inventoryItemId', e.target.value)}
          placeholder="Inventory ID"
          className="w-32"
        />
      </TableCell>
      <TableCell>
        <Select
          value={convertToDisplayValue(part.partType, 'partType')}
          onValueChange={(value) => onChange('partType', convertToDatabaseValue(value, 'partType'))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select type</SelectItem>
            {PART_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.label}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          type="date"
          value={part.estimatedArrivalDate || ''}
          onChange={(e) => onChange('estimatedArrivalDate', e.target.value)}
          className="w-32"
        />
      </TableCell>
      <TableCell>
        <Select
          value={convertToDisplayValue(part.itemStatus, 'itemStatus')}
          onValueChange={(value) => onChange('itemStatus', convertToDatabaseValue(value, 'itemStatus'))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="ordered">Ordered</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="installed">Installed</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Textarea
          value={part.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Description"
          className="w-40 h-12"
          rows={2}
        />
      </TableCell>
      <TableCell>
        <Textarea
          value={part.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="Notes"
          className="w-32 h-12"
          rows={2}
        />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={isNew ? handleSaveNewPart : handleSaveEditPart}
            disabled={saving}
            className="h-8"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={isNew ? cancelAdd : cancelEdit}
            disabled={saving}
            className="h-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Comprehensive Parts Management</CardTitle>
        {isEditMode && (
          <Button
            onClick={() => setIsAddingNew(true)}
            disabled={isAddingNew}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Part
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name*</TableHead>
                <TableHead>Part Number*</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Job Line</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Customer Price</TableHead>
                <TableHead>Supplier Cost</TableHead>
                <TableHead>Retail Price</TableHead>
                <TableHead>Markup %</TableHead>
                <TableHead>Taxable</TableHead>
                <TableHead>Core Charge</TableHead>
                <TableHead>Core Applied</TableHead>
                <TableHead>Warranty</TableHead>
                <TableHead>Warranty Expiry</TableHead>
                <TableHead>Install Date</TableHead>
                <TableHead>Installed By</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>PO Line</TableHead>
                <TableHead>Stock Item</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Supplier Order</TableHead>
                <TableHead>Internal Notes</TableHead>
                <TableHead>Inventory ID</TableHead>
                <TableHead>Part Type</TableHead>
                <TableHead>Est. Arrival</TableHead>
                <TableHead>Item Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.map((part) => (
                editingPartId === part.id ? (
                  renderFormRow(
                    editPart!,
                    (field, value) => setEditPart(prev => prev ? { ...prev, [field]: value } : null)
                  )
                ) : (
                  <TableRow key={part.id}>
                    <TableCell className="font-medium">{part.name}</TableCell>
                    <TableCell>{part.part_number}</TableCell>
                    <TableCell>{part.quantity}</TableCell>
                    <TableCell>${part.unit_price?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell className="font-medium">${part.total_price?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      {part.status && partStatusMap[part.status] ? (
                        <Badge className={partStatusMap[part.status].classes}>
                          {partStatusMap[part.status].label}
                        </Badge>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>{jobLines.find(jl => jl.id === part.job_line_id)?.name || '-'}</TableCell>
                    <TableCell>{part.category || '-'}</TableCell>
                    <TableCell>${part.customerPrice?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>${part.supplierCost?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>${part.retailPrice?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>{part.markupPercentage || 0}%</TableCell>
                    <TableCell>{part.isTaxable ? 'Yes' : 'No'}</TableCell>
                    <TableCell>${part.coreChargeAmount?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>{part.coreChargeApplied ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{part.warrantyDuration || '-'}</TableCell>
                    <TableCell>{part.warrantyExpiryDate || '-'}</TableCell>
                    <TableCell>{part.installDate || '-'}</TableCell>
                    <TableCell>{part.installedBy || '-'}</TableCell>
                    <TableCell>{part.invoiceNumber || '-'}</TableCell>
                    <TableCell>{part.poLine || '-'}</TableCell>
                    <TableCell>{part.isStockItem ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{part.supplierName || '-'}</TableCell>
                    <TableCell>{part.supplierOrderRef || '-'}</TableCell>
                    <TableCell className="max-w-32 truncate">{part.notesInternal || '-'}</TableCell>
                    <TableCell>{part.inventoryItemId || '-'}</TableCell>
                    <TableCell>
                      {part.partType ? (
                        PART_TYPE_OPTIONS.find(opt => opt.value === part.partType)?.label || part.partType
                      ) : '-'}
                    </TableCell>
                    <TableCell>{part.estimatedArrivalDate || '-'}</TableCell>
                    <TableCell>{part.itemStatus || '-'}</TableCell>
                    <TableCell className="max-w-40 truncate">{part.description || '-'}</TableCell>
                    <TableCell className="max-w-32 truncate">{part.notes || '-'}</TableCell>
                    <TableCell>
                      {isEditMode && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditPart(part)}
                            disabled={editingPartId !== null || isAddingNew}
                            className="h-8"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePart(part.id)}
                            disabled={editingPartId !== null || isAddingNew}
                            className="h-8 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              ))}
              {isAddingNew && renderFormRow(
                newPart,
                (field, value) => setNewPart(prev => ({ ...prev, [field]: value })),
                true
              )}
            </TableBody>
          </Table>
        </div>

        {parts.length === 0 && !isAddingNew && (
          <div className="text-center py-8 text-gray-500">
            No parts added yet. {isEditMode && 'Click "Add Part" to get started.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
