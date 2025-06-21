
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { WorkOrderPartFormValues, WORK_ORDER_PART_STATUSES } from '@/types/workOrderPart';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from '@/hooks/use-toast';
import { SupplierSelector } from './SupplierSelector';

const partFormSchema = z.object({
  name: z.string().min(1, 'Part name is required'),
  part_number: z.string().min(1, 'Part number is required'),
  description: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Price must be non-negative'),
  status: z.string().optional(),
  notes: z.string().optional(),
  job_line_id: z.string().optional(),
  category: z.string().optional(),
  customerPrice: z.number().optional(),
  supplierCost: z.number().optional(),
  retailPrice: z.number().optional(),
  markupPercentage: z.number().optional(),
  isTaxable: z.boolean().optional(),
  coreChargeAmount: z.number().optional(),
  coreChargeApplied: z.boolean().optional(),
  warrantyDuration: z.string().optional(),
  warrantyExpiryDate: z.string().optional(),
  installDate: z.string().optional(),
  installedBy: z.string().optional(),
  invoiceNumber: z.string().optional(),
  poLine: z.string().optional(),
  isStockItem: z.boolean().optional(),
  supplierName: z.string().optional(),
  supplierOrderRef: z.string().optional(),
  notesInternal: z.string().optional(),
  inventoryItemId: z.string().optional(),
  partType: z.string().optional(),
  estimatedArrivalDate: z.string().optional(),
  itemStatus: z.string().optional(),
});

interface AddPartDialogProps {
  workOrderId: string;
  jobLineId?: string;
  onPartAdded: () => void;
}

export function AddPartDialog({ workOrderId, jobLineId, onPartAdded }: AddPartDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<WorkOrderPartFormValues>({
    resolver: zodResolver(partFormSchema),
    defaultValues: {
      name: '',
      part_number: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      status: 'pending',
      notes: '',
      job_line_id: jobLineId,
      category: '',
      customerPrice: 0,
      supplierCost: 0,
      retailPrice: 0,
      markupPercentage: 0,
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      warrantyDuration: '',
      invoiceNumber: '',
      poLine: '',
      isStockItem: false,
      supplierName: '',
      partType: 'OEM',
    },
  });

  const onSubmit = async (data: WorkOrderPartFormValues) => {
    try {
      setLoading(true);

      // Ensure all required fields are present
      const partData: WorkOrderPartFormValues = {
        name: data.name,
        part_number: data.part_number,
        quantity: data.quantity,
        unit_price: data.unit_price || data.customerPrice || 0,
        description: data.description,
        status: data.status || 'pending',
        notes: data.notes,
        job_line_id: data.job_line_id,
        category: data.category,
        customerPrice: data.customerPrice || data.unit_price || 0,
        supplierCost: data.supplierCost || 0,
        retailPrice: data.retailPrice || 0,
        markupPercentage: data.markupPercentage || 0,
        isTaxable: data.isTaxable ?? true,
        coreChargeAmount: data.coreChargeAmount || 0,
        coreChargeApplied: data.coreChargeApplied || false,
        warrantyDuration: data.warrantyDuration,
        invoiceNumber: data.invoiceNumber,
        poLine: data.poLine,
        isStockItem: data.isStockItem || false,
        supplierName: data.supplierName,
        partType: data.partType || 'OEM',
      };

      await createWorkOrderPart(partData, workOrderId, jobLineId);
      
      toast({
        title: 'Success',
        description: 'Part added successfully',
      });
      
      form.reset();
      setOpen(false);
      onPartAdded();
    } catch (error) {
      console.error('Error adding part:', error);
      toast({
        title: 'Error',
        description: 'Failed to add part. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Part
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Part</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter part name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="part_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Number *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter part number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter part description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pricing Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Pricing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          min="1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="supplierCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Cost</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="unit_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Price *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Assignment and Status */}
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
                        {WORK_ORDER_PART_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ')}
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter category" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Supplier Information */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Supplier Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SupplierSelector form={form} />
                
                <FormField
                  control={form.control}
                  name="partType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Part Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select part type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="OEM">OEM</SelectItem>
                          <SelectItem value="Aftermarket">Aftermarket</SelectItem>
                          <SelectItem value="Remanufactured">Remanufactured</SelectItem>
                          <SelectItem value="Used">Used</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Options */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Additional Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
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
                </div>
                
                <div className="flex items-center space-x-2">
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
                </div>
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter any additional notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Part'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
