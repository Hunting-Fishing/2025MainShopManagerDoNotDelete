
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine, JobLineStatus, LaborRateType } from '@/types/jobLine';
import { useServiceSectors } from '@/hooks/useServiceHierarchy';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UnifiedJobLineEditDialogProps {
  jobLine: WorkOrderJobLine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (jobLine: WorkOrderJobLine) => Promise<void>;
}

export function UnifiedJobLineEditDialog({
  jobLine,
  open,
  onOpenChange,
  onSave
}: UnifiedJobLineEditDialogProps) {
  const { sectors, loading: sectorsLoading } = useServiceSectors();
  const [formData, setFormData] = useState<Partial<WorkOrderJobLine>>({});
  const [saving, setSaving] = useState(false);

  // Initialize form data when jobLine changes
  useEffect(() => {
    if (jobLine) {
      setFormData({
        name: jobLine.name || '',
        category: jobLine.category || '',
        subcategory: jobLine.subcategory || '',
        description: jobLine.description || '',
        estimated_hours: jobLine.estimated_hours || 0,
        labor_rate: jobLine.labor_rate || 0,
        labor_rate_type: jobLine.labor_rate_type as LaborRateType || 'standard',
        status: jobLine.status as JobLineStatus || 'pending',
        notes: jobLine.notes || '',
        total_amount: jobLine.total_amount || 0
      });
    }
  }, [jobLine]);

  // Calculate total amount when hours or rate changes
  useEffect(() => {
    const hours = formData.estimated_hours || 0;
    const rate = formData.labor_rate || 0;
    const total = hours * rate;
    
    if (total !== formData.total_amount) {
      setFormData(prev => ({ ...prev, total_amount: total }));
    }
  }, [formData.estimated_hours, formData.labor_rate]);

  const handleSave = async () => {
    if (!jobLine || !formData.name) {
      toast({
        title: "Validation Error",
        description: "Job line name is required",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const updatedJobLine: WorkOrderJobLine = {
        ...jobLine,
        ...formData,
        id: jobLine.id,
        work_order_id: jobLine.work_order_id
      };

      // Update in database
      const { error } = await supabase
        .from('work_order_job_lines')
        .update({
          name: updatedJobLine.name,
          category: updatedJobLine.category,
          subcategory: updatedJobLine.subcategory,
          description: updatedJobLine.description,
          estimated_hours: updatedJobLine.estimated_hours,
          labor_rate: updatedJobLine.labor_rate,
          labor_rate_type: updatedJobLine.labor_rate_type,
          status: updatedJobLine.status,
          notes: updatedJobLine.notes,
          total_amount: updatedJobLine.total_amount
        })
        .eq('id', jobLine.id);

      if (error) throw error;

      await onSave(updatedJobLine);
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
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof WorkOrderJobLine, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getSubcategories = () => {
    if (!formData.category || !sectors.length) return [];
    
    for (const sector of sectors) {
      for (const cat of sector.categories) {
        if (cat.name === formData.category) {
          return cat.subcategories;
        }
      }
    }
    return [];
  };

  const getAllCategories = () => {
    const categories: string[] = [];
    sectors.forEach(sector => {
      sector.categories.forEach(cat => {
        if (!categories.includes(cat.name)) {
          categories.push(cat.name);
        }
      });
    });
    return categories;
  };

  if (!jobLine) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Line</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-4 gap-4 py-4">
          {/* Column 1: Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter job line name"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category || ''} 
                onValueChange={(value) => {
                  handleInputChange('category', value);
                  handleInputChange('subcategory', ''); // Reset subcategory
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {getAllCategories().map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Column 2: Service Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select 
                value={formData.subcategory || ''} 
                onValueChange={(value) => handleInputChange('subcategory', value)}
                disabled={!formData.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {getSubcategories().map((subcat) => (
                    <SelectItem key={subcat.id} value={subcat.name}>
                      {subcat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter description"
                rows={3}
              />
            </div>
          </div>

          {/* Column 3: Time & Rates */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                step="0.25"
                min="0"
                value={formData.estimated_hours || ''}
                onChange={(e) => handleInputChange('estimated_hours', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="labor_rate">Labor Rate ($)</Label>
              <Input
                id="labor_rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.labor_rate || ''}
                onChange={(e) => handleInputChange('labor_rate', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="labor_rate_type">Rate Type</Label>
              <Select 
                value={formData.labor_rate_type || 'standard'} 
                onValueChange={(value: LaborRateType) => handleInputChange('labor_rate_type', value)}
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
          </div>

          {/* Column 4: Status & Total */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status || 'pending'} 
                onValueChange={(value: JobLineStatus) => handleInputChange('status', value)}
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

            <div>
              <Label htmlFor="total_amount">Total Amount ($)</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.total_amount || ''}
                onChange={(e) => handleInputChange('total_amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="bg-muted"
                readOnly
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !formData.name}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
