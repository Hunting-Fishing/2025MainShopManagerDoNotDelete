
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';

interface AddJobLineDialogProps {
  workOrderId: string;
  onJobLineAdd?: (newJobLines: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>[]) => void;
  onAdd?: (newJobLine: WorkOrderJobLine) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddJobLineDialog({ 
  workOrderId, 
  onJobLineAdd, 
  onAdd,
  open,
  onOpenChange 
}: AddJobLineDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimated_hours: 0,
    labor_rate: 0,
    labor_rate_type: 'hourly',
    status: 'pending',
    notes: ''
  });

  // Use controlled open state if provided, otherwise use internal state
  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newJobLine = {
      ...formData,
      work_order_id: workOrderId,
      total_amount: formData.estimated_hours * formData.labor_rate,
      display_order: 1
    };

    if (onAdd) {
      // For JobLinesGrid compatibility
      const jobLineWithId: WorkOrderJobLine = {
        ...newJobLine,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      onAdd(jobLineWithId);
    } else if (onJobLineAdd) {
      // For WorkOrderLaborSection compatibility
      onJobLineAdd([newJobLine]);
    }

    // Reset form
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      description: '',
      estimated_hours: 0,
      labor_rate: 0,
      labor_rate_type: 'hourly',
      status: 'pending',
      notes: ''
    });

    setDialogOpen(false);
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Add Job Line</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Job Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Oil Change, Brake Inspection"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., Maintenance"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subcategory">Subcategory</Label>
            <Input
              id="subcategory"
              value={formData.subcategory}
              onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
              placeholder="e.g., Engine"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Detailed description of the work to be performed"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estimated_hours">Estimated Hours</Label>
            <Input
              id="estimated_hours"
              type="number"
              step="0.5"
              min="0"
              value={formData.estimated_hours}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="labor_rate">Labor Rate ($)</Label>
            <Input
              id="labor_rate"
              type="number"
              step="0.01"
              min="0"
              value={formData.labor_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, labor_rate: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="labor_rate_type">Rate Type</Label>
            <Select 
              value={formData.labor_rate_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, labor_rate_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="flat">Flat Rate</SelectItem>
                <SelectItem value="diagnostic">Diagnostic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional notes or special instructions"
            rows={2}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">
            Add Job Line
          </Button>
        </div>
      </form>
    </DialogContent>
  );

  // If open prop is controlled externally, don't render trigger
  if (open !== undefined) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {dialogContent}
      </Dialog>
    );
  }

  // Default behavior with trigger button
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Job Line
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
