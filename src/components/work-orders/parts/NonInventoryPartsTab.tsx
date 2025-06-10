
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Save } from 'lucide-react';
import { WorkOrderPartFormValues, PART_CATEGORIES, PART_STATUSES, WARRANTY_DURATIONS } from '@/types/workOrderPart';
import { saveWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
  onPartSaved: () => void;
}

export function NonInventoryPartsTab({
  workOrderId,
  jobLineId,
  onAddPart,
  onPartSaved
}: NonInventoryPartsTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    supplierSuggestedRetailPrice: 0,
    markupPercentage: 25,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'non-inventory',
    category: '',
    isTaxable: true,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    warrantyDuration: '',
    status: 'ordered',
    isStockItem: false,
    notes: '',
    attachments: []
  });

  const calculatePrices = (cost: number, markup: number, suggestedRetail?: number) => {
    const retailPrice = suggestedRetail && suggestedRetail > 0 ? suggestedRetail : cost * (1 + markup / 100);
    const customerPrice = retailPrice;
    
    setFormData(prev => ({
      ...prev,
      retailPrice,
      customerPrice
    }));
  };

  const handleCostChange = (value: number) => {
    setFormData(prev => ({ ...prev, supplierCost: value }));
    calculatePrices(value, formData.markupPercentage, formData.supplierSuggestedRetailPrice);
  };

  const handleMarkupChange = (value: number) => {
    setFormData(prev => ({ ...prev, markupPercentage: value }));
    calculatePrices(formData.supplierCost, value, formData.supplierSuggestedRetailPrice);
  };

  const handleSuggestedRetailChange = (value: number) => {
    setFormData(prev => ({ ...prev, supplierSuggestedRetailPrice: value }));
    calculatePrices(formData.supplierCost, formData.markupPercentage, value);
  };

  const handleAddToList = () => {
    if (!formData.partName.trim()) {
      toast.error('Part name is required');
      return;
    }

    onAddPart(formData);
    
    // Reset form
    setFormData({
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: 0,
      supplierSuggestedRetailPrice: 0,
      markupPercentage: 25,
      retailPrice: 0,
      customerPrice: 0,
      quantity: 1,
      partType: 'non-inventory',
      category: '',
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      warrantyDuration: '',
      status: 'ordered',
      isStockItem: false,
      notes: '',
      attachments: []
    });
    
    toast.success('Part added to list');
  };

  const handleSaveDirectly = async () => {
    if (!formData.partName.trim()) {
      toast.error('Part name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Saving non-inventory part:', formData);
      await saveWorkOrderPart(workOrderId, jobLineId, formData);
      
      // Reset form
      setFormData({
        partName: '',
        partNumber: '',
        supplierName: '',
        supplierCost: 0,
        supplierSuggestedRetailPrice: 0,
        markupPercentage: 25,
        retailPrice: 0,
        customerPrice: 0,
        quantity: 1,
        partType: 'non-inventory',
        category: '',
        isTaxable: true,
        coreChargeAmount: 0,
        coreChargeApplied: false,
        warrantyDuration: '',
        status: 'ordered',
        isStockItem: false,
        notes: '',
        attachments: []
      });
      
      toast.success('Part saved successfully');
      onPartSaved();
    } catch (error) {
      console.error('Error saving part:', error);
      toast.error('Failed to save part: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = formData.quantity * formData.customerPrice;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Add Non-Inventory Part</span>
          <Badge variant="outline">{formData.partType}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="partName">Part Name *</Label>
            <Input
              id="partName"
              value={formData.partName}
              onChange={(e) => setFormData(prev => ({ ...prev, partName: e.target.value }))}
              placeholder="Enter part name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partNumber">Part Number</Label>
            <Input
              id="partNumber"
              value={formData.partNumber || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, partNumber: e.target.value }))}
              placeholder="Enter part number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierName">Supplier</Label>
            <Input
              id="supplierName"
              value={formData.supplierName || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, supplierName: e.target.value }))}
              placeholder="Enter supplier name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PART_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <Label htmlFor="supplierCost">Supplier Cost</Label>
            <Input
              id="supplierCost"
              type="number"
              step="0.01"
              min="0"
              value={formData.supplierCost}
              onChange={(e) => handleCostChange(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggestedRetail">Suggested Retail Price</Label>
            <Input
              id="suggestedRetail"
              type="number"
              step="0.01"
              min="0"
              value={formData.supplierSuggestedRetailPrice || ''}
              onChange={(e) => handleSuggestedRetailChange(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="markup">Markup %</Label>
            <Input
              id="markup"
              type="number"
              min="0"
              value={formData.markupPercentage}
              onChange={(e) => handleMarkupChange(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPrice">Customer Price</Label>
            <Input
              id="customerPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.customerPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, customerPrice: parseFloat(e.target.value) || 0 }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PART_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="warranty">Warranty</Label>
            <Select
              value={formData.warrantyDuration || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, warrantyDuration: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select warranty" />
              </SelectTrigger>
              <SelectContent>
                {WARRANTY_DURATIONS.map(duration => (
                  <SelectItem key={duration} value={duration}>
                    {duration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional notes..."
            rows={3}
          />
        </div>

        {/* Price Summary */}
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Price:</span>
            <span className="text-lg font-bold">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {formData.quantity} × ${formData.customerPrice.toFixed(2)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleAddToList}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add to List
          </Button>
          <Button
            onClick={handleSaveDirectly}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Part'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
