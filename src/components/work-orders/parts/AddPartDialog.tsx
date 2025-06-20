
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from '@/hooks/use-toast';

interface AddPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onPartAdded: (part: WorkOrderPart) => Promise<void>;
}

const PART_CATEGORIES = [
  'filters',
  'oils',
  'belts',
  'hoses',
  'batteries',
  'brakes',
  'tires',
  'engine',
  'transmission',
  'electrical',
  'cooling',
  'fuel',
  'exhaust',
  'suspension',
  'steering',
  'body',
  'interior',
  'tools',
  'fluids',
  'other'
];

const PART_STATUSES = [
  'pending',
  'ordered',
  'received',
  'installed',
  'returned',
  'backordered',
  'defective',
  'quote-requested',
  'quote-received',
  'approved',
  'declined',
  'warranty-claim',
  'core-exchange',
  'special-order',
  'discontinued'
];

export function AddPartDialog({
  open,
  onOpenChange,
  workOrderId,
  jobLines,
  onPartAdded
}: AddPartDialogProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
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
    partType: 'part',
    estimatedArrivalDate: '',
    itemStatus: 'active'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total price when quantity or unit price changes
  useEffect(() => {
    const total = formData.quantity * formData.unit_price;
    setFormData(prev => ({ ...prev, customerPrice: total }));
  }, [formData.quantity, formData.unit_price]);

  // Calculate markup percentage when prices change
  useEffect(() => {
    if (formData.supplierCost > 0 && formData.retailPrice > 0) {
      const markup = ((formData.retailPrice - formData.supplierCost) / formData.supplierCost) * 100;
      setFormData(prev => ({ ...prev, markupPercentage: markup }));
    }
  }, [formData.supplierCost, formData.retailPrice]);

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.part_number.trim()) {
      toast({
        title: "Validation Error",
        description: "Part name and part number are required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the part data with all required fields
      const partData: Omit<WorkOrderPart, 'id' | 'created_at' | 'updated_at'> = {
        work_order_id: workOrderId,
        job_line_id: formData.job_line_id || undefined,
        part_number: formData.part_number,
        name: formData.name,
        description: formData.description || '',
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        total_price: formData.quantity * formData.unit_price,
        status: formData.status || 'pending',
        notes: formData.notes || '',
        category: formData.category,
        partName: formData.name,
        partNumber: formData.part_number,
        customerPrice: formData.customerPrice,
        supplierCost: formData.supplierCost,
        retailPrice: formData.retailPrice,
        markupPercentage: formData.markupPercentage,
        isTaxable: formData.isTaxable,
        coreChargeAmount: formData.coreChargeAmount,
        coreChargeApplied: formData.coreChargeApplied,
        warrantyDuration: formData.warrantyDuration,
        warrantyExpiryDate: formData.warrantyExpiryDate,
        installDate: formData.installDate,
        installedBy: formData.installedBy,
        invoiceNumber: formData.invoiceNumber,
        poLine: formData.poLine,
        isStockItem: formData.isStockItem,
        supplierName: formData.supplierName,
        supplierOrderRef: formData.supplierOrderRef,
        notesInternal: formData.notesInternal,
        inventoryItemId: formData.inventoryItemId,
        partType: formData.partType,
        estimatedArrivalDate: formData.estimatedArrivalDate,
        itemStatus: formData.itemStatus
      };

      const newPart = await createWorkOrderPart(partData);
      
      await onPartAdded(newPart);
      
      toast({
        title: "Success",
        description: "Part added successfully",
      });
      
      // Reset form
      setFormData({
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
        partType: 'part',
        estimatedArrivalDate: '',
        itemStatus: 'active'
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding part:', error);
      toast({
        title: "Error",
        description: "Failed to add part. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Part</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Part Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter part name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="part_number">Part Number *</Label>
                <Input
                  id="part_number"
                  value={formData.part_number}
                  onChange={(e) => handleInputChange('part_number', e.target.value)}
                  placeholder="Enter part number"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter part description"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
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
                  onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="customerPrice">Total Price</Label>
                <Input
                  id="customerPrice"
                  type="number"
                  step="0.01"
                  value={formData.customerPrice}
                  onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="supplierCost">Supplier Cost</Label>
                <Input
                  id="supplierCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.supplierCost}
                  onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
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
                  onChange={(e) => handleInputChange('retailPrice', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="markupPercentage">Markup %</Label>
                <Input
                  id="markupPercentage"
                  type="number"
                  step="0.01"
                  value={formData.markupPercentage?.toFixed(2)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Assignment & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment & Status</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="job_line_id">Job Line</Label>
                <Select value={formData.job_line_id || ''} onValueChange={(value) => handleInputChange('job_line_id', value || undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job line" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {jobLines.map((jobLine) => (
                      <SelectItem key={jobLine.id} value={jobLine.id}>
                        {jobLine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status || 'pending'} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PART_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Categorization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categorization</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category || ''} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PART_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="partType">Part Type</Label>
                <Select value={formData.partType || 'part'} onValueChange={(value) => handleInputChange('partType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select part type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="part">Part</SelectItem>
                    <SelectItem value="fluid">Fluid</SelectItem>
                    <SelectItem value="consumable">Consumable</SelectItem>
                    <SelectItem value="tool">Tool</SelectItem>
                    <SelectItem value="kit">Kit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input
                  id="supplierName"
                  value={formData.supplierName || ''}
                  onChange={(e) => handleInputChange('supplierName', e.target.value)}
                  placeholder="Enter supplier name"
                />
              </div>
              
              <div>
                <Label htmlFor="supplierOrderRef">Supplier Order Ref</Label>
                <Input
                  id="supplierOrderRef"
                  value={formData.supplierOrderRef || ''}
                  onChange={(e) => handleInputChange('supplierOrderRef', e.target.value)}
                  placeholder="Enter supplier order reference"
                />
              </div>
              
              <div>
                <Label htmlFor="poLine">PO Line</Label>
                <Input
                  id="poLine"
                  value={formData.poLine || ''}
                  onChange={(e) => handleInputChange('poLine', e.target.value)}
                  placeholder="Enter PO line number"
                />
              </div>
              
              <div>
                <Label htmlFor="estimatedArrivalDate">Estimated Arrival Date</Label>
                <Input
                  id="estimatedArrivalDate"
                  type="date"
                  value={formData.estimatedArrivalDate || ''}
                  onChange={(e) => handleInputChange('estimatedArrivalDate', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Warranty & Installation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Warranty & Installation</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="warrantyDuration">Warranty Duration</Label>
                <Input
                  id="warrantyDuration"
                  value={formData.warrantyDuration || ''}
                  onChange={(e) => handleInputChange('warrantyDuration', e.target.value)}
                  placeholder="e.g., 12 months, 2 years"
                />
              </div>
              
              <div>
                <Label htmlFor="warrantyExpiryDate">Warranty Expiry Date</Label>
                <Input
                  id="warrantyExpiryDate"
                  type="date"
                  value={formData.warrantyExpiryDate || ''}
                  onChange={(e) => handleInputChange('warrantyExpiryDate', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="installDate">Install Date</Label>
                <Input
                  id="installDate"
                  type="date"
                  value={formData.installDate || ''}
                  onChange={(e) => handleInputChange('installDate', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="installedBy">Installed By</Label>
                <Input
                  id="installedBy"
                  value={formData.installedBy || ''}
                  onChange={(e) => handleInputChange('installedBy', e.target.value)}
                  placeholder="Enter technician name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coreChargeAmount">Core Charge Amount</Label>
                  <Input
                    id="coreChargeAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.coreChargeAmount}
                    onChange={(e) => handleInputChange('coreChargeAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber || ''}
                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                    placeholder="Enter invoice number"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isTaxable"
                    checked={formData.isTaxable}
                    onCheckedChange={(checked) => handleInputChange('isTaxable', checked)}
                  />
                  <Label htmlFor="isTaxable">Taxable</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="coreChargeApplied"
                    checked={formData.coreChargeApplied}
                    onCheckedChange={(checked) => handleInputChange('coreChargeApplied', checked)}
                  />
                  <Label htmlFor="coreChargeApplied">Core Charge Applied</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isStockItem"
                    checked={formData.isStockItem}
                    onCheckedChange={(checked) => handleInputChange('isStockItem', checked)}
                  />
                  <Label htmlFor="isStockItem">Stock Item</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Customer Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Notes visible to customer"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="notesInternal">Internal Notes</Label>
                <Textarea
                  id="notesInternal"
                  value={formData.notesInternal || ''}
                  onChange={(e) => handleInputChange('notesInternal', e.target.value)}
                  placeholder="Internal notes (not visible to customer)"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Part'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
