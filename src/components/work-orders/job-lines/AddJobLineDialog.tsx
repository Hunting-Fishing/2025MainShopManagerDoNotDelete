
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { WorkOrderJobLine, JobLineFormValues } from '@/types/jobLine';
import { generateTempJobLineId } from '@/services/jobLineParserEnhanced';

interface AddJobLineDialogProps {
  workOrderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (jobLine: WorkOrderJobLine) => void;
}

export function AddJobLineDialog({ 
  workOrderId, 
  open, 
  onOpenChange, 
  onAdd 
}: AddJobLineDialogProps) {
  const [formData, setFormData] = useState<JobLineFormValues>({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimated_hours: 0,
    labor_rate: 0,
    status: 'pending',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newJobLine: WorkOrderJobLine = {
      id: generateTempJobLineId(),
      work_order_id: workOrderId,
      ...formData,
      total_amount: (formData.estimated_hours || 0) * (formData.labor_rate || 0),
      display_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    onAdd(newJobLine);
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      description: '',
      estimated_hours: 0,
      labor_rate: 0,
      status: 'pending',
      notes: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Job Line</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Input
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subcategory</label>
              <Input
                value={formData.subcategory || ''}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Hours</label>
              <Input
                type="number"
                step="0.1"
                value={formData.estimated_hours || 0}
                onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Labor Rate</label>
              <Input
                type="number"
                step="0.01"
                value={formData.labor_rate || 0}
                onChange={(e) => setFormData({ ...formData, labor_rate: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Job Line</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
