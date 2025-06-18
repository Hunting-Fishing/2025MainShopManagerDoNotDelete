import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { mapPartFormToDatabase } from '@/utils/databaseMappers';
import { WorkOrderJobLine } from '@/types/jobLine';

interface ComprehensivePartEntryFormProps {
  workOrderId: string;
  jobLineId?: string;
  jobLines?: WorkOrderJobLine[];
  onPartAdd?: (part: any) => void;
  onCancel?: () => void;
}

export function ComprehensivePartEntryForm({
  workOrderId,
  jobLineId,
  jobLines = [],
  onPartAdd,
  onCancel
}: ComprehensivePartEntryFormProps) {
  const { toast } = useToast();
  
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
    status: 'pending',
    job_line_id: jobLineId || null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update job line selection when jobLineId prop changes
  useEffect(() => {
    if (jobLineId) {
      setFormData(prev => ({ ...prev, job_line_id: jobLineId }));
    }
  }, [jobLineId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate markup percentage when costs change
      if (field === 'supplier_cost' || field === 'customer_price') {
        const supplierCost = field === 'supplier_cost' ? value : updated.supplier_cost;
        const customerPrice = field === 'customer_price' ? value : updated.customer_price;
        
        if (supplierCost > 0) {
          updated.markup_percentage = ((customerPrice - supplierCost) / supplierCost) * 100;
        }
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.part_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Part name is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Map form data to database schema
      const partData = mapPartFormToDatabase(formData, workOrderId, formData.job_line_id);
      
      console.log('Submitting part data:', partData);
      
      // Save directly to database
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
      
      toast({
        title: "Success",
        description: "Part added successfully",
      });
      
      // Call the callback with the saved part
      if (onPartAdd) {
        onPartAdd(data);
      }
      
    } catch (error) {
      console.error('Error saving part:', error);
      toast({
        title: "Error",
        description: "Failed to save part. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="part_name">Part Name *</Label>
              <Input
                id="part_name"
                value={formData.part_name}
                onChange={(e) => handleInputChange('part_name', e.target.value)}
                placeholder="Enter part name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="part_number">Part Number</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => handleInputChange('part_number', e.target.value)}
                placeholder="Enter part number"
              />
            </div>
            
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
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Enter category"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Description/Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter description or notes"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Job Line Assignment */}
      {jobLines && jobLines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Job Line Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="job_line_id">Assign to Job Line (Optional)</Label>
              <Select
                value={formData.job_line_id || ''}
                onValueChange={(value) => handleInputChange('job_line_id', value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a job line or leave unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {jobLines.map((jobLine) => (
                    <SelectItem key={jobLine.id} value={jobLine.id}>
                      {jobLine.name} - {jobLine.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="supplier_cost">Supplier Cost</Label>
              <Input
                id="supplier_cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.supplier_cost}
                onChange={(e) => handleInputChange('supplier_cost', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label htmlFor="customer_price">Customer Price</Label>
              <Input
                id="customer_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.customer_price}
                onChange={(e) => handleInputChange('customer_price', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label htmlFor="retail_price">Retail Price</Label>
              <Input
                id="retail_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.retail_price}
                onChange={(e) => handleInputChange('retail_price', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="markup_percentage">Markup %</Label>
              <Input
                id="markup_percentage"
                type="number"
                step="0.01"
                value={formData.markup_percentage.toFixed(2)}
                onChange={(e) => handleInputChange('markup_percentage', parseFloat(e.target.value) || 0)}
                readOnly
              />
            </div>
            
            <div>
              <Label htmlFor="supplier_name">Supplier</Label>
              <Input
                id="supplier_name"
                value={formData.supplier_name}
                onChange={(e) => handleInputChange('supplier_name', e.target.value)}
                placeholder="Enter supplier name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="part_type">Part Type</Label>
              <Select
                value={formData.part_type}
                onValueChange={(value) => handleInputChange('part_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OEM">OEM</SelectItem>
                  <SelectItem value="Aftermarket">Aftermarket</SelectItem>
                  <SelectItem value="Remanufactured">Remanufactured</SelectItem>
                  <SelectItem value="Used">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="warranty_duration">Warranty Duration</Label>
              <Input
                id="warranty_duration"
                value={formData.warranty_duration}
                onChange={(e) => handleInputChange('warranty_duration', e.target.value)}
                placeholder="e.g., 12 months, 2 years"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_taxable"
              checked={formData.is_taxable}
              onCheckedChange={(checked) => handleInputChange('is_taxable', checked)}
            />
            <Label htmlFor="is_taxable">Taxable Item</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_stock_item"
              checked={formData.is_stock_item}
              onCheckedChange={(checked) => handleInputChange('is_stock_item', checked)}
            />
            <Label htmlFor="is_stock_item">Stock Item</Label>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding Part...' : 'Add Part'}
        </Button>
      </div>
    </form>
  );
}
