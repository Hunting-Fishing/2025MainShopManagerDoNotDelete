
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine, JOB_LINE_STATUSES, JobLineStatus } from '@/types/jobLine';

interface EditJobLineDialogProps {
  jobLine: WorkOrderJobLine;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedJobLine: WorkOrderJobLine) => void;
}

export function EditJobLineDialog({
  jobLine,
  open,
  onOpenChange,
  onSave
}: EditJobLineDialogProps) {
  const [formData, setFormData] = useState({
    name: jobLine.name,
    category: jobLine.category || '',
    subcategory: jobLine.subcategory || '',
    description: jobLine.description || '',
    estimatedHours: jobLine.estimatedHours?.toString() || '0',
    laborRate: jobLine.laborRate?.toString() || '0',
    status: jobLine.status,
    notes: jobLine.notes || ''
  });

  // Reset form data when jobLine changes
  useEffect(() => {
    setFormData({
      name: jobLine.name,
      category: jobLine.category || '',
      subcategory: jobLine.subcategory || '',
      description: jobLine.description || '',
      estimatedHours: jobLine.estimatedHours?.toString() || '0',
      laborRate: jobLine.laborRate?.toString() || '0',
      status: jobLine.status,
      notes: jobLine.notes || ''
    });
  }, [jobLine]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotalAmount = () => {
    const hours = parseFloat(formData.estimatedHours) || 0;
    const rate = parseFloat(formData.laborRate) || 0;
    return hours * rate;
  };

  const handleSave = () => {
    const updatedJobLine: WorkOrderJobLine = {
      ...jobLine,
      name: formData.name,
      category: formData.category || undefined,
      subcategory: formData.subcategory || undefined,
      description: formData.description || undefined,
      estimatedHours: parseFloat(formData.estimatedHours) || 0,
      laborRate: parseFloat(formData.laborRate) || 0,
      totalAmount: calculateTotalAmount(),
      status: formData.status as JobLineStatus,
      notes: formData.notes || undefined,
      updatedAt: new Date().toISOString()
    };

    onSave(updatedJobLine);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      name: jobLine.name,
      category: jobLine.category || '',
      subcategory: jobLine.subcategory || '',
      description: jobLine.description || '',
      estimatedHours: jobLine.estimatedHours?.toString() || '0',
      laborRate: jobLine.laborRate?.toString() || '0',
      status: jobLine.status,
      notes: jobLine.notes || ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Line</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Job Line Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter job line name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Enter category"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                placeholder="Enter subcategory"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter job line description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.1"
                min="0"
                value={formData.estimatedHours}
                onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                placeholder="0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="laborRate">Labor Rate ($)</Label>
              <Input
                id="laborRate"
                type="number"
                step="0.01"
                min="0"
                value={formData.laborRate}
                onChange={(e) => handleInputChange('laborRate', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Total Amount</Label>
              <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                ${calculateTotalAmount().toFixed(2)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any additional notes"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.name.trim()}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
