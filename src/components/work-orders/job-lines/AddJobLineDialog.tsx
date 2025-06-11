
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { WorkOrderJobLine, JOB_LINE_STATUSES } from '@/types/jobLine';

interface AddJobLineDialogProps {
  workOrderId: string;
  onJobLineAdd: (jobLines: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>[]) => void;
}

export function AddJobLineDialog({ workOrderId, onJobLineAdd }: AddJobLineDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimated_hours: 0,
    labor_rate: 0,
    status: 'pending' as const,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const jobLine: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'> = {
      work_order_id: workOrderId,
      name: formData.name,
      category: formData.category || undefined,
      subcategory: formData.subcategory || undefined,
      description: formData.description || undefined,
      estimated_hours: formData.estimated_hours,
      labor_rate: formData.labor_rate,
      labor_rate_type: 'standard',
      total_amount: formData.estimated_hours * formData.labor_rate,
      status: formData.status,
      notes: formData.notes || undefined,
      display_order: 0
    };

    onJobLineAdd([jobLine]);
    setIsOpen(false);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Job Line
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Job Line</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Job Line Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Oil Change, Brake Inspection"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Maintenance, Repair"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the work to be performed..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Hours</label>
              <Input
                type="number"
                step="0.25"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Labor Rate ($/hr)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.labor_rate}
                onChange={(e) => setFormData({ ...formData, labor_rate: parseFloat(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_LINE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or instructions..."
              rows={2}
            />
          </div>

          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              Total: ${(formData.estimated_hours * formData.labor_rate).toFixed(2)}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Job Line</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
