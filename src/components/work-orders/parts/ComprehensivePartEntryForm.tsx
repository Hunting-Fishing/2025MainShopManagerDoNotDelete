
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface ComprehensivePartEntryFormProps {
  workOrderId?: string;
  jobLineId?: string;
  onPartAdd: (part: any) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ComprehensivePartEntryForm({ 
  workOrderId, 
  jobLineId, 
  onPartAdd, 
  onCancel,
  isLoading = false 
}: ComprehensivePartEntryFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    part_name: '',
    part_number: '',
    quantity: 1,
    customer_price: 0,
    supplier_cost: 0,
    retail_price: 0,
    supplier_name: '',
    category: '',
    part_type: 'OEM',
    markup_percentage: 0,
    is_taxable: true,
    core_charge_amount: 0,
    core_charge_applied: false,
    warranty_duration: '',
    invoice_number: '',
    po_line: '',
    is_stock_item: false,
    notes: '',
    status: 'pending'
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate markup percentage when prices change
      if (field === 'supplier_cost' || field === 'customer_price') {
        const supplierCost = field === 'supplier_cost' ? value : updated.supplier_cost;
        const customerPrice = field === 'customer_price' ? value : updated.customer_price;
        
        if (supplierCost > 0) {
          updated.markup_percentage = ((customerPrice - supplierCost) / supplierCost) * 100;
        }
      }
      
      // Auto-calculate customer price when markup changes
      if (field === 'markup_percentage' && updated.supplier_cost > 0) {
        updated.customer_price = updated.supplier_cost * (1 + (value / 100));
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workOrderId) {
      toast({
        title: "Error",
        description: "Work Order ID is required",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      // Prepare data for database insertion with correct column names
      const partData = {
        work_order_id: workOrderId,
        job_line_id: jobLineId || null,
        part_name: formData.part_name,
        part_number: formData.part_number,
        quantity: formData.quantity,
        customer_price: formData.customer_price,
        supplier_cost: formData.supplier_cost,
        retail_price: formData.retail_price,
        supplier_name: formData.supplier_name,
        category: formData.category,
        part_type: formData.part_type,
        markup_percentage: formData.markup_percentage,
        is_taxable: formData.is_taxable,
        core_charge_amount: formData.core_charge_amount,
        core_charge_applied: formData.core_charge_applied,
        warranty_duration: formData.warranty_duration,
        invoice_number: formData.invoice_number,
        po_line: formData.po_line,
        is_stock_item: formData.is_stock_item,
        notes: formData.notes,
        status: formData.status
      };

      console.log('Saving part data:', partData);

      // Save directly to database
      const { data, error } = await supabase
        .from('work_order_parts')
        .insert([partData])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Part saved successfully:', data);

      toast({
        title: "Success",
        description: "Part added successfully"
      });

      // Call the callback with the saved part
      onPartAdd(data);

      // Reset form
      setFormData({
        part_name: '',
        part_number: '',
        quantity: 1,
        customer_price: 0,
        supplier_cost: 0,
        retail_price: 0,
        supplier_name: '',
        category: '',
        part_type: 'OEM',
        markup_percentage: 0,
        is_taxable: true,
        core_charge_amount: 0,
        core_charge_applied: false,
        warranty_duration: '',
        invoice_number: '',
        po_line: '',
        is_stock_item: false,
        notes: '',
        status: 'pending'
      });

    } catch (error) {
      console.error('Error adding part:', error);
      toast({
        title: "Error",
        description: `Failed to add part: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Part</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Part Name *</label>
              <Input
                value={formData.part_name}
                onChange={(e) => handleInputChange('part_name', e.target.value)}
                required
                placeholder="Enter part name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Part Number *</label>
              <Input
                value={formData.part_number}
                onChange={(e) => handleInputChange('part_number', e.target.value)}
                required
                placeholder="Enter part number"
              />
            </div>
          </div>

          {/* Pricing Information */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quantity *</label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Supplier Cost</label>
              <Input
                type="number"
                step="0.01"
                value={formData.supplier_cost}
                onChange={(e) => handleInputChange('supplier_cost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Customer Price *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.customer_price}
                onChange={(e) => handleInputChange('customer_price', parseFloat(e.target.value) || 0)}
                required
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Supplier Name</label>
              <Input
                value={formData.supplier_name}
                onChange={(e) => handleInputChange('supplier_name', e.target.value)}
                placeholder="Enter supplier name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Enter category"
              />
            </div>
          </div>

          {/* Part Type and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Part Type</label>
              <Select value={formData.part_type} onValueChange={(value) => handleInputChange('part_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OEM">OEM</SelectItem>
                  <SelectItem value="Aftermarket">Aftermarket</SelectItem>
                  <SelectItem value="Rebuilt">Rebuilt</SelectItem>
                  <SelectItem value="Used">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="installed">Installed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_taxable"
                checked={formData.is_taxable}
                onCheckedChange={(checked) => handleInputChange('is_taxable', checked)}
              />
              <label htmlFor="is_taxable" className="text-sm font-medium">Taxable</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_stock_item"
                checked={formData.is_stock_item}
                onCheckedChange={(checked) => handleInputChange('is_stock_item', checked)}
              />
              <label htmlFor="is_stock_item" className="text-sm font-medium">Stock Item</label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          {/* Markup Percentage (Read-only) */}
          {formData.markup_percentage > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Markup Percentage</label>
              <Input
                type="number"
                value={formData.markup_percentage.toFixed(2)}
                readOnly
                className="bg-gray-100"
              />
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={saving || isLoading}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={saving || isLoading || !formData.part_name || !formData.part_number}>
              {saving ? 'Adding Part...' : 'Add Part'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
