
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { createWorkOrderPart } from '@/services/workOrder';
import { toast } from 'sonner';

interface AddPartFormProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onPartAdded: () => Promise<void>;
  onCancel: () => void;
}

export function AddPartForm({ workOrderId, jobLines, onPartAdded, onCancel }: AddPartFormProps) {
  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = useForm<WorkOrderPartFormValues>({
    defaultValues: {
      name: '',
      part_number: '',
      quantity: 1,
      unit_price: 0,
      status: 'pending',
      job_line_id: undefined,
      description: '',
      supplierName: '',
      category: ''
    }
  });

  const quantity = watch('quantity') || 1;
  const unitPrice = watch('unit_price') || 0;
  const totalPrice = quantity * unitPrice;

  const onSubmit = async (data: WorkOrderPartFormValues) => {
    try {
      await createWorkOrderPart(data, workOrderId);
      toast.success('Part added successfully');
      reset();
      await onPartAdded();
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error('Failed to add part');
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Add New Part</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Part Name *</Label>
              <Input
                id="name"
                {...register('name', { required: true })}
                placeholder="Enter part name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                {...register('part_number', { required: true })}
                placeholder="Enter part number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                {...register('quantity', { valueAsNumber: true })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                {...register('unit_price', { valueAsNumber: true })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="job_line_id">Job Line</Label>
              <Select onValueChange={(value) => setValue('job_line_id', value === 'none' ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job line..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {jobLines.map((jobLine) => (
                    <SelectItem key={jobLine.id} value={jobLine.id}>
                      {jobLine.name}
                      {jobLine.category && ` (${jobLine.category})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setValue('status', value)} defaultValue="pending">
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
            
            <div className="space-y-2">
              <Label htmlFor="supplierName">Supplier</Label>
              <Input
                id="supplierName"
                {...register('supplierName')}
                placeholder="Enter supplier name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="Enter category"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter part description"
              rows={2}
            />
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-lg font-semibold">
              Total: ${totalPrice.toFixed(2)}
            </div>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Part'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
