
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine } from '@/types/jobLine';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, X } from 'lucide-react';

interface JobLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobLine: WorkOrderJobLine;
  onUpdate: (jobLine: WorkOrderJobLine) => void;
}

export function JobLineDialog({ open, onOpenChange, jobLine, onUpdate }: JobLineDialogProps) {
  const [formData, setFormData] = useState<Partial<WorkOrderJobLine>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (jobLine) {
      setFormData({
        id: jobLine.id,
        name: jobLine.name || '',
        description: jobLine.description || '',
        category: jobLine.category || '',
        subcategory: jobLine.subcategory || '',
        estimatedHours: jobLine.estimatedHours || 0,
        laborRate: jobLine.laborRate || 0,
        status: jobLine.status || 'pending',
        notes: jobLine.notes || ''
      });
    }
  }, [jobLine]);

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast({
        title: "Error",
        description: "Job line name is required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Calculate total amount based on hours and rate
      const totalAmount = (formData.estimatedHours || 0) * (formData.laborRate || 0);

      const { error } = await supabase.rpc('upsert_work_order_job_line', {
        p_id: jobLine.id,
        p_work_order_id: jobLine.workOrderId || '',
        p_name: formData.name,
        p_category: formData.category || null,
        p_subcategory: formData.subcategory || null,
        p_description: formData.description || null,
        p_estimated_hours: formData.estimatedHours || 0,
        p_labor_rate: formData.laborRate || 0,
        p_total_amount: totalAmount,
        p_status: formData.status || 'pending',
        p_notes: formData.notes || null,
        p_display_order: 0
      });

      if (error) throw error;

      const updatedJobLine: WorkOrderJobLine = {
        ...jobLine,
        ...formData,
        totalAmount,
        updatedAt: new Date().toISOString()
      } as WorkOrderJobLine;

      onUpdate(updatedJobLine);
      onOpenChange(false);

      toast({
        title: "Success",
        description: "Job line updated successfully"
      });
    } catch (error) {
      console.error('Error updating job line:', error);
      toast({
        title: "Error",
        description: "Failed to update job line",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Job Line
            <span className="text-sm text-muted-foreground">#{jobLine.id?.slice(-8)}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Job Line Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter job line name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Engine, Brakes"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                value={formData.subcategory || ''}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                placeholder="e.g., Oil Change, Brake Pads"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.25"
                min="0"
                value={formData.estimatedHours || ''}
                onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="laborRate">Labor Rate ($/hour)</Label>
              <Input
                id="laborRate"
                type="number"
                step="0.01"
                min="0"
                value={formData.laborRate || ''}
                onChange={(e) => setFormData({ ...formData, laborRate: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status || 'pending'} 
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
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
              <Label htmlFor="totalAmount">Total Amount</Label>
              <Input
                id="totalAmount"
                type="number"
                value={((formData.estimatedHours || 0) * (formData.laborRate || 0)).toFixed(2)}
                disabled
                className="mt-1 bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Calculated: {formData.estimatedHours || 0}h × ${formData.laborRate || 0}/h
              </p>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the work to be performed"
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Internal notes, technician instructions, etc."
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading || !formData.name?.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
