import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine } from '@/types/jobLine';
import { useServiceSectors } from '@/hooks/useServiceCategories';

interface UnifiedJobLineEditDialogProps {
  workOrderId: string;
  jobLine?: WorkOrderJobLine;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (jobLine: WorkOrderJobLine) => void;
}

export function UnifiedJobLineEditDialog({
  workOrderId,
  jobLine,
  open,
  onOpenChange,
  onSave
}: UnifiedJobLineEditDialogProps) {
  const { sectors, loading } = useServiceSectors();
  
  const [formData, setFormData] = useState({
    name: jobLine?.name || '',
    category: jobLine?.category || '',
    subcategory: jobLine?.subcategory || '',
    description: jobLine?.description || '',
    estimated_hours: jobLine?.estimated_hours || 0,
    labor_rate: jobLine?.labor_rate || 0,
    total_amount: jobLine?.total_amount || 0,
    notes: jobLine?.notes || '',
    status: jobLine?.status || 'pending',
    labor_rate_type: jobLine?.labor_rate_type || 'standard'
  });

  useEffect(() => {
    if (jobLine) {
      setFormData({
        name: jobLine.name || '',
        category: jobLine.category || '',
        subcategory: jobLine.subcategory || '',
        description: jobLine.description || '',
        estimated_hours: jobLine.estimated_hours || 0,
        labor_rate: jobLine.labor_rate || 0,
        total_amount: jobLine.total_amount || 0,
        notes: jobLine.notes || '',
        status: jobLine.status || 'pending',
        labor_rate_type: jobLine.labor_rate_type || 'standard'
      });
    }
  }, [jobLine]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedJobLine: WorkOrderJobLine = {
      id: jobLine?.id || '',
      work_order_id: workOrderId,
      ...formData,
      updated_at: new Date().toISOString()
    };
    
    onSave(updatedJobLine);
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get available categories and subcategories
  const availableCategories = sectors.flatMap(sector => 
    sector.categories.map(cat => ({ id: cat.id, name: cat.name }))
  );

  const availableSubcategories = formData.category 
    ? sectors.flatMap(sector => 
        sector.categories
          .filter(cat => cat.name === formData.category)
          .flatMap(cat => cat.subcategories.map(sub => ({ id: sub.id, name: sub.name })))
      )
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {jobLine ? 'Edit Job Line' : 'Add Job Line'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {/* Column 1: Basic Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-700 border-b pb-2">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Job Line Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter job line name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
            </div>

            {/* Column 2: Service Classification */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-700 border-b pb-2">Service Classification</h3>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select 
                  value={formData.subcategory} 
                  onValueChange={(value) => handleInputChange('subcategory', value)}
                  disabled={!formData.category}
                >
                  <SelectTrigger>
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

            {/* Column 3: Time & Rates */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-700 border-b pb-2">Time & Rates</h3>
              
              <div className="space-y-2">
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

              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label htmlFor="labor_rate_type">Rate Type</Label>
                <Select 
                  value={formData.labor_rate_type} 
                  onValueChange={(value: 'standard' | 'overtime' | 'premium' | 'flat_rate') => handleInputChange('labor_rate_type', value)}
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

              <div className="space-y-2">
                <Label htmlFor="total_amount">Total Amount ($)</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.total_amount}
                  onChange={(e) => handleInputChange('total_amount', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Column 4: Status & Notes */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-700 border-b pb-2">Status & Notes</h3>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: 'pending' | 'in-progress' | 'completed' | 'on-hold') => handleInputChange('status', value)}
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

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes"
                  rows={6}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {jobLine ? 'Update Job Line' : 'Add Job Line'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Export the component
export { UnifiedJobLineEditDialog };
