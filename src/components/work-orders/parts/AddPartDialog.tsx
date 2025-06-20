
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onPartAdded: (newPart: WorkOrderPart) => void;
}

export function AddPartDialog({
  open,
  onOpenChange,
  workOrderId,
  jobLines,
  onPartAdded
}: AddPartDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
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
    partType: 'OEM',
    estimatedArrivalDate: '',
    itemStatus: 'available'
  });

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      console.log('Fetching part categories from database...');
      const { data, error } = await supabase
        .from('parts_inventory')
        .select('category')
        .not('category', 'is', null);

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      const uniqueCategories = [...new Set(data?.map(item => item.category).filter(Boolean))] as string[];
      setCategories(uniqueCategories);
      console.log('Categories loaded:', uniqueCategories.length, 'categories');
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate total price
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? value : formData.quantity;
      const unitPrice = field === 'unit_price' ? value : formData.unit_price;
      const totalPrice = quantity * unitPrice;
      
      setFormData(prev => ({
        ...prev,
        customerPrice: totalPrice
      }));
    }

    // Auto-calculate markup percentage
    if (field === 'supplierCost' || field === 'retailPrice') {
      const supplierCost = field === 'supplierCost' ? value : formData.supplierCost || 0;
      const retailPrice = field === 'retailPrice' ? value : formData.retailPrice || 0;
      
      if (supplierCost > 0) {
        const markup = ((retailPrice - supplierCost) / supplierCost) * 100;
        setFormData(prev => ({
          ...prev,
          markupPercentage: Math.round(markup * 100) / 100
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Part name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.part_number.trim()) {
      toast({
        title: "Error",
        description: "Part number is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const partData: Partial<WorkOrderPart> = {
        work_order_id: workOrderId,
        job_line_id: formData.job_line_id || undefined,
        name: formData.name,
        part_number: formData.part_number,
        description: formData.description || '',
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        total_price: formData.quantity * formData.unit_price,
        status: formData.status || 'pending',
        notes: formData.notes || '',
        category: formData.category || '',
        customerPrice: formData.customerPrice || formData.quantity * formData.unit_price,
        supplierCost: formData.supplierCost || 0,
        retailPrice: formData.retailPrice || 0,
        markupPercentage: formData.markupPercentage || 0,
        isTaxable: formData.isTaxable,
        coreChargeAmount: formData.coreChargeAmount || 0,
        coreChargeApplied: formData.coreChargeApplied || false,
        warrantyDuration: formData.warrantyDuration || '',
        warrantyExpiryDate: formData.warrantyExpiryDate || '',
        installDate: formData.installDate || '',
        installedBy: formData.installedBy || '',
        invoiceNumber: formData.invoiceNumber || '',
        poLine: formData.poLine || '',
        isStockItem: formData.isStockItem || false,
        supplierName: formData.supplierName || '',
        supplierOrderRef: formData.supplierOrderRef || '',
        notesInternal: formData.notesInternal || '',
        inventoryItemId: formData.inventoryItemId || '',
        partType: formData.partType || 'OEM',
        estimatedArrivalDate: formData.estimatedArrivalDate || '',
        itemStatus: formData.itemStatus || 'available'
      };

      const newPart = await createWorkOrderPart(partData);
      
      toast({
        title: "Success",
        description: "Part added successfully"
      });

      onPartAdded(newPart);
      onOpenChange(false);
      
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
        partType: 'OEM',
        estimatedArrivalDate: '',
        itemStatus: 'available'
      });
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

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'ordered', label: 'Ordered' },
    { value: 'received', label: 'Received' },
    { value: 'installed', label: 'Installed' },
    { value: 'returned', label: 'Returned' },
    { value: 'backordered', label: 'Backordered' },
    { value: 'defective', label: 'Defective' }
  ];

  const partTypeOptions = [
    { value: 'OEM', label: 'OEM' },
    { value: 'Aftermarket', label: 'Aftermarket' },
    { value: 'Remanufactured', label: 'Remanufactured' },
    { value: 'Used', label: 'Used' },
    { value: 'Generic', label: 'Generic' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Part</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Part Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter part name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => handleInputChange('part_number', e.target.value)}
                placeholder="Enter part number"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter part description"
              rows={3}
            />
          </div>

          {/* Quantity and Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="customerPrice">Total Price</Label>
              <Input
                id="customerPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.customerPrice}
                onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Advanced Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
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
            
            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="markupPercentage">Markup %</Label>
              <Input
                id="markupPercentage"
                type="number"
                step="0.01"
                value={formData.markupPercentage}
                onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* Assignment and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_line_id">Job Line</Label>
              <Select value={formData.job_line_id} onValueChange={(value) => handleInputChange('job_line_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job line (optional)" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partType">Part Type</Label>
              <Select value={formData.partType} onValueChange={(value) => handleInputChange('partType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select part type" />
                </SelectTrigger>
                <SelectContent>
                  {partTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Supplier Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierName">Supplier Name</Label>
              <Input
                id="supplierName"
                value={formData.supplierName}
                onChange={(e) => handleInputChange('supplierName', e.target.value)}
                placeholder="Enter supplier name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplierOrderRef">Supplier Order Ref</Label>
              <Input
                id="supplierOrderRef"
                value={formData.supplierOrderRef}
                onChange={(e) => handleInputChange('supplierOrderRef', e.target.value)}
                placeholder="Enter supplier order reference"
              />
            </div>
          </div>

          {/* Warranty and Installation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warrantyDuration">Warranty Duration</Label>
              <Input
                id="warrantyDuration"
                value={formData.warrantyDuration}
                onChange={(e) => handleInputChange('warrantyDuration', e.target.value)}
                placeholder="e.g., 12 months, 2 years"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="installedBy">Installed By</Label>
              <Input
                id="installedBy"
                value={formData.installedBy}
                onChange={(e) => handleInputChange('installedBy', e.target.value)}
                placeholder="Enter technician name"
              />
            </div>
          </div>

          {/* Core Charge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
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
            
            <div className="flex items-center space-x-4 pt-8">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="coreChargeApplied"
                  checked={formData.coreChargeApplied}
                  onCheckedChange={(checked) => handleInputChange('coreChargeApplied', checked)}
                />
                <Label htmlFor="coreChargeApplied">Core Charge Applied</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isTaxable"
                  checked={formData.isTaxable}
                  onCheckedChange={(checked) => handleInputChange('isTaxable', checked)}
                />
                <Label htmlFor="isTaxable">Taxable</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isStockItem"
                  checked={formData.isStockItem}
                  onCheckedChange={(checked) => handleInputChange('isStockItem', checked)}
                />
                <Label htmlFor="isStockItem">Stock Item</Label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Customer Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter customer-visible notes"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notesInternal">Internal Notes</Label>
              <Textarea
                id="notesInternal"
                value={formData.notesInternal}
                onChange={(e) => handleInputChange('notesInternal', e.target.value)}
                placeholder="Enter internal notes"
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
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
