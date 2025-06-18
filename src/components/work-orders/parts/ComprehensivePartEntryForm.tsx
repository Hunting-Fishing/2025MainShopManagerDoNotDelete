
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusSelector } from '../shared/StatusSelector';
import { WorkOrderJobLine } from '@/types/jobLine';
import { supabase } from '@/integrations/supabase/client';
import { mapPartFormToDatabase } from '@/utils/databaseMappers';
import { toast } from '@/hooks/use-toast';

interface ComprehensivePartEntryFormProps {
  workOrderId?: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedJobLineId, setSelectedJobLineId] = useState(jobLineId || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
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
    }
  });

  const watchedValues = watch();

  const onSubmit = async (data: any) => {
    if (!workOrderId) {
      toast({
        title: "Error",
        description: "Work Order ID is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Use the selected job line ID from the dropdown if available
      const finalJobLineId = selectedJobLineId || jobLineId;
      
      // Map form data to database format
      const mappedData = mapPartFormToDatabase(data, workOrderId, finalJobLineId);
      
      // Insert into database
      const { data: newPart, error } = await supabase
        .from('work_order_parts')
        .insert(mappedData)
        .select()
        .single();

      if (error) {
        console.error('Error creating part:', error);
        toast({
          title: "Error",
          description: "Failed to create part: " + error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Part added successfully"
      });

      // Call the callback with the new part
      if (onPartAdd) {
        onPartAdd(newPart);
      }

      // Reset form
      reset();
      setSelectedJobLineId('');

    } catch (error) {
      console.error('Error creating part:', error);
      toast({
        title: "Error",
        description: "Failed to create part",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="part_name">Part Name *</Label>
              <Input
                id="part_name"
                {...register('part_name', { required: 'Part name is required' })}
                placeholder="Enter part name"
              />
              {errors.part_name && (
                <p className="text-sm text-red-600">{errors.part_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="part_number">Part Number</Label>
              <Input
                id="part_number"
                {...register('part_number')}
                placeholder="Enter part number"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="Enter category"
              />
            </div>

            <div>
              <Label htmlFor="part_type">Part Type</Label>
              <Select
                value={watchedValues.part_type}
                onValueChange={(value) => setValue('part_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select part type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OEM">OEM</SelectItem>
                  <SelectItem value="Aftermarket">Aftermarket</SelectItem>
                  <SelectItem value="Remanufactured">Remanufactured</SelectItem>
                  <SelectItem value="Used">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Job Line Assignment */}
            {jobLines.length > 0 && (
              <div>
                <Label htmlFor="job_line_id">Assign to Job Line</Label>
                <Select
                  value={selectedJobLineId}
                  onValueChange={setSelectedJobLineId}
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
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Quantity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                {...register('quantity', { 
                  required: 'Quantity is required',
                  min: { value: 1, message: 'Quantity must be at least 1' }
                })}
              />
              {errors.quantity && (
                <p className="text-sm text-red-600">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customer_price">Customer Price</Label>
              <Input
                id="customer_price"
                type="number"
                step="0.01"
                min="0"
                {...register('customer_price', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="supplier_cost">Supplier Cost</Label>
              <Input
                id="supplier_cost"
                type="number"
                step="0.01"
                min="0"
                {...register('supplier_cost', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="retail_price">Retail Price</Label>
              <Input
                id="retail_price"
                type="number"
                step="0.01"
                min="0"
                {...register('retail_price', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="markup_percentage">Markup %</Label>
              <Input
                id="markup_percentage"
                type="number"
                step="0.1"
                min="0"
                {...register('markup_percentage', { valueAsNumber: true })}
                placeholder="0.0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Supplier Information */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier & Order Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="supplier_name">Supplier Name</Label>
              <Input
                id="supplier_name"
                {...register('supplier_name')}
                placeholder="Enter supplier name"
              />
            </div>

            <div>
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input
                id="invoice_number"
                {...register('invoice_number')}
                placeholder="Enter invoice number"
              />
            </div>

            <div>
              <Label htmlFor="po_line">PO Line</Label>
              <Input
                id="po_line"
                {...register('po_line')}
                placeholder="Enter PO line"
              />
            </div>

            <div>
              <Label htmlFor="warranty_duration">Warranty Duration</Label>
              <Input
                id="warranty_duration"
                {...register('warranty_duration')}
                placeholder="e.g., 12 months, 2 years"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status & Options */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Status</Label>
              <StatusSelector
                currentStatus={watchedValues.status || 'pending'}
                type="part"
                onStatusChange={(status) => setValue('status', status)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_taxable"
                  checked={watchedValues.is_taxable}
                  onCheckedChange={(checked) => setValue('is_taxable', checked)}
                />
                <Label htmlFor="is_taxable">Taxable</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_stock_item"
                  checked={watchedValues.is_stock_item}
                  onCheckedChange={(checked) => setValue('is_stock_item', checked)}
                />
                <Label htmlFor="is_stock_item">Stock Item</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="core_charge_applied"
                  checked={watchedValues.core_charge_applied}
                  onCheckedChange={(checked) => setValue('core_charge_applied', checked)}
                />
                <Label htmlFor="core_charge_applied">Core Charge Applied</Label>
              </div>
            </div>

            {watchedValues.core_charge_applied && (
              <div>
                <Label htmlFor="core_charge_amount">Core Charge Amount</Label>
                <Input
                  id="core_charge_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('core_charge_amount', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('notes')}
            placeholder="Additional notes about this part..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding Part...' : 'Add Part'}
        </Button>
      </div>
    </form>
  );
}
