
import React, { useState } from 'react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { WORK_ORDER_PART_STATUSES } from '@/types/workOrderPart';
import { supabase } from '@/integrations/supabase/client';

interface ComprehensivePartEntryFormProps {
  onPartAdd: (part: WorkOrderPartFormValues) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  workOrderId?: string;
  jobLineId?: string;
}

export function ComprehensivePartEntryForm({ 
  onPartAdd, 
  onCancel, 
  isLoading = false,
  workOrderId,
  jobLineId 
}: ComprehensivePartEntryFormProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    part_number: '',
    name: '',
    unit_price: 0,
    quantity: 1,
    description: '',
    status: 'pending',
    notes: '',
    // Optional fields mapped to correct database columns
    supplierName: '',
    supplierCost: 0,
    customerPrice: 0,
    retailPrice: 0,
    category: '',
    partType: '',
    markupPercentage: 0,
    isTaxable: false,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    warrantyDuration: '',
    invoiceNumber: '',
    poLine: '',
    isStockItem: false,
    notesInternal: '',
    inventoryItemId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workOrderId) {
      console.error('Work Order ID is required');
      return;
    }

    try {
      // Map form data to database schema
      const partData = {
        work_order_id: workOrderId,
        job_line_id: jobLineId || null,
        part_number: formData.part_number,
        part_name: formData.name, // Map 'name' to 'part_name'
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        total_price: formData.quantity * formData.unit_price,
        status: formData.status,
        notes: formData.description || formData.notes, // Map 'description' to 'notes'
        category: formData.category,
        supplier_name: formData.supplierName,
        supplier_cost: formData.supplierCost,
        retail_price: formData.retailPrice,
        customer_price: formData.customerPrice || formData.unit_price,
        markup_percentage: formData.markupPercentage,
        is_taxable: formData.isTaxable,
        core_charge_amount: formData.coreChargeAmount,
        core_charge_applied: formData.coreChargeApplied,
        warranty_duration: formData.warrantyDuration,
        invoice_number: formData.invoiceNumber,
        po_line: formData.poLine,
        is_stock_item: formData.isStockItem,
        part_type: formData.partType,
        inventory_item_id: formData.inventoryItemId || null
      };

      console.log('Saving part data:', partData);

      // Save to database
      const { data, error } = await supabase
        .from('work_order_parts')
        .insert(partData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Part saved successfully:', data);

      // Call the callback with the original form structure
      onPartAdd(formData);
    } catch (error) {
      console.error('Error adding part:', error);
      throw error;
    }
  };

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add Part</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => handleInputChange('part_number', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Part Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Quantity and Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div>
              <Label htmlFor="unit_price">Unit Price *</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="customer_price">Customer Price</Label>
              <Input
                id="customer_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.customerPrice}
                onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Status and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {WORK_ORDER_PART_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace(/[-_]/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
              />
            </div>
          </div>

          {/* Supplier Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier_name">Supplier Name</Label>
              <Input
                id="supplier_name"
                value={formData.supplierName || ''}
                onChange={(e) => handleInputChange('supplierName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="supplier_cost">Supplier Cost</Label>
              <Input
                id="supplier_cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.supplierCost}
                onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_taxable"
                checked={formData.isTaxable}
                onCheckedChange={(checked) => handleInputChange('isTaxable', checked)}
              />
              <Label htmlFor="is_taxable">Taxable</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_stock_item"
                checked={formData.isStockItem}
                onCheckedChange={(checked) => handleInputChange('isStockItem', checked)}
              />
              <Label htmlFor="is_stock_item">Stock Item</Label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes/Description</Label>
            <Textarea
              id="notes"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Part'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
