
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { WorkOrderPartFormValues, PART_CATEGORIES, PART_STATUSES, WARRANTY_DURATIONS } from '@/types/workOrderPart';

const partFormSchema = z.object({
  partName: z.string().min(1, 'Part name is required'),
  partNumber: z.string().optional(),
  supplierName: z.string().optional(),
  supplierCost: z.number().min(0, 'Supplier cost must be positive'),
  markupPercentage: z.number().min(0, 'Markup percentage must be positive'),
  customerPrice: z.number().min(0, 'Customer price must be positive'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  partType: z.enum(['inventory', 'non-inventory']),
  category: z.string().optional(),
  isTaxable: z.boolean(),
  coreChargeAmount: z.number().min(0),
  coreChargeApplied: z.boolean(),
  warrantyDuration: z.string().optional(),
  status: z.enum(['ordered', 'received', 'installed', 'backordered', 'defective', 'returned']),
  isStockItem: z.boolean(),
  notes: z.string().optional(),
  notesInternal: z.string().optional(),
  binLocation: z.string().optional(),
  warehouseLocation: z.string().optional(),
  shelfLocation: z.string().optional(),
});

interface UnifiedPartEntryFormProps {
  onSubmit: (data: WorkOrderPartFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function UnifiedPartEntryForm({
  onSubmit,
  onCancel,
  isSubmitting = false
}: UnifiedPartEntryFormProps) {
  const form = useForm<WorkOrderPartFormValues>({
    resolver: zodResolver(partFormSchema),
    defaultValues: {
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: 0,
      markupPercentage: 0,
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
      notesInternal: '',
      binLocation: '',
      warehouseLocation: '',
      shelfLocation: '',
      attachments: [],
    }
  });

  const handleSubmit = (data: WorkOrderPartFormValues) => {
    // Calculate retail price from supplier cost and markup
    const retailPrice = data.supplierCost * (1 + data.markupPercentage / 100);
    
    const formattedData: WorkOrderPartFormValues = {
      ...data,
      retailPrice,
      // Remove dateAdded as it's not in the type definition
    };
    
    onSubmit(formattedData);
  };

  const watchSupplierCost = form.watch('supplierCost');
  const watchMarkupPercentage = form.watch('markupPercentage');

  // Auto-calculate customer price based on supplier cost and markup
  React.useEffect(() => {
    const calculatedPrice = watchSupplierCost * (1 + watchMarkupPercentage / 100);
    form.setValue('customerPrice', calculatedPrice);
    form.setValue('retailPrice', calculatedPrice);
  }, [watchSupplierCost, watchMarkupPercentage, form]);

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="partName">Part Name *</Label>
          <Input
            id="partName"
            {...form.register('partName')}
            placeholder="Enter part name"
          />
          {form.formState.errors.partName && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.partName.message}
            </p>
          )}
        </div>
        
        <div>
          <Label htmlFor="partNumber">Part Number</Label>
          <Input
            id="partNumber"
            {...form.register('partNumber')}
            placeholder="Enter part number"
          />
        </div>
      </div>

      {/* Supplier and Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="supplierName">Supplier</Label>
          <Input
            id="supplierName"
            {...form.register('supplierName')}
            placeholder="Enter supplier name"
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <Select onValueChange={(value) => form.setValue('category', value)}>
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

      {/* Pricing */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="supplierCost">Supplier Cost *</Label>
          <Input
            id="supplierCost"
            type="number"
            step="0.01"
            {...form.register('supplierCost', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>
        
        <div>
          <Label htmlFor="markupPercentage">Markup % *</Label>
          <Input
            id="markupPercentage"
            type="number"
            step="0.01"
            {...form.register('markupPercentage', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>
        
        <div>
          <Label htmlFor="customerPrice">Customer Price *</Label>
          <Input
            id="customerPrice"
            type="number"
            step="0.01"
            {...form.register('customerPrice', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Quantity and Type */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            {...form.register('quantity', { valueAsNumber: true })}
            placeholder="1"
          />
        </div>
        
        <div>
          <Label htmlFor="partType">Part Type</Label>
          <Select onValueChange={(value: 'inventory' | 'non-inventory') => form.setValue('partType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inventory">Inventory</SelectItem>
              <SelectItem value="non-inventory">Non-Inventory</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Select onValueChange={(value: any) => form.setValue('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
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
      </div>

      {/* Warranty and Options */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="warrantyDuration">Warranty Duration</Label>
          <Select onValueChange={(value) => form.setValue('warrantyDuration', value)}>
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
        
        <div>
          <Label htmlFor="coreChargeAmount">Core Charge Amount</Label>
          <Input
            id="coreChargeAmount"
            type="number"
            step="0.01"
            {...form.register('coreChargeAmount', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Location Fields */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="warehouseLocation">Warehouse</Label>
          <Input
            id="warehouseLocation"
            {...form.register('warehouseLocation')}
            placeholder="Warehouse location"
          />
        </div>
        
        <div>
          <Label htmlFor="shelfLocation">Shelf</Label>
          <Input
            id="shelfLocation"
            {...form.register('shelfLocation')}
            placeholder="Shelf location"
          />
        </div>
        
        <div>
          <Label htmlFor="binLocation">Bin</Label>
          <Input
            id="binLocation"
            {...form.register('binLocation')}
            placeholder="Bin location"
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isTaxable"
            {...form.register('isTaxable')}
          />
          <Label htmlFor="isTaxable">Taxable</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="coreChargeApplied"
            {...form.register('coreChargeApplied')}
          />
          <Label htmlFor="coreChargeApplied">Core Charge Applied</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isStockItem"
            {...form.register('isStockItem')}
          />
          <Label htmlFor="isStockItem">Stock Item</Label>
        </div>
      </div>

      {/* Notes */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="notes">Customer Notes</Label>
          <Textarea
            id="notes"
            {...form.register('notes')}
            placeholder="Notes visible to customer"
            className="min-h-[80px]"
          />
        </div>
        
        <div>
          <Label htmlFor="notesInternal">Internal Notes</Label>
          <Textarea
            id="notesInternal"
            {...form.register('notesInternal')}
            placeholder="Internal notes"
            className="min-h-[80px]"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
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
