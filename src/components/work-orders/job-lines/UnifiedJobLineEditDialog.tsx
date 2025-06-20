
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine, JobLineStatus, LaborRateType } from '@/types/jobLine';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface UnifiedJobLineEditDialogProps {
  jobLine: WorkOrderJobLine | null;
  workOrderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (jobLine: WorkOrderJobLine) => Promise<void>;
}

export function UnifiedJobLineEditDialog({
  jobLine,
  workOrderId,
  open,
  onOpenChange,
  onSave
}: UnifiedJobLineEditDialogProps) {
  const { toast } = useToast();
  const { sectors, loading: sectorsLoading } = useServiceSectors();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimated_hours: 0,
    labor_rate: 0,
    labor_rate_type: 'standard' as LaborRateType,
    total_amount: 0,
    status: 'pending' as JobLineStatus,
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when dialog opens or jobLine changes
  useEffect(() => {
    if (jobLine && open) {
      setFormData({
        name: jobLine.name || '',
        category: jobLine.category || '',
        subcategory: jobLine.subcategory || '',
        description: jobLine.description || '',
        estimated_hours: jobLine.estimated_hours || 0,
        labor_rate: jobLine.labor_rate || 0,
        labor_rate_type: (jobLine.labor_rate_type as LaborRateType) || 'standard',
        total_amount: jobLine.total_amount || 0,
        status: (jobLine.status as JobLineStatus) || 'pending',
        notes: jobLine.notes || ''
      });
    }
  }, [jobLine, open]);

  // Calculate total amount when hours or rate change
  useEffect(() => {
    const total = (formData.estimated_hours || 0) * (formData.labor_rate || 0);
    setFormData(prev => ({ ...prev, total_amount: total }));
  }, [formData.estimated_hours, formData.labor_rate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!jobLine) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('work_order_job_lines')
        .update({
          name: formData.name,
          category: formData.category,
          subcategory: formData.subcategory,
          description: formData.description,
          estimated_hours: formData.estimated_hours,
          labor_rate: formData.labor_rate,
          labor_rate_type: formData.labor_rate_type,
          total_amount: formData.total_amount,
          status: formData.status,
          notes: formData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobLine.id)
        .select()
        .single();

      if (error) throw error;

      await onSave(data);
      
      toast({
        title: "Success",
        description: "Job line updated successfully",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating job line:', error);
      toast({
        title: "Error",
        description: "Failed to update job line",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!jobLine) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Line</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter job line name"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {!sectorsLoading && sectors?.map((sector) => (
                    <SelectItem key={sector.id} value={sector.name}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter job line description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                min="0"
                step="0.5"
                value={formData.estimated_hours}
                onChange={(e) => handleInputChange('estimated_hours', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label htmlFor="labor_rate">Labor Rate ($)</Label>
              <Input
                id="labor_rate"
                type="number"
                min="0"
                step="0.01"
                value={formData.labor_rate}
                onChange={(e) => handleInputChange('labor_rate', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label htmlFor="total_amount">Total Amount ($)</Label>
              <Input
                id="total_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.total_amount}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="labor_rate_type">Rate Type</Label>
              <Select
                value={formData.labor_rate_type}
                onValueChange={(value) => handleInputChange('labor_rate_type', value as LaborRateType)}
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
                onValueChange={(value) => handleInputChange('status', value as JobLineStatus)}
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
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || !formData.name.trim()}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
