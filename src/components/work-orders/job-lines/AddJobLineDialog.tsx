
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';

interface AddJobLineDialogProps {
  workOrderId: string;
  onJobLineAdd: (jobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function AddJobLineDialog({ workOrderId, onJobLineAdd }: AddJobLineDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General',
    subcategory: '',
    estimatedHours: 1,
    laborRate: 75,
    status: 'pending' as const,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalAmount = formData.estimatedHours * formData.laborRate;
    
    const newJobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'> = {
      workOrderId,
      name: formData.name,
      description: formData.description || null,
      category: formData.category || null,
      subcategory: formData.subcategory || null,
      estimatedHours: formData.estimatedHours,
      laborRate: formData.laborRate,
      totalAmount,
      status: formData.status,
      notes: formData.notes || null
    };

    onJobLineAdd(newJobLine);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      category: 'General',
      subcategory: '',
      estimatedHours: 1,
      laborRate: 75,
      status: 'pending',
      notes: ''
    });
    
    setOpen(false);
  };

  const totalAmount = formData.estimatedHours * formData.laborRate;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Job Line
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Job Line</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Oil Change, Brake Inspection"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the service"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Engine">Engine</SelectItem>
                <SelectItem value="Brakes">Brakes</SelectItem>
                <SelectItem value="Transmission">Transmission</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Suspension">Suspension</SelectItem>
                <SelectItem value="Tires">Tires</SelectItem>
                <SelectItem value="AC/Heating">AC/Heating</SelectItem>
                <SelectItem value="Bodywork">Bodywork</SelectItem>
                <SelectItem value="Diagnostic">Diagnostic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimatedHours">Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.25"
                min="0"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="laborRate">Rate ($/hr)</Label>
              <Input
                id="laborRate"
                type="number"
                step="0.01"
                min="0"
                value={formData.laborRate}
                onChange={(e) => setFormData(prev => ({ ...prev, laborRate: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Total Amount</div>
            <div className="text-lg font-semibold text-green-600">
              ${totalAmount.toFixed(2)}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim()}>
              Add Job Line
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
