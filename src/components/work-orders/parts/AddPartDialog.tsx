
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPartFormValues, PART_TYPES } from '@/types/workOrderPart';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { PartsFormValidator } from '@/utils/partsErrorHandler';
import { Loader2 } from 'lucide-react';

interface AddPartDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onPartAdded: () => Promise<void>;
}

export function AddPartDialog({
  isOpen,
  onOpenChange,
  workOrderId,
  jobLines,
  onPartAdded
}: AddPartDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
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
    supplierCost: 0,
    retailPrice: 0,
    markupPercentage: 0,
    isTaxable: true,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    warrantyDuration: '',
    invoiceNumber: '',
    poLine: '',
    isStockItem: false,
    supplierName: '',
    part_type: 'inventory' // Default required value
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const validationErrors = PartsFormValidator.validatePartForm(formData);
    
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(error => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      PartsFormValidator.showValidationErrors(validationErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Submitting part data:', formData);
      
      await createWorkOrderPart(workOrderId, formData);
      
      PartsFormValidator.showSuccessToast('Part added successfully');
      
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
        supplierCost: 0,
        retailPrice: 0,
        markupPercentage: 0,
        isTaxable: true,
        coreChargeAmount: 0,
        coreChargeApplied: false,
        warrantyDuration: '',
        invoiceNumber: '',
        poLine: '',
        isStockItem: false,
        supplierName: '',
        part_type: 'inventory'
      });
      
      await onPartAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding part:', error);
      const errorMessage = PartsFormValidator.handleApiError(error);
      PartsFormValidator.showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    return (formData.quantity * formData.unit_price).toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Part</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Part Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Part Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
                placeholder="Enter part name"
              />
              {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => handleInputChange('part_number', e.target.value)}
                className={errors.part_number ? 'border-red-500' : ''}
                placeholder="Enter part number"
              />
              {errors.part_number && <span className="text-sm text-red-500">{errors.part_number}</span>}
            </div>
          </div>

          {/* Part Type and Category */}
          <div className="grid grid-cols-2 gap-4">
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
                      {type === 'inventory' ? 'Inventory' : 'Non-Inventory'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.part_type && <span className="text-sm text-red-500">{errors.part_type}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Enter category"
              />
            </div>
          </div>

          {/* Pricing Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                className={errors.quantity ? 'border-red-500' : ''}
              />
              {errors.quantity && <span className="text-sm text-red-500">{errors.quantity}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_price">Customer Price * ($)</Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
                className={errors.unit_price ? 'border-red-500' : ''}
              />
              {errors.unit_price && <span className="text-sm text-red-500">{errors.unit_price}</span>}
            </div>
          </div>

          {/* Additional Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierCost">Supplier Cost ($)</Label>
              <Input
                id="supplierCost"
                type="number"
                min="0"
                step="0.01"
                value={formData.supplierCost}
                onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retailPrice">Retail Price ($)</Label>
              <Input
                id="retailPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.retailPrice}
                onChange={(e) => handleInputChange('retailPrice', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Total Price Display */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium">Total Price: ${calculateTotalPrice()}</Label>
          </div>

          {/* Job Line Assignment */}
          {jobLines.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="job_line_id">Assign to Job Line (Optional)</Label>
              <Select
                value={formData.job_line_id}
                onValueChange={(value) => handleInputChange('job_line_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job line (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No assignment</SelectItem>
                  {jobLines.map((jobLine) => (
                    <SelectItem key={jobLine.id} value={jobLine.id}>
                      {jobLine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Supplier Information */}
          <div className="space-y-2">
            <Label htmlFor="supplierName">Supplier Name</Label>
            <Input
              id="supplierName"
              value={formData.supplierName}
              onChange={(e) => handleInputChange('supplierName', e.target.value)}
              placeholder="Enter supplier name"
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-4">
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
                id="isStockItem"
                checked={formData.isStockItem}
                onCheckedChange={(checked) => handleInputChange('isStockItem', checked)}
              />
              <Label htmlFor="isStockItem">Stock Item</Label>
            </div>
          </div>

          {/* Description */}
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

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Part
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
