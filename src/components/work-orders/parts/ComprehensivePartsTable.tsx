
import React, { useState } from 'react';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { workOrderPartsService } from '@/services/workOrder/workOrderPartsService';

interface ComprehensivePartsTableProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  onPartsChange: (parts: WorkOrderPart[]) => void;
}

// Mapping for user-friendly part type labels to database values
const PART_TYPE_OPTIONS = [
  { label: 'OEM', value: 'inventory' },
  { label: 'Aftermarket', value: 'non-inventory' },
  { label: 'Used', value: 'non-inventory' },
  { label: 'Remanufactured', value: 'inventory' }
];

const STATUS_OPTIONS = [
  'pending', 'ordered', 'received', 'installed', 'returned', 
  'backordered', 'defective', 'quote-requested', 'quote-received',
  'approved', 'declined', 'warranty-claim', 'core-exchange',
  'special-order', 'discontinued'
];

// Helper function to get database value from label
const getPartTypeValue = (label: string): string => {
  const option = PART_TYPE_OPTIONS.find(opt => opt.label === label);
  return option ? option.value : 'inventory';
};

// Helper function to get label from database value
const getPartTypeLabel = (value: string): string => {
  const option = PART_TYPE_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : 'OEM';
};

export function ComprehensivePartsTable({ workOrderId, parts, onPartsChange }: ComprehensivePartsTableProps) {
  const { toast } = useToast();
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    name: '',
    part_number: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    status: 'pending',
    notes: '',
    category: '',
    customerPrice: 0,
    supplierCost: 0,
    retailPrice: 0,
    markupPercentage: 0,
    isTaxable: true,
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
    itemStatus: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      part_number: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      status: 'pending',
      notes: '',
      category: '',
      customerPrice: 0,
      supplierCost: 0,
      retailPrice: 0,
      markupPercentage: 0,
      isTaxable: true,
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
      itemStatus: ''
    });
    setIsAddingPart(false);
    setEditingPartId(null);
  };

  const handleStartEdit = (part: WorkOrderPart) => {
    setFormData({
      name: part.name,
      part_number: part.part_number,
      description: part.description || '',
      quantity: part.quantity,
      unit_price: part.unit_price,
      status: part.status || 'pending',
      notes: part.notes || '',
      category: part.category || '',
      customerPrice: part.customerPrice || 0,
      supplierCost: part.supplierCost || 0,
      retailPrice: part.retailPrice || 0,
      markupPercentage: part.markupPercentage || 0,
      isTaxable: part.isTaxable !== undefined ? part.isTaxable : true,
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
      itemStatus: part.itemStatus || ''
    });
    setEditingPartId(part.id);
    setIsAddingPart(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.part_number) {
        toast({
          title: "Validation Error",
          description: "Part name and part number are required",
          variant: "destructive"
        });
        return;
      }

      // Prepare the form data with proper field mapping
      const formDataToSave: WorkOrderPartFormValues = {
        ...formData,
        // Ensure partType is mapped to a valid database value
        partType: getPartTypeValue(formData.partType || 'OEM')
      };

      let savedPart: WorkOrderPart;
      
      if (editingPartId) {
        savedPart = await workOrderPartsService.updateWorkOrderPart(editingPartId, formDataToSave);
        const updatedParts = parts.map(p => p.id === editingPartId ? savedPart : p);
        onPartsChange(updatedParts);
        toast({
          title: "Success",
          description: "Part updated successfully"
        });
      } else {
        savedPart = await workOrderPartsService.createWorkOrderPart(formDataToSave, workOrderId);
        onPartsChange([...parts, savedPart]);
        toast({
          title: "Success",
          description: "Part added successfully"
        });
      }

      resetForm();
    } catch (error) {
      console.error('Error saving part:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save part",
        variant: "destructive"
      });
    }
  };

  const calculateTotal = () => {
    return formData.quantity * formData.unit_price;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Parts Management</h3>
        {!isAddingPart && (
          <Button onClick={() => setIsAddingPart(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Part
          </Button>
        )}
      </div>

      {/* Add/Edit Part Form */}
      {isAddingPart && (
        <Card>
          <CardHeader>
            <CardTitle>{editingPartId ? 'Edit Part' : 'Add New Part'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name">Part Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter part name"
                />
              </div>
              <div>
                <Label htmlFor="part_number">Part Number *</Label>
                <Input
                  id="part_number"
                  value={formData.part_number}
                  onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                  placeholder="Enter part number"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Enter category"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter part description"
              />
            </div>

            {/* Quantity and Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="unit_price">Unit Price</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="customerPrice">Customer Price</Label>
                <Input
                  id="customerPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.customerPrice}
                  onChange={(e) => setFormData({ ...formData, customerPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Total: ${calculateTotal().toFixed(2)}</Label>
                <div className="h-10 flex items-center px-3 bg-gray-50 rounded border">
                  ${calculateTotal().toFixed(2)}
                </div>
              </div>
            </div>

            {/* Advanced Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="supplierCost">Supplier Cost</Label>
                <Input
                  id="supplierCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.supplierCost}
                  onChange={(e) => setFormData({ ...formData, supplierCost: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="retailPrice">Retail Price</Label>
                <Input
                  id="retailPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.retailPrice}
                  onChange={(e) => setFormData({ ...formData, retailPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="markupPercentage">Markup %</Label>
                <Input
                  id="markupPercentage"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.markupPercentage}
                  onChange={(e) => setFormData({ ...formData, markupPercentage: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Status and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="partType">Part Type</Label>
                <Select 
                  value={getPartTypeLabel(formData.partType || 'inventory')} 
                  onValueChange={(value) => setFormData({ ...formData, partType: getPartTypeValue(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select part type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PART_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.label} value={option.label}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Supplier Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input
                  id="supplierName"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  placeholder="Enter supplier name"
                />
              </div>
              <div>
                <Label htmlFor="supplierOrderRef">Supplier Order Ref</Label>
                <Input
                  id="supplierOrderRef"
                  value={formData.supplierOrderRef}
                  onChange={(e) => setFormData({ ...formData, supplierOrderRef: e.target.value })}
                  placeholder="Enter supplier order reference"
                />
              </div>
            </div>

            {/* Warranty and Installation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="warrantyDuration">Warranty Duration</Label>
                <Input
                  id="warrantyDuration"
                  value={formData.warrantyDuration}
                  onChange={(e) => setFormData({ ...formData, warrantyDuration: e.target.value })}
                  placeholder="e.g., 12 months"
                />
              </div>
              <div>
                <Label htmlFor="installDate">Install Date</Label>
                <Input
                  id="installDate"
                  type="date"
                  value={formData.installDate}
                  onChange={(e) => setFormData({ ...formData, installDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="installedBy">Installed By</Label>
                <Input
                  id="installedBy"
                  value={formData.installedBy}
                  onChange={(e) => setFormData({ ...formData, installedBy: e.target.value })}
                  placeholder="Enter technician name"
                />
              </div>
            </div>

            {/* Core Charge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coreChargeAmount">Core Charge Amount</Label>
                <Input
                  id="coreChargeAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.coreChargeAmount}
                  onChange={(e) => setFormData({ ...formData, coreChargeAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="coreChargeApplied"
                  checked={formData.coreChargeApplied}
                  onCheckedChange={(checked) => setFormData({ ...formData, coreChargeApplied: !!checked })}
                />
                <Label htmlFor="coreChargeApplied">Core Charge Applied</Label>
              </div>
            </div>

            {/* Additional Options */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isTaxable"
                  checked={formData.isTaxable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isTaxable: !!checked })}
                />
                <Label htmlFor="isTaxable">Taxable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isStockItem"
                  checked={formData.isStockItem}
                  onCheckedChange={(checked) => setFormData({ ...formData, isStockItem: !!checked })}
                />
                <Label htmlFor="isStockItem">Stock Item</Label>
              </div>
            </div>

            {/* Invoice and PO Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="Enter invoice number"
                />
              </div>
              <div>
                <Label htmlFor="poLine">PO Line</Label>
                <Input
                  id="poLine"
                  value={formData.poLine}
                  onChange={(e) => setFormData({ ...formData, poLine: e.target.value })}
                  placeholder="Enter PO line"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notes">Public Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Enter public notes"
                />
              </div>
              <div>
                <Label htmlFor="notesInternal">Internal Notes</Label>
                <Textarea
                  id="notesInternal"
                  value={formData.notesInternal}
                  onChange={(e) => setFormData({ ...formData, notesInternal: e.target.value })}
                  placeholder="Enter internal notes"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={resetForm}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {editingPartId ? 'Update Part' : 'Add Part'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parts List */}
      {parts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Parts ({parts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {parts.map((part) => (
                <div key={part.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{part.name}</div>
                    <div className="text-sm text-gray-600">
                      {part.part_number} • Qty: {part.quantity} • ${part.unit_price} each
                    </div>
                    <div className="text-sm text-gray-500">
                      Status: {part.status} • Total: ${part.total_price?.toFixed(2)}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartEdit(part)}
                  >
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
