
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plus, Save } from 'lucide-react';
import { WorkOrderPartFormValues, PART_CATEGORIES, PART_STATUSES, WARRANTY_DURATIONS } from '@/types/workOrderPart';
import { saveWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
  onPartSaved?: () => void;
}

export function NonInventoryPartsTab({ 
  workOrderId, 
  jobLineId, 
  onAddPart,
  onPartSaved 
}: NonInventoryPartsTabProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    supplierSuggestedRetailPrice: 0,
    markupPercentage: 0,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'non-inventory',
    invoiceNumber: '',
    poLine: '',
    notes: '',
    category: '',
    isTaxable: true,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    warrantyDuration: '',
    installDate: '',
    installedBy: '',
    status: 'ordered',
    isStockItem: false,
    notesInternal: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate customer price when cost or markup changes
      if (field === 'supplierCost' || field === 'markupPercentage') {
        const cost = field === 'supplierCost' ? value : updated.supplierCost;
        const markup = field === 'markupPercentage' ? value : updated.markupPercentage;
        
        if (cost > 0 && markup > 0) {
          updated.customerPrice = cost * (1 + markup / 100);
          updated.retailPrice = updated.customerPrice;
        }
      }
      
      return updated;
    });
  };

  const resetForm = () => {
    setFormData({
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: 0,
      supplierSuggestedRetailPrice: 0,
      markupPercentage: 0,
      retailPrice: 0,
      customerPrice: 0,
      quantity: 1,
      partType: 'non-inventory',
      invoiceNumber: '',
      poLine: '',
      notes: '',
      category: '',
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      warrantyDuration: '',
      installDate: '',
      installedBy: '',
      status: 'ordered',
      isStockItem: false,
      notesInternal: ''
    });
  };

  const handleAddAnotherPart = () => {
    if (!formData.partName.trim()) {
      toast.error('Part name is required');
      return;
    }

    onAddPart(formData);
    resetForm();
    toast.success('Part added to selection');
  };

  const handleSavePartToWorkOrder = async () => {
    if (!formData.partName.trim()) {
      toast.error('Part name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveWorkOrderPart(workOrderId, jobLineId, formData);
      resetForm();
      toast.success('Part saved to work order');
      onPartSaved?.();
    } catch (error) {
      console.error('Error saving part:', error);
      toast.error('Failed to save part');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Non-Inventory Part Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partName">Part Name *</Label>
              <Input
                id="partName"
                value={formData.partName}
                onChange={(e) => handleInputChange('partName', e.target.value)}
                placeholder="Enter part name"
              />
            </div>
            
            <div>
              <Label htmlFor="partNumber">Part Number</Label>
              <Input
                id="partNumber"
                value={formData.partNumber}
                onChange={(e) => handleInputChange('partNumber', e.target.value)}
                placeholder="Enter part number"
              />
            </div>
          </div>

          {/* Supplier Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplierName">Supplier Name</Label>
              <Input
                id="supplierName"
                value={formData.supplierName}
                onChange={(e) => handleInputChange('supplierName', e.target.value)}
                placeholder="Enter supplier name"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {PART_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="supplierCost">Supplier Cost</Label>
              <Input
                id="supplierCost"
                type="number"
                step="0.01"
                value={formData.supplierCost}
                onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="markupPercentage">Markup %</Label>
              <Input
                id="markupPercentage"
                type="number"
                step="0.1"
                value={formData.markupPercentage}
                onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            
            <div>
              <Label htmlFor="customerPrice">Customer Price</Label>
              <Input
                id="customerPrice"
                type="number"
                step="0.01"
                value={formData.customerPrice}
                onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Quantity and Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PART_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="warrantyDuration">Warranty</Label>
              <Select value={formData.warrantyDuration} onValueChange={(value) => handleInputChange('warrantyDuration', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warranty" />
                </SelectTrigger>
                <SelectContent>
                  {WARRANTY_DURATIONS.map((duration) => (
                    <SelectItem key={duration} value={duration}>
                      {duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                placeholder="Enter invoice number"
              />
            </div>
            
            <div>
              <Label htmlFor="poLine">PO Line</Label>
              <Input
                id="poLine"
                value={formData.poLine}
                onChange={(e) => handleInputChange('poLine', e.target.value)}
                placeholder="Enter PO line"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex items-center space-x-6">
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
                id="coreChargeApplied"
                checked={formData.coreChargeApplied}
                onCheckedChange={(checked) => handleInputChange('coreChargeApplied', checked)}
              />
              <Label htmlFor="coreChargeApplied">Core Charge Applied</Label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any notes about this part"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleAddAnotherPart}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4" />
              Add Another Part
            </Button>
            
            <Button
              onClick={handleSavePartToWorkOrder}
              className="flex items-center gap-2"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Part to Work Order'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
