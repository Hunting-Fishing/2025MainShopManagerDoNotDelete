import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine } from '@/types/jobLine';
import { JOB_LINE_STATUSES } from '@/types/jobLine';
interface EditJobLineDialogProps {
  jobLine: WorkOrderJobLine;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedJobLine: WorkOrderJobLine) => void;
}
export function EditJobLineDialog({
  jobLine,
  open,
  onOpenChange,
  onUpdate
}: EditJobLineDialogProps) {
  const [formData, setFormData] = useState({
    name: jobLine.name,
    category: jobLine.category || '',
    subcategory: jobLine.subcategory || '',
    description: jobLine.description || '',
    estimated_hours: jobLine.estimated_hours || 0,
    labor_rate: jobLine.labor_rate || 0,
    status: jobLine.status || 'pending',
    notes: jobLine.notes || ''
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedJobLine: WorkOrderJobLine = {
      ...jobLine,
      ...formData,
      total_amount: (formData.estimated_hours || 0) * (formData.labor_rate || 0),
      updated_at: new Date().toISOString()
    };
    onUpdate(updatedJobLine);
    onOpenChange(false);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-sky-200">
        <DialogHeader>
          <DialogTitle>Edit Job Line</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <Input value={formData.name} onChange={e => setFormData({
            ...formData,
            name: e.target.value
          })} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Input value={formData.category} onChange={e => setFormData({
            ...formData,
            category: e.target.value
          })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subcategory</label>
            <Input value={formData.subcategory} onChange={e => setFormData({
            ...formData,
            subcategory: e.target.value
          })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea value={formData.description} onChange={e => setFormData({
            ...formData,
            description: e.target.value
          })} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Hours</label>
              <Input type="number" step="0.25" min="0" value={formData.estimated_hours} onChange={e => setFormData({
              ...formData,
              estimated_hours: parseFloat(e.target.value) || 0
            })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Labor Rate</label>
              <Input type="number" step="0.01" min="0" value={formData.labor_rate} onChange={e => setFormData({
              ...formData,
              labor_rate: parseFloat(e.target.value) || 0
            })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select value={formData.status} onValueChange={value => setFormData({
            ...formData,
            status: value
          })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JOB_LINE_STATUSES.map(status => <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Textarea value={formData.notes} onChange={e => setFormData({
            ...formData,
            notes: e.target.value
          })} rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Job Line</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
}