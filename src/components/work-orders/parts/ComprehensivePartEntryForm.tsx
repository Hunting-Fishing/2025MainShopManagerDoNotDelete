
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WORK_ORDER_PART_STATUSES } from '@/types/workOrderPart';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { mapPartFormToDatabase } from '@/utils/databaseMappers';
import { toast } from '@/hooks/use-toast';

const partFormSchema = z.object({
  part_name: z.string().min(1, 'Part name is required'),
  part_number: z.string().min(1, 'Part number is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  customer_price: z.number().min(0, 'Price must be non-negative'),
  supplier_cost: z.number().min(0, 'Cost must be non-negative'),
  category: z.string().optional(),
  supplier_name: z.string().optional(),
  part_type: z.string().default('OEM'),
  status: z.string().default('pending'),
  job_line_id: z.string().optional(),
  notes: z.string().optional(),
  is_taxable: z.boolean().default(true),
  core_charge_amount: z.number().min(0).default(0),
  warranty_duration: z.string().optional(),
  invoice_number: z.string().optional(),
  po_line: z.string().optional(),
  is_stock_item: z.boolean().default(false)
});

type PartFormValues = z.infer<typeof partFormSchema>;

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
  jobLines = [],
  onPartAdd,
  onCancel
}: ComprehensivePartEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<PartFormValues>({
    resolver: zodResolver(partFormSchema),
    defaultValues: {
      part_name: '',
      part_number: '',
      quantity: 1,
      customer_price: 0,
      supplier_cost: 0,
      category: '',
      supplier_name: '',
      part_type: 'OEM',
      status: 'pending',
      job_line_id: jobLineId || '',
      notes: '',
      is_taxable: true,
      core_charge_amount: 0,
      warranty_duration: '',
      invoice_number: '',
      po_line: '',
      is_stock_item: false
    }
  });

  const selectedJobLineId = watch('job_line_id');
  const customerPrice = watch('customer_price');
  const supplierCost = watch('supplier_cost');
  const quantity = watch('quantity');

  // Calculate markup percentage
  const markupPercentage = supplierCost > 0 ? ((customerPrice - supplierCost) / supplierCost) * 100 : 0;

  const onSubmit = async (data: PartFormValues) => {
    if (!workOrderId) {
      toast({
        title: "Error",
        description: "Work order ID is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Submitting part form data:', data);
      
      // Map form data to database format with both workOrderId and jobLineId
      const mappedData = mapPartFormToDatabase(data, workOrderId, data.job_line_id);
      
      console.log('Mapped data for database:', mappedData);
      
      // Create the part in the database
      const createdPart = await createWorkOrderPart(mappedData);
      
      console.log('Part created successfully:', createdPart);
      
      toast({
        title: "Success",
        description: "Part added successfully",
      });
      
      // Call the callback with the created part
      onPartAdd(createdPart);
      
      // Reset the form
      reset();
      
    } catch (error) {
      console.error('Error creating part:', error);
      toast({
        title: "Error",
        description: "Failed to add part. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                {...register('part_name')}
                placeholder="Enter part name"
              />
              {errors.part_name && (
                <p className="text-sm text-red-500 mt-1">{errors.part_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                {...register('part_number')}
                placeholder="Enter part number"
              />
              {errors.part_number && (
                <p className="text-sm text-red-500 mt-1">{errors.part_number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                {...register('quantity', { valueAsNumber: true })}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="Enter category"
              />
            </div>
          </div>

          {/* Job Line Assignment */}
          {jobLines && jobLines.length > 0 && (
            <div>
              <Label htmlFor="job_line_id">Assign to Job Line (Optional)</Label>
              <Select value={selectedJobLineId} onValueChange={(value) => setValue('job_line_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job line or leave unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
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
          <CardTitle>Pricing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_price">Customer Price *</Label>
              <Input
                id="customer_price"
                type="number"
                step="0.01"
                min="0"
                {...register('customer_price', { valueAsNumber: true })}
              />
              {errors.customer_price && (
                <p className="text-sm text-red-500 mt-1">{errors.customer_price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="supplier_cost">Supplier Cost</Label>
              <Input
                id="supplier_cost"
                type="number"
                step="0.01"
                min="0"
                {...register('supplier_cost', { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label>Markup Percentage</Label>
              <Input
                value={`${markupPercentage.toFixed(1)}%`}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label>Total Price</Label>
              <Input
                value={`$${(customerPrice * quantity).toFixed(2)}`}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_taxable"
              checked={watch('is_taxable')}
              onCheckedChange={(checked) => setValue('is_taxable', !!checked)}
            />
            <Label htmlFor="is_taxable">Taxable</Label>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Information */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier & Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier_name">Supplier Name</Label>
              <Input
                id="supplier_name"
                {...register('supplier_name')}
                placeholder="Enter supplier name"
              />
            </div>

            <div>
              <Label htmlFor="part_type">Part Type</Label>
              <Select value={watch('part_type')} onValueChange={(value) => setValue('part_type', value)}>
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
              <Label htmlFor="status">Status</Label>
              <Select value={watch('status')} onValueChange={(value) => setValue('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORK_ORDER_PART_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="warranty_duration">Warranty Duration</Label>
              <Input
                id="warranty_duration"
                {...register('warranty_duration')}
                placeholder="e.g., 12 months, 2 years"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="core_charge_amount">Core Charge Amount</Label>
              <Input
                id="core_charge_amount"
                type="number"
                step="0.01"
                min="0"
                {...register('core_charge_amount', { valueAsNumber: true })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_stock_item"
                checked={watch('is_stock_item')}
                onCheckedChange={(checked) => setValue('is_stock_item', !!checked)}
              />
              <Label htmlFor="is_stock_item">Stock Item</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
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
