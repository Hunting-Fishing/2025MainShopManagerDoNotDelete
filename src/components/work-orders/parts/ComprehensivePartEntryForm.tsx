
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { mapPartFormToDatabase } from '@/utils/databaseMappers';
import { WorkOrderJobLine } from '@/types/jobLine';
import { StatusSelector } from '../shared/StatusSelector';

interface ComprehensivePartEntryFormProps {
  workOrderId?: string;
  jobLineId?: string;
  jobLines?: WorkOrderJobLine[];
  onPartAdd: (part: any) => void;
  onCancel: () => void;
}

export function ComprehensivePartEntryForm({
  workOrderId,
  jobLineId,
  jobLines,
  onPartAdd,
  onCancel,
}: ComprehensivePartEntryFormProps) {
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
    job_line_id: jobLineId || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

    if (!formData.part_name.trim()) {
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
      console.log('Submitting part with data:', formData);
      console.log('Work Order ID:', workOrderId);
      console.log('Job Line ID:', formData.job_line_id);

      // Map form data to database schema
      const partData = mapPartFormToDatabase(formData, workOrderId, formData.job_line_id || undefined);
      
      console.log('Mapped part data:', partData);

      // Insert into work_order_parts table
      const { data: insertedPart, error } = await supabase
        .from('work_order_parts')
        .insert([partData])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Part inserted successfully:', insertedPart);

      toast({
        title: "Success",
        description: "Part added successfully",
      });

      // Call the callback with the inserted part
      onPartAdd(insertedPart);

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
        status: 'pending',
        job_line_id: jobLineId || ''
      });

    } catch (error) {
      console.error('Error adding part:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add part",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="part_name">Part Name *</Label>
          <Input
            id="part_name"
            value={formData.part_name}
            onChange={(e) => handleInputChange('part_name', e.target.value)}
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
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            placeholder="Enter category"
          />
        </div>
      </div>

      {/* Job Line Assignment */}
      {jobLines && jobLines.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="job_line_id">Assign to Job Line</Label>
          <Select
            value={formData.job_line_id}
            onValueChange={(value) => handleInputChange('job_line_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a job line (optional)" />
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
      )}

      {/* Pricing Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer_price">Customer Price</Label>
          <Input
            id="customer_price"
            type="number"
            min="0"
            step="0.01"
            value={formData.customer_price}
            onChange={(e) => handleInputChange('customer_price', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier_cost">Supplier Cost</Label>
          <Input
            id="supplier_cost"
            type="number"
            min="0"
            step="0.01"
            value={formData.supplier_cost}
            onChange={(e) => handleInputChange('supplier_cost', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="retail_price">Retail Price</Label>
          <Input
            id="retail_price"
            type="number"
            min="0"
            step="0.01"
            value={formData.retail_price}
            onChange={(e) => handleInputChange('retail_price', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Supplier Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplier_name">Supplier Name</Label>
          <Input
            id="supplier_name"
            value={formData.supplier_name}
            onChange={(e) => handleInputChange('supplier_name', e.target.value)}
            placeholder="Enter supplier name"
          />
        </div>

        <div className="space-y-2">
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
              <SelectItem value="Used">Used</SelectItem>
              <SelectItem value="Remanufactured">Remanufactured</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="markup_percentage">Markup Percentage</Label>
          <Input
            id="markup_percentage"
            type="number"
            min="0"
            step="0.01"
            value={formData.markup_percentage}
            onChange={(e) => handleInputChange('markup_percentage', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="core_charge_amount">Core Charge Amount</Label>
          <Input
            id="core_charge_amount"
            type="number"
            min="0"
            step="0.01"
            value={formData.core_charge_amount}
            onChange={(e) => handleInputChange('core_charge_amount', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_taxable"
            checked={formData.is_taxable}
            onCheckedChange={(checked) => handleInputChange('is_taxable', checked === true)}
          />
          <Label htmlFor="is_taxable">Taxable</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="core_charge_applied"
            checked={formData.core_charge_applied}
            onCheckedChange={(checked) => handleInputChange('core_charge_applied', checked === true)}
          />
          <Label htmlFor="core_charge_applied">Core Charge Applied</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_stock_item"
            checked={formData.is_stock_item}
            onCheckedChange={(checked) => handleInputChange('is_stock_item', checked === true)}
          />
          <Label htmlFor="is_stock_item">Stock Item</Label>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="warranty_duration">Warranty Duration</Label>
          <Input
            id="warranty_duration"
            value={formData.warranty_duration}
            onChange={(e) => handleInputChange('warranty_duration', e.target.value)}
            placeholder="e.g., 12 months, 2 years"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoice_number">Invoice Number</Label>
          <Input
            id="invoice_number"
            value={formData.invoice_number}
            onChange={(e) => handleInputChange('invoice_number', e.target.value)}
            placeholder="Enter invoice number"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="po_line">PO Line</Label>
        <Input
          id="po_line"
          value={formData.po_line}
          onChange={(e) => handleInputChange('po_line', e.target.value)}
          placeholder="Enter PO line"
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>Status</Label>
        <StatusSelector
          currentStatus={formData.status}
          type="part"
          onStatusChange={(status) => handleInputChange('status', status)}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Enter any additional notes..."
          className="min-h-20"
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding Part...' : 'Add Part'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
