
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { CategorySelector } from './CategorySelector';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface ComprehensivePartEntryFormProps {
  onPartAdd: (part: WorkOrderPartFormValues) => void;
  onCancel: () => void;
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
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    name: '',
    part_number: '',
    quantity: 1,
    unit_price: 0,
    status: 'pending',
    notes: '',
    category: '',
    supplier_name: '',
    supplier_cost: 0,
    customer_price: 0,
    retail_price: 0,
    markup_percentage: 0,
    is_taxable: true,
    core_charge_amount: 0,
    core_charge_applied: false,
    warranty_duration: '',
    is_stock_item: false,
    notes_internal: '',
    part_type: 'parts'
  });

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate customer price when supplier cost or markup changes
      if (field === 'supplier_cost' || field === 'markup_percentage') {
        const supplierCost = field === 'supplier_cost' ? value : updated.supplier_cost || 0;
        const markup = field === 'markup_percentage' ? value : updated.markup_percentage || 0;
        if (supplierCost > 0 && markup > 0) {
          updated.customer_price = supplierCost * (1 + markup / 100);
          updated.retail_price = updated.customer_price;
          updated.unit_price = updated.customer_price;
        }
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.part_number.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and Part Number are required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting part data:', formData);
      
      // Create the part data object without the description field
      const partData = {
        work_order_id: workOrderId,
        job_line_id: jobLineId,
        name: formData.name,
        part_number: formData.part_number,
        quantity: formData.quantity,
        unit_price: formData.unit_price || formData.customer_price || 0,
        total_price: (formData.quantity || 1) * (formData.unit_price || formData.customer_price || 0),
        status: formData.status || 'pending',
        notes: formData.notes || '',
        category: formData.category,
        supplier_name: formData.supplier_name,
        supplier_cost: formData.supplier_cost,
        customer_price: formData.customer_price,
        retail_price: formData.retail_price,
        markup_percentage: formData.markup_percentage,
        is_taxable: formData.is_taxable,
        core_charge_amount: formData.core_charge_amount,
        core_charge_applied: formData.core_charge_applied,
        warranty_duration: formData.warranty_duration,
        is_stock_item: formData.is_stock_item,
        notes_internal: formData.notes_internal,
        part_type: formData.part_type
      };

      console.log('Sending part data to database:', partData);

      const { data, error } = await supabase
        .from('work_order_parts')
        .insert([partData])
        .select()
        .single();

      if (error) {
        console.error('Error adding part:', error);
        toast({
          title: "Error",
          description: `Failed to add part: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Part added successfully:', data);
      
      toast({
        title: "Success",
        description: "Part added successfully"
      });

      // Call the onPartAdd callback with the form data
      onPartAdd(formData);
      
    } catch (error) {
      console.error('Error adding part:', error);
      toast({
        title: "Error",
        description: "Failed to add part",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label htmlFor="unit_price">Unit Price</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_price}
                  onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Total Price</Label>
                <div className="p-2 bg-gray-50 rounded border">
                  ${((formData.quantity || 1) * (formData.unit_price || 0)).toFixed(2)}
                </div>
              </div>
            </div>

            <CategorySelector
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            />
          </CardContent>
        </Card>

        {/* Supplier Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplier_name">Supplier</Label>
              <Input
                id="supplier_name"
                value={formData.supplier_name}
                onChange={(e) => handleInputChange('supplier_name', e.target.value)}
                placeholder="Enter supplier name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier_cost">Supplier Cost</Label>
                <Input
                  id="supplier_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.supplier_cost}
                  onChange={(e) => handleInputChange('supplier_cost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="markup_percentage">Markup %</Label>
                <Input
                  id="markup_percentage"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.markup_percentage}
                  onChange={(e) => handleInputChange('markup_percentage', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_price">Customer Price</Label>
                <Input
                  id="customer_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.customer_price}
                  onChange={(e) => handleInputChange('customer_price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retail_price">Retail Price</Label>
                <Input
                  id="retail_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.retail_price}
                  onChange={(e) => handleInputChange('retail_price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="core_charge_amount">Core Charge</Label>
              <Input
                id="core_charge_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.core_charge_amount}
                onChange={(e) => handleInputChange('core_charge_amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </CardContent>
        </Card>

        {/* Warranty & Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Warranty & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warranty_duration">Warranty Duration</Label>
              <Input
                id="warranty_duration"
                value={formData.warranty_duration}
                onChange={(e) => handleInputChange('warranty_duration', e.target.value)}
                placeholder="e.g., 12 months, 36,000 miles"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Customer Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Notes visible to customer..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes_internal">Internal Notes</Label>
              <Textarea
                id="notes_internal"
                value={formData.notes_internal}
                onChange={(e) => handleInputChange('notes_internal', e.target.value)}
                placeholder="Internal notes (not visible to customer)..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_taxable"
                checked={formData.is_taxable}
                onCheckedChange={(checked) => handleInputChange('is_taxable', checked)}
              />
              <Label htmlFor="is_taxable">Taxable Item</Label>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding Part...
              </>
            ) : (
              'Add Part'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
