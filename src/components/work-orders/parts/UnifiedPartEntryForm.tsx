
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { WorkOrderPartFormValues, PART_CATEGORIES, PART_STATUSES, WARRANTY_DURATIONS } from '@/types/workOrderPart';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

const partFormSchema = z.object({
  partName: z.string().min(1, 'Part name is required'),
  partNumber: z.string().optional(),
  supplierName: z.string().optional(),
  supplierCost: z.number().min(0, 'Cost must be positive'),
  markupPercentage: z.number().min(0, 'Markup must be positive'),
  retailPrice: z.number().min(0, 'Retail price must be positive'),
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
  shelfLocation: z.string().optional()
});

type PartFormData = z.infer<typeof partFormSchema>;

interface UnifiedPartEntryFormProps {
  onSubmit: (data: WorkOrderPartFormValues) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<WorkOrderPartFormValues>;
  isSubmitting?: boolean;
}

export function UnifiedPartEntryForm({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false
}: UnifiedPartEntryFormProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'details' | 'location'>('basic');

  const form = useForm<PartFormData>({
    resolver: zodResolver(partFormSchema),
    defaultValues: {
      partName: initialData?.partName || '',
      partNumber: initialData?.partNumber || '',
      supplierName: initialData?.supplierName || '',
      supplierCost: initialData?.supplierCost || 0,
      markupPercentage: initialData?.markupPercentage || 25,
      retailPrice: initialData?.retailPrice || 0,
      customerPrice: initialData?.customerPrice || 0,
      quantity: initialData?.quantity || 1,
      partType: initialData?.partType || 'non-inventory',
      category: initialData?.category || '',
      isTaxable: initialData?.isTaxable || true,
      coreChargeAmount: initialData?.coreChargeAmount || 0,
      coreChargeApplied: initialData?.coreChargeApplied || false,
      warrantyDuration: initialData?.warrantyDuration || '',
      status: initialData?.status || 'ordered',
      isStockItem: initialData?.isStockItem || false,
      notes: initialData?.notes || '',
      notesInternal: initialData?.notesInternal || '',
      binLocation: initialData?.binLocation || '',
      warehouseLocation: initialData?.warehouseLocation || '',
      shelfLocation: initialData?.shelfLocation || ''
    }
  });

  const handleSubmit = async (data: PartFormData) => {
    const formattedData: WorkOrderPartFormValues = {
      ...data,
      dateAdded: new Date().toISOString(),
      attachments: []
    };
    await onSubmit(formattedData);
  };

  const watchSupplierCost = form.watch('supplierCost');
  const watchMarkupPercentage = form.watch('markupPercentage');

  // Auto-calculate retail price when cost or markup changes
  React.useEffect(() => {
    const retailPrice = watchSupplierCost * (1 + watchMarkupPercentage / 100);
    form.setValue('retailPrice', retailPrice);
    form.setValue('customerPrice', retailPrice);
  }, [watchSupplierCost, watchMarkupPercentage, form]);

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'details', label: 'Details' },
    { id: 'location', label: 'Location' }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="partName"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Part Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter part name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="partNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter part number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplierName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter supplier name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PART_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplierCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Cost *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="markupPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Markup %</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="retailPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retail Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Price *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isTaxable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Taxable Item</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coreChargeApplied"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Core Charge Applied</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch('coreChargeApplied') && (
                <FormField
                  control={form.control}
                  name="coreChargeAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Core Charge Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PART_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warrantyDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warranty Duration</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select warranty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {WARRANTY_DURATIONS.map((duration) => (
                          <SelectItem key={duration} value={duration}>
                            {duration}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isStockItem"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Stock Item</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Customer Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Notes visible to customer"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notesInternal"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Internal Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Internal notes (not visible to customer)"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Location Tab */}
          {activeTab === 'location' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="warehouseLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse</FormLabel>
                    <FormControl>
                      <Input placeholder="Warehouse location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shelfLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shelf</FormLabel>
                    <FormControl>
                      <Input placeholder="Shelf location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="binLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bin</FormLabel>
                    <FormControl>
                      <Input placeholder="Bin location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Part...
                </>
              ) : (
                'Add Part'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
