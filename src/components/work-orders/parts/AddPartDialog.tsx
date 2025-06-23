
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPartFormValues, PART_TYPES, WORK_ORDER_PART_STATUSES } from '@/types/workOrderPart';
import { createWorkOrderPart } from '@/services/workOrder';
import { toast } from 'sonner';

interface AddPartDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onPartAdded: () => Promise<void>;
}

interface FormErrors {
  [key: string]: string;
}

export function AddPartDialog({
  isOpen,
  onOpenChange,
  workOrderId,
  jobLines,
  onPartAdded
}: AddPartDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string>('');
  
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
    part_type: 'inventory',
    estimatedArrivalDate: '',
    itemStatus: ''
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Part name is required';
    }
    
    if (!formData.part_number.trim()) {
      newErrors.part_number = 'Part number is required';
    }
    
    if (!formData.part_type) {
      newErrors.part_type = 'Part type is required';
    }
    
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    
    if (formData.unit_price < 0) {
      newErrors.unit_price = 'Unit price cannot be negative';
    }

    if (formData.customerPrice && formData.customerPrice < 0) {
      newErrors.customerPrice = 'Customer price cannot be negative';
    }

    if (formData.supplierCost && formData.supplierCost < 0) {
      newErrors.supplierCost = 'Supplier cost cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Clear general error when user makes changes
    if (generalError) {
      setGeneralError('');
    }
  };

  const calculateTotalPrice = () => {
    const price = formData.customerPrice || formData.unit_price || 0;
    return price * formData.quantity;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setGeneralError('');

    try {
      console.log('Submitting part form:', formData);
      
      await createWorkOrderPart(formData, workOrderId);
      
      toast.success('Part added successfully');
      
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
        part_type: 'inventory',
        estimatedArrivalDate: '',
        itemStatus: ''
      });
      
      await onPartAdded();
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error adding part:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add part';
      setGeneralError(errorMessage);
      toast.error(`Failed to add part: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = calculateTotalPrice();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Part to Work Order</DialogTitle>
        </DialogHeader>

        {generalError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Part Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter part name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => handleInputChange('part_number', e.target.value)}
                placeholder="Enter part number"
                className={errors.part_number ? 'border-red-500' : ''}
              />
              {errors.part_number && <p className="text-sm text-red-500">{errors.part_number}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter part description"
              rows={3}
            />
          </div>

          {/* Part Type and Job Line */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="part_type">Part Type *</Label>
              <Select
                value={formData.part_type}
                onValueChange={(value) => handleInputChange('part_type', value)}
              >
                <SelectTrigger className={errors.part_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select part type" />
                </SelectTrigger>
                <SelectContent>
                  {PART_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === 'inventory' ? 'Inventory Item' : 'Non-Inventory Item'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.part_type && <p className="text-sm text-red-500">{errors.part_type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_line_id">Job Line (Optional)</Label>
              <Select
                value={formData.job_line_id || ''}
                onValueChange={(value) => handleInputChange('job_line_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job line" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Job Line</SelectItem>
                  {jobLines.map((jobLine) => (
                    <SelectItem key={jobLine.id} value={jobLine.id}>
                      {jobLine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quantity and Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                className={errors.quantity ? 'border-red-500' : ''}
              />
              {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price</Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
                className={errors.unit_price ? 'border-red-500' : ''}
              />
              {errors.unit_price && <p className="text-sm text-red-500">{errors.unit_price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPrice">Customer Price</Label>
              <Input
                id="customerPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.customerPrice || 0}
                onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
                className={errors.customerPrice ? 'border-red-500' : ''}
              />
              {errors.customerPrice && <p className="text-sm text-red-500">{errors.customerPrice}</p>}
            </div>
          </div>

          {/* Total Price Display */}
          <div className="bg-gray-50 p-3 rounded-md">
            <Label className="text-sm font-medium">Total Price: ${totalPrice.toFixed(2)}</Label>
          </div>

          {/* Status and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || 'pending'}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {WORK_ORDER_PART_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Enter category"
              />
            </div>
          </div>

          {/* Supplier Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierName">Supplier Name</Label>
              <Input
                id="supplierName"
                value={formData.supplierName || ''}
                onChange={(e) => handleInputChange('supplierName', e.target.value)}
                placeholder="Enter supplier name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierCost">Supplier Cost</Label>
              <Input
                id="supplierCost"
                type="number"
                min="0"
                step="0.01"
                value={formData.supplierCost || 0}
                onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
                className={errors.supplierCost ? 'border-red-500' : ''}
              />
              {errors.supplierCost && <p className="text-sm text-red-500">{errors.supplierCost}</p>}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="isStockItem"
                checked={formData.isStockItem || false}
                onCheckedChange={(checked) => handleInputChange('isStockItem', checked)}
              />
              <Label htmlFor="isStockItem">Stock Item</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isTaxable"
                checked={formData.isTaxable !== false}
                onCheckedChange={(checked) => handleInputChange('isTaxable', checked)}
              />
              <Label htmlFor="isTaxable">Taxable</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="coreChargeApplied"
                checked={formData.coreChargeApplied || false}
                onCheckedChange={(checked) => handleInputChange('coreChargeApplied', checked)}
              />
              <Label htmlFor="coreChargeApplied">Core Charge Applied</Label>
            </div>
          </div>

          {/* Core Charge Amount (conditionally shown) */}
          {formData.coreChargeApplied && (
            <div className="space-y-2">
              <Label htmlFor="coreChargeAmount">Core Charge Amount</Label>
              <Input
                id="coreChargeAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.coreChargeAmount || 0}
                onChange={(e) => handleInputChange('coreChargeAmount', parseFloat(e.target.value) || 0)}
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding Part...
                </>
              ) : (
                'Add Part'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
