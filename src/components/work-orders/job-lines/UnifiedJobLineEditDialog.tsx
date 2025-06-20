
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine } from '@/types/jobLine';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { toast } from '@/hooks/use-toast';

export interface UnifiedJobLineEditDialogProps {
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
  const { sectors, loading: sectorsLoading } = useServiceCategories();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    estimated_hours: 0,
    labor_rate: 0,
    labor_rate_type: 'standard' as const,
    status: 'pending' as const,
    notes: '',
    total_amount: 0
  });

  // Initialize form data when job line changes
  useEffect(() => {
    if (jobLine && open) {
      setFormData({
        name: jobLine.name || '',
        description: jobLine.description || '',
        category: jobLine.category || '',
        subcategory: jobLine.subcategory || '',
        estimated_hours: jobLine.estimated_hours || 0,
        labor_rate: jobLine.labor_rate || 0,
        labor_rate_type: jobLine.labor_rate_type || 'standard',
        status: jobLine.status || 'pending',
        notes: jobLine.notes || '',
        total_amount: jobLine.total_amount || 0
      });
    }
  }, [jobLine, open]);

  // Calculate total amount when hours or rate change
  useEffect(() => {
    const total = (formData.estimated_hours || 0) * (formData.labor_rate || 0);
    setFormData(prev => ({ ...prev, total_amount: total }));
  }, [formData.estimated_hours, formData.labor_rate]);

  // Get available categories from sectors
  const availableCategories = sectors.flatMap(sector => 
    sector.categories.map(category => ({
      id: category.id,
      name: category.name
    }))
  );

  // Get subcategories for selected category
  const availableSubcategories = React.useMemo(() => {
    if (!formData.category) return [];
    
    for (const sector of sectors) {
      const category = sector.categories.find(cat => cat.name === formData.category || cat.id === formData.category);
      if (category) {
        return category.subcategories.map(sub => ({
          id: sub.id,
          name: sub.name
        }));
      }
    }
    return [];
  }, [formData.category, sectors]);

  const handleSave = async () => {
    if (!jobLine) return;

    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Job line name is required",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const updatedJobLine: WorkOrderJobLine = {
        ...jobLine,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        estimated_hours: formData.estimated_hours,
        labor_rate: formData.labor_rate,
        labor_rate_type: formData.labor_rate_type,
        status: formData.status,
        notes: formData.notes,
        total_amount: formData.total_amount
      };

      await onSave(updatedJobLine);
      onOpenChange(false);
      
      toast({
        title: "Success",
        description: "Job line updated successfully"
      });
    } catch (error) {
      console.error('Error saving job line:', error);
      toast({
        title: "Error",
        description: "Failed to update job line",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset subcategory when category changes
    if (field === 'category') {
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  };

  if (!jobLine) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Line</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 4-Column Grid Layout */}
          <div className="grid grid-cols-4 gap-4">
            {/* Column 1: Name & Category */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Enter job line name"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => updateFormData('category', value)}
                  disabled={sectorsLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Column 2: Description & Subcategory */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Enter description"
                  className="w-full h-[76px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory" className="text-sm font-medium">Subcategory</Label>
                <Select 
                  value={formData.subcategory} 
                  onValueChange={(value) => updateFormData('subcategory', value)}
                  disabled={!formData.category || availableSubcategories.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.name}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Column 3: Hours & Labor Rate Type */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_hours" className="text-sm font-medium">Estimated Hours</Label>
                <Input
                  id="estimated_hours"
                  type="number"
                  min="0"
                  step="0.25"
                  value={formData.estimated_hours}
                  onChange={(e) => updateFormData('estimated_hours', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="labor_rate_type" className="text-sm font-medium">Rate Type</Label>
                <Select 
                  value={formData.labor_rate_type} 
                  onValueChange={(value) => updateFormData('labor_rate_type', value)}
                >
                  <SelectTrigger className="w-full">
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

            {/* Column 4: Rate & Status */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="labor_rate" className="text-sm font-medium">Labor Rate ($)</Label>
                <Input
                  id="labor_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.labor_rate}
                  onChange={(e) => updateFormData('labor_rate', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => updateFormData('status', value)}
                >
                  <SelectTrigger className="w-full">
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
          </div>

          {/* Total Amount Display */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-700">Total Amount:</span>
              <span className="text-xl font-bold text-slate-900">
                ${formData.total_amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Notes Section - Full Width */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData('notes', e.target.value)}
              placeholder="Additional notes..."
              className="w-full h-20 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="min-w-20"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
