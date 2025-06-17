
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine, JobLineStatus, LaborRateType, isValidJobLineStatus, isValidLaborRateType } from '@/types/jobLine';

interface ServiceBasedJobLineFormProps {
  workOrderId: string;
  onSubmit: (jobLines: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>[]) => void;
  onCancel: () => void;
}

export function ServiceBasedJobLineForm({
  workOrderId,
  onSubmit,
  onCancel
}: ServiceBasedJobLineFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimated_hours: 0,
    labor_rate: 0,
    labor_rate_type: 'standard' as LaborRateType,
    status: 'pending' as JobLineStatus,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const jobLine: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'> = {
      work_order_id: workOrderId,
      name: formData.name,
      category: formData.category,
      subcategory: formData.subcategory,
      description: formData.description,
      estimated_hours: formData.estimated_hours,
      labor_rate: formData.labor_rate,
      labor_rate_type: formData.labor_rate_type,
      total_amount: formData.estimated_hours * formData.labor_rate,
      status: formData.status,
      display_order: 0,
      notes: formData.notes
    };

    onSubmit([jobLine]); // Wrap in array to match expected interface
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Service Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="subcategory">Subcategory</Label>
          <Input
            id="subcategory"
            value={formData.subcategory}
            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="hours">Estimated Hours</Label>
          <Input
            id="hours"
            type="number"
            step="0.25"
            value={formData.estimated_hours}
            onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="rate">Labor Rate</Label>
          <Input
            id="rate"
            type="number"
            step="0.01"
            value={formData.labor_rate}
            onChange={(e) => setFormData({ ...formData, labor_rate: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="rate-type">Rate Type</Label>
          <Select
            value={formData.labor_rate_type}
            onValueChange={(value) => {
              if (isValidLaborRateType(value)) {
                setFormData({ ...formData, labor_rate_type: value });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="overtime">Overtime</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="flat_rate">Flat Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => {
            if (isValidJobLineStatus(value)) {
              setFormData({ ...formData, status: value });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Job Line
        </Button>
      </div>
    </form>
  );
}
