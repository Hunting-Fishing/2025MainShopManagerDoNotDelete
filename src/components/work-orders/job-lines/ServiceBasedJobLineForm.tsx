
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { WorkOrderJobLine, JobLineFormValues } from '@/types/jobLine';

interface ServiceBasedJobLineFormProps {
  workOrderId: string;
  onSave: (jobLines: WorkOrderJobLine[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ServiceBasedJobLineForm({
  workOrderId,
  onSave,
  onCancel,
  isLoading = false
}: ServiceBasedJobLineFormProps) {
  const [formData, setFormData] = useState<JobLineFormValues>({
    name: '',
    category: '',
    description: '',
    estimated_hours: 0,
    labor_rate: 0,
    labor_rate_type: 'standard',
    total_amount: 0,
    status: 'pending',
    notes: ''
  });

  const handleInputChange = (field: keyof JobLineFormValues, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate total amount when hours or rate changes
      if (field === 'estimated_hours' || field === 'labor_rate') {
        const hours = field === 'estimated_hours' ? value : updated.estimated_hours || 0;
        const rate = field === 'labor_rate' ? value : updated.labor_rate || 0;
        updated.total_amount = hours * rate;
      }
      
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newJobLine: WorkOrderJobLine = {
      id: `temp-${Date.now()}-${Math.random()}`,
      work_order_id: workOrderId,
      name: formData.name,
      category: formData.category,
      description: formData.description,
      estimated_hours: formData.estimated_hours,
      labor_rate: formData.labor_rate,
      labor_rate_type: formData.labor_rate_type,
      total_amount: formData.total_amount,
      status: formData.status,
      notes: formData.notes,
      display_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    onSave([newJobLine]);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter job line name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Input
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Enter category"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Hours</label>
              <Input
                type="number"
                step="0.25"
                value={formData.estimated_hours || 0}
                onChange={(e) => handleInputChange('estimated_hours', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Labor Rate</label>
              <Input
                type="number"
                step="0.01"
                value={formData.labor_rate || 0}
                onChange={(e) => handleInputChange('labor_rate', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Amount</label>
              <Input
                type="number"
                step="0.01"
                value={formData.total_amount || 0}
                onChange={(e) => handleInputChange('total_amount', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Labor Rate Type</label>
              <Select 
                value={formData.labor_rate_type || 'standard'} 
                onValueChange={(value) => handleInputChange('labor_rate_type', value)}
              >
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
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select 
                value={formData.status || 'pending'} 
                onValueChange={(value) => handleInputChange('status', value)}
              >
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

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any notes"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Job Line'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
