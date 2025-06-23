
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Save, X, Edit } from 'lucide-react';
import { WorkOrderPart, WORK_ORDER_PART_STATUSES } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { workOrderPartsService } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';

interface ComprehensivePartsTableProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsChange: () => Promise<void>;
  isEditMode?: boolean;
}

// Convert display values to database values
const convertToDbValue = (value: string | boolean, fieldType: 'string' | 'number' | 'boolean' = 'string') => {
  if (fieldType === 'boolean') {
    return value === 'true' || value === true;
  }
  if (fieldType === 'number') {
    const num = parseFloat(value as string);
    return isNaN(num) ? 0 : num;
  }
  return value === 'none' ? '' : value;
};

// Convert database values to display values  
const convertToDisplayValue = (value: any, fieldType: 'string' | 'number' | 'boolean' = 'string') => {
  if (fieldType === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (fieldType === 'number') {
    return value?.toString() || '0';
  }
  return !value || value === '' ? 'none' : value;
};

const partTypeOptions = [
  { value: 'none', label: 'Select Type' },
  { value: 'OEM', label: 'OEM' },
  { value: 'Aftermarket', label: 'Aftermarket' },
  { value: 'Remanufactured', label: 'Remanufactured' },
  { value: 'Used', label: 'Used' }
];

const categoryOptions = [
  { value: 'none', label: 'Select Category' },
  { value: 'Engine', label: 'Engine' },
  { value: 'Transmission', label: 'Transmission' },
  { value: 'Brakes', label: 'Brakes' },
  { value: 'Suspension', label: 'Suspension' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Body', label: 'Body' },
  { value: 'Interior', label: 'Interior' },
  { value: 'Fluids', label: 'Fluids' },
  { value: 'Filters', label: 'Filters' },
  { value: 'Other', label: 'Other' }
];

export function ComprehensivePartsTable({ 
  workOrderId, 
  parts, 
  jobLines, 
  onPartsChange,
  isEditMode = false 
}: ComprehensivePartsTableProps) {
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPart, setEditingPart] = useState<Partial<WorkOrderPart>>({});

  const jobLineOptions = [
    { value: 'none', label: 'No job line' },
    ...jobLines.map(line => ({ value: line.id, label: line.name }))
  ];

  const statusOptions = [
    { value: 'none', label: 'Select Status' },
    ...WORK_ORDER_PART_STATUSES.map(status => ({ 
      value: status, 
      label: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ') 
    }))
  ];

  const initializeNewPart = () => ({
    name: '',
    part_number: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    customerPrice: 0,
    supplierCost: 0,
    retailPrice: 0,
    markupPercentage: 0,
    job_line_id: 'none',
    status: 'pending',
    category: 'none',
    partType: 'OEM',
    supplierName: '',
    supplierOrderRef: '',
    isTaxable: true,
    isStockItem: false,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    warrantyDuration: '',
    warrantyExpiryDate: '',
    installDate: '',
    installedBy: '',
    invoiceNumber: '',
    poLine: '',
    binLocation: '',
    warehouseLocation: '',
    shelfLocation: '',
    notes: '',
    notesInternal: '',
    inventoryItemId: '',
    estimatedArrivalDate: '',
    itemStatus: 'none'
  });

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingPart(initializeNewPart());
  };

  const handleStartEdit = (part: WorkOrderPart) => {
    setEditingPartId(part.id);
    setEditingPart({
      ...part,
      job_line_id: convertToDisplayValue(part.job_line_id),
      status: convertToDisplayValue(part.status),
      category: convertToDisplayValue(part.category),
      partType: convertToDisplayValue(part.partType),
      isTaxable: convertToDisplayValue(part.isTaxable, 'boolean'),
      isStockItem: convertToDisplayValue(part.isStockItem, 'boolean'),
      coreChargeApplied: convertToDisplayValue(part.coreChargeApplied, 'boolean'),
      itemStatus: convertToDisplayValue(part.itemStatus)
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingPartId(null);
    setEditingPart({});
  };

  const handleSave = async () => {
    try {
      if (!editingPart.name || !editingPart.part_number) {
        toast.error('Part name and part number are required');
        return;
      }

      const partData = {
        ...editingPart,
        job_line_id: convertToDbValue(editingPart.job_line_id),
        status: convertToDbValue(editingPart.status),
        category: convertToDbValue(editingPart.category),
        partType: convertToDbValue(editingPart.partType),
        isTaxable: convertToDbValue(editingPart.isTaxable, 'boolean'),
        isStockItem: convertToDbValue(editingPart.isStockItem, 'boolean'),
        coreChargeApplied: convertToDbValue(editingPart.coreChargeApplied, 'boolean'),
        itemStatus: convertToDbValue(editingPart.itemStatus),
        quantity: convertToDbValue(editingPart.quantity?.toString() || '1', 'number'),
        unit_price: convertToDbValue(editingPart.unit_price?.toString() || '0', 'number'),
        customerPrice: convertToDbValue(editingPart.customerPrice?.toString() || '0', 'number'),
        supplierCost: convertToDbValue(editingPart.supplierCost?.toString() || '0', 'number'),
        retailPrice: convertToDbValue(editingPart.retailPrice?.toString() || '0', 'number'),
        markupPercentage: convertToDbValue(editingPart.markupPercentage?.toString() || '0', 'number'),
        coreChargeAmount: convertToDbValue(editingPart.coreChargeAmount?.toString() || '0', 'number')
      };

      if (isAdding) {
        await workOrderPartsService.createWorkOrderPart(partData as any, workOrderId);
        toast.success('Part added successfully');
      } else if (editingPartId) {
        await workOrderPartsService.updateWorkOrderPart(editingPartId, partData as any);
        toast.success('Part updated successfully');
      }

      await onPartsChange();
      handleCancel();
    } catch (error) {
      console.error('Error saving part:', error);
      toast.error('Failed to save part');
    }
  };

  const handleDelete = async (partId: string) => {
    try {
      await workOrderPartsService.deleteWorkOrderPart(partId);
      toast.success('Part deleted successfully');
      await onPartsChange();
    } catch (error) {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    }
  };

  const updateEditingPart = (field: string, value: any) => {
    setEditingPart(prev => ({ ...prev, [field]: value }));
  };

  const renderEditableCell = (field: string, value: any, type: 'text' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date' = 'text', options: any[] = []) => {
    const isEditing = isAdding || editingPartId;
    
    if (!isEditing) {
      if (type === 'checkbox') {
        return <Checkbox checked={value} disabled />;
      }
      if (type === 'select' && options.length > 0) {
        const option = options.find(opt => opt.value === value);
        return option?.label || value;
      }
      return value || '-';
    }

    switch (type) {
      case 'number':
        return (
          <Input
            type="number"
            value={value || 0}
            onChange={(e) => updateEditingPart(field, parseFloat(e.target.value) || 0)}
            className="min-w-[100px]"
          />
        );
      case 'select':
        return (
          <Select value={value || 'none'} onValueChange={(val) => updateEditingPart(field, val)}>
            <SelectTrigger className="min-w-[120px]">
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
      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => updateEditingPart(field, e.target.value)}
            className="min-w-[200px] min-h-[60px]"
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            checked={value === true || value === 'true'}
            onCheckedChange={(checked) => updateEditingPart(field, checked)}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => updateEditingPart(field, e.target.value)}
            className="min-w-[130px]"
          />
        );
      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => updateEditingPart(field, e.target.value)}
            className="min-w-[120px]"
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Parts & Materials</h3>
        {isEditMode && !isAdding && !editingPartId && (
          <Button onClick={handleStartAdd} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Part
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Actions</TableHead>
              <TableHead>Part Name</TableHead>
              <TableHead>Part Number</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Customer Price</TableHead>
              <TableHead>Supplier Cost</TableHead>
              <TableHead>Retail Price</TableHead>
              <TableHead>Markup %</TableHead>
              <TableHead>Job Line</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Part Type</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Supplier Ref</TableHead>
              <TableHead>Taxable</TableHead>
              <TableHead>Stock Item</TableHead>
              <TableHead>Core Charge</TableHead>
              <TableHead>Core Applied</TableHead>
              <TableHead>Warranty</TableHead>
              <TableHead>Warranty Expiry</TableHead>
              <TableHead>Install Date</TableHead>
              <TableHead>Installed By</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>PO Line</TableHead>
              <TableHead>Bin Location</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Shelf Location</TableHead>
              <TableHead>Est. Arrival</TableHead>
              <TableHead>Item Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Internal Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.map((part) => {
              const isEditing = editingPartId === part.id;
              const currentPart = isEditing ? editingPart : part;
              
              return (
                <TableRow key={part.id}>
                  <TableCell>
                    {isEditMode && (
                      <div className="flex gap-1">
                        {!isEditing ? (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => handleStartEdit(part)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(part.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="ghost" onClick={handleSave}>
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancel}>
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{renderEditableCell('name', currentPart.name, 'text')}</TableCell>
                  <TableCell>{renderEditableCell('part_number', currentPart.part_number, 'text')}</TableCell>
                  <TableCell>{renderEditableCell('description', currentPart.description, 'textarea')}</TableCell>
                  <TableCell>{renderEditableCell('quantity', currentPart.quantity, 'number')}</TableCell>
                  <TableCell>${renderEditableCell('unit_price', currentPart.unit_price, 'number')}</TableCell>
                  <TableCell>${renderEditableCell('customerPrice', currentPart.customerPrice, 'number')}</TableCell>
                  <TableCell>${renderEditableCell('supplierCost', currentPart.supplierCost, 'number')}</TableCell>
                  <TableCell>${renderEditableCell('retailPrice', currentPart.retailPrice, 'number')}</TableCell>
                  <TableCell>{renderEditableCell('markupPercentage', currentPart.markupPercentage, 'number')}%</TableCell>
                  <TableCell>{renderEditableCell('job_line_id', currentPart.job_line_id, 'select', jobLineOptions)}</TableCell>
                  <TableCell>{renderEditableCell('status', currentPart.status, 'select', statusOptions)}</TableCell>
                  <TableCell>{renderEditableCell('category', currentPart.category, 'select', categoryOptions)}</TableCell>
                  <TableCell>{renderEditableCell('partType', currentPart.partType, 'select', partTypeOptions)}</TableCell>
                  <TableCell>{renderEditableCell('supplierName', currentPart.supplierName, 'text')}</TableCell>
                  <TableCell>{renderEditableCell('supplierOrderRef', currentPart.supplierOrderRef, 'text')}</TableCell>
                  <TableCell>{renderEditableCell('isTaxable', currentPart.isTaxable, 'checkbox')}</TableCell>
                  <TableCell>{renderEditableCell('isStockItem', currentPart.isStockItem, 'checkbox')}</TableCell>
                  <TableCell>${renderEditableCell('coreChargeAmount', currentPart.coreChargeAmount, 'number')}</TableCell>
                  <TableCell>{renderEditableCell('coreChargeApplied', currentPart.coreChargeApplied, 'checkbox')}</TableCell>
                  <TableCell>{renderEditableCell('warrantyDuration', currentPart.warrantyDuration, 'text')}</TableCell>
                  <TableCell>{renderEditableCell('warrantyExpiryDate', currentPart.warrantyExpiryDate, 'date')}</TableCell>
                  <TableCell>{renderEditableCell('installDate', currentPart.installDate, 'date')}</TableCell>
                  <TableCell>{renderEditableCell('installedBy', currentPart.installedBy, 'text')}</TableCell>
                  <TableCell>{renderEditableCell('invoiceNumber', currentPart.invoiceNumber, 'text')}</TableCell>
                  <TableCell>{renderEditableCell('poLine', currentPart.poLine, 'text')}</TableCell>
                  <TableCell>{renderEditableCell('binLocation', currentPart.binLocation, 'text')}</TableCell>
                  <TableCell>{renderEditableCell('warehouseLocation', currentPart.warehouseLocation, 'text')}</TableCell>
                  <TableCell>{renderEditableCell('shelfLocation', currentPart.shelfLocation, 'text')}</TableCell>
                  <TableCell>{renderEditableCell('estimatedArrivalDate', currentPart.estimatedArrivalDate, 'date')}</TableCell>
                  <TableCell>{renderEditableCell('itemStatus', currentPart.itemStatus, 'select', statusOptions)}</TableCell>
                  <TableCell>{renderEditableCell('notes', currentPart.notes, 'textarea')}</TableCell>
                  <TableCell>{renderEditableCell('notesInternal', currentPart.notesInternal, 'textarea')}</TableCell>
                </TableRow>
              );
            })}
            
            {isAdding && (
              <TableRow>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={handleSave}>
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancel}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{renderEditableCell('name', editingPart.name, 'text')}</TableCell>
                <TableCell>{renderEditableCell('part_number', editingPart.part_number, 'text')}</TableCell>
                <TableCell>{renderEditableCell('description', editingPart.description, 'textarea')}</TableCell>
                <TableCell>{renderEditableCell('quantity', editingPart.quantity, 'number')}</TableCell>
                <TableCell>${renderEditableCell('unit_price', editingPart.unit_price, 'number')}</TableCell>
                <TableCell>${renderEditableCell('customerPrice', editingPart.customerPrice, 'number')}</TableCell>
                <TableCell>${renderEditableCell('supplierCost', editingPart.supplierCost, 'number')}</TableCell>
                <TableCell>${renderEditableCell('retailPrice', editingPart.retailPrice, 'number')}</TableCell>
                <TableCell>{renderEditableCell('markupPercentage', editingPart.markupPercentage, 'number')}%</TableCell>
                <TableCell>{renderEditableCell('job_line_id', editingPart.job_line_id, 'select', jobLineOptions)}</TableCell>
                <TableCell>{renderEditableCell('status', editingPart.status, 'select', statusOptions)}</TableCell>
                <TableCell>{renderEditableCell('category', editingPart.category, 'select', categoryOptions)}</TableCell>
                <TableCell>{renderEditableCell('partType', editingPart.partType, 'select', partTypeOptions)}</TableCell>
                <TableCell>{renderEditableCell('supplierName', editingPart.supplierName, 'text')}</TableCell>
                <TableCell>{renderEditableCell('supplierOrderRef', editingPart.supplierOrderRef, 'text')}</TableCell>
                <TableCell>{renderEditableCell('isTaxable', editingPart.isTaxable, 'checkbox')}</TableCell>
                <TableCell>{renderEditableCell('isStockItem', editingPart.isStockItem, 'checkbox')}</TableCell>
                <TableCell>${renderEditableCell('coreChargeAmount', editingPart.coreChargeAmount, 'number')}</TableCell>
                <TableCell>{renderEditableCell('coreChargeApplied', editingPart.coreChargeApplied, 'checkbox')}</TableCell>
                <TableCell>{renderEditableCell('warrantyDuration', editingPart.warrantyDuration, 'text')}</TableCell>
                <TableCell>{renderEditableCell('warrantyExpiryDate', editingPart.warrantyExpiryDate, 'date')}</TableCell>
                <TableCell>{renderEditableCell('installDate', editingPart.installDate, 'date')}</TableCell>
                <TableCell>{renderEditableCell('installedBy', editingPart.installedBy, 'text')}</TableCell>
                <TableCell>{renderEditableCell('invoiceNumber', editingPart.invoiceNumber, 'text')}</TableCell>
                <TableCell>{renderEditableCell('poLine', editingPart.poLine, 'text')}</TableCell>
                <TableCell>{renderEditableCell('binLocation', editingPart.binLocation, 'text')}</TableCell>
                <TableCell>{renderEditableCell('warehouseLocation', editingPart.warehouseLocation, 'text')}</TableCell>
                <TableCell>{renderEditableCell('shelfLocation', editingPart.shelfLocation, 'text')}</TableCell>
                <TableCell>{renderEditableCell('estimatedArrivalDate', editingPart.estimatedArrivalDate, 'date')}</TableCell>
                <TableCell>{renderEditableCell('itemStatus', editingPart.itemStatus, 'select', statusOptions)}</TableCell>
                <TableCell>{renderEditableCell('notes', editingPart.notes, 'textarea')}</TableCell>
                <TableCell>{renderEditableCell('notesInternal', editingPart.notesInternal, 'textarea')}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {parts.length === 0 && !isAdding && (
        <div className="text-center py-8 text-muted-foreground">
          No parts added yet. {isEditMode && 'Click "Add Part" to get started.'}
        </div>
      )}
    </div>
  );
}
