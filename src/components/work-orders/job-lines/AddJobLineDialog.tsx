
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';

export interface AddJobLineDialogProps {
  workOrderId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onJobLineAdd?: (newJobLinesData: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>[]) => void;
  onAdd?: (newJobLine: WorkOrderJobLine) => void;
}

export function AddJobLineDialog({
  workOrderId,
  open,
  onOpenChange,
  onJobLineAdd,
  onAdd
}: AddJobLineDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimated_hours: 0,
    labor_rate: 0,
    status: 'pending',
    notes: ''
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  const isDialogOpen = open !== undefined ? open : isOpen;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newJobLine: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'> = {
      work_order_id: workOrderId,
      name: formData.name,
      category: formData.category,
      subcategory: formData.subcategory,
      description: formData.description,
      estimated_hours: formData.estimated_hours,
      labor_rate: formData.labor_rate,
      total_amount: formData.estimated_hours * formData.labor_rate,
      status: formData.status,
      notes: formData.notes,
      display_order: 0
    };

    // Handle both callback patterns
    if (onJobLineAdd) {
      onJobLineAdd([newJobLine]);
    } else if (onAdd) {
      const jobLineWithId: WorkOrderJobLine = {
        ...newJobLine,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      onAdd(jobLineWithId);
    }

    // Reset form and close dialog
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
    
    handleOpenChange(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Job Line
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Job Line</DialogTitle>
          <DialogDescription>
            Add a new job line to this work order.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Job Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value})}
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Estimated Hours</Label>
              <Input
                id="hours"
                type="number"
                step="0.1"
                min="0"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({...formData, estimated_hours: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rate">Labor Rate ($/hour)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.labor_rate}
                onChange={(e) => setFormData({...formData, labor_rate: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={2}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            Total Amount: ${(formData.estimated_hours * formData.labor_rate).toFixed(2)}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Job Line</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
