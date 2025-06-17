
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine, JOB_LINE_STATUSES, isValidJobLineStatus, JobLineFormValues } from '@/types/jobLine';
import { Plus } from 'lucide-react';

interface AddJobLineDialogProps {
  workOrderId: string;
  onJobLineAdd: (jobLine: JobLineFormValues) => void;
  triggerButton?: React.ReactNode;
}

export function AddJobLineDialog({ 
  workOrderId, 
  onJobLineAdd,
  triggerButton
}: AddJobLineDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<JobLineFormValues>({
    name: '',
    description: '',
    estimated_hours: 0,
    labor_rate: 0,
    labor_rate_type: 'standard',
    status: 'pending' as const,
    notes: '',
    category: '',
    subcategory: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const validatedData: JobLineFormValues = {
        ...formData,
        status: isValidJobLineStatus(formData.status!) ? formData.status : 'pending',
        total_amount: (formData.estimated_hours || 0) * (formData.labor_rate || 0)
      };
      
      await onJobLineAdd(validatedData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        estimated_hours: 0,
        labor_rate: 0,
        labor_rate_type: 'standard',
        status: 'pending' as const,
        notes: '',
        category: '',
        subcategory: ''
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding job line:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof JobLineFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Job Line
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Job Line</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Job Line Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                step="0.25"
                min="0"
                value={formData.estimated_hours}
                onChange={(e) => handleInputChange('estimated_hours', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="labor_rate">Labor Rate ($)</Label>
              <Input
                id="labor_rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.labor_rate}
                onChange={(e) => handleInputChange('labor_rate', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="labor_rate_type">Rate Type</Label>
              <Select
                value={formData.labor_rate_type}
                onValueChange={(value) => handleInputChange('labor_rate_type', value)}
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
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? 'Adding...' : 'Add Job Line'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
