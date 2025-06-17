
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine } from '@/types/jobLine';
import { useToast } from '@/hooks/use-toast';
import { createWorkOrderJobLine } from '@/services/workOrder/jobLinesService';

interface ServiceBasedJobLineFormProps {
  workOrderId: string;
  onSubmit: (jobLines: Omit<WorkOrderJobLine, "id" | "created_at" | "updated_at">[]) => void;
  onCancel: () => void;
}

export function ServiceBasedJobLineForm({
  workOrderId,
  onSubmit,
  onCancel
}: ServiceBasedJobLineFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimated_hours: 0,
    labor_rate: 0,
    labor_rate_type: 'standard' as const,
    status: 'pending' as const,
    notes: '',
    display_order: 0
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate total amount when hours or rate changes
      if (field === 'estimated_hours' || field === 'labor_rate') {
        const hours = field === 'estimated_hours' ? value : updated.estimated_hours;
        const rate = field === 'labor_rate' ? value : updated.labor_rate;
        // Note: total_amount will be calculated in the submission
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Job line name is required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Calculate total amount
      const totalAmount = (formData.estimated_hours || 0) * (formData.labor_rate || 0);
      
      const jobLineData = {
        work_order_id: workOrderId,
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        estimated_hours: formData.estimated_hours,
        labor_rate: formData.labor_rate,
        labor_rate_type: formData.labor_rate_type,
        total_amount: totalAmount,
        status: formData.status,
        notes: formData.notes,
        display_order: formData.display_order
      };

      // Save to database directly
      const savedJobLine = await createWorkOrderJobLine(workOrderId, jobLineData);
      
      console.log('Job line saved successfully:', savedJobLine);
      
      // Also call the parent onSubmit to update local state
      onSubmit([jobLineData]);
      
      toast({
        title: "Success",
        description: "Job line saved successfully",
      });

    } catch (error) {
      console.error('Error saving job line:', error);
      toast({
        title: "Error",
        description: "Failed to save job line. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = (formData.estimated_hours || 0) * (formData.labor_rate || 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Job Line</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Line Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter job line name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Enter category"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subcategory</label>
              <Input
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                placeholder="Enter subcategory"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter job line description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Hours</label>
              <Input
                type="number"
                step="0.25"
                min="0"
                value={formData.estimated_hours}
                onChange={(e) => handleInputChange('estimated_hours', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Labor Rate ($)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.labor_rate}
                onChange={(e) => handleInputChange('labor_rate', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Amount</label>
              <Input
                type="text"
                value={`$${totalAmount.toFixed(2)}`}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Labor Rate Type</label>
            <Select value={formData.labor_rate_type} onValueChange={(value) => handleInputChange('labor_rate_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select rate type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="overtime">Overtime</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="flat_rate">Flat Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Job Line"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
