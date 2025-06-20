
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { WorkOrderJobLine, LaborRateType, JobLineStatus } from '@/types/jobLine';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { toast } from '@/hooks/use-toast';

export interface UnifiedJobLineFormDialogProps {
  workOrderId: string;
  mode: 'add-service' | 'add-manual' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (jobLines: WorkOrderJobLine[]) => void;
  jobLine?: WorkOrderJobLine;
}

export function UnifiedJobLineFormDialog({
  workOrderId,
  mode,
  open,
  onOpenChange,
  onSave,
  jobLine
}: UnifiedJobLineFormDialogProps) {
  const { sectors, loading: sectorsLoading } = useServiceSectors();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimated_hours: 0,
    labor_rate: 0,
    labor_rate_type: 'standard' as LaborRateType,
    status: 'pending' as JobLineStatus,
    notes: ''
  });

  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableSubcategories, setAvailableSubcategories] = useState<any[]>([]);

  // Initialize form data when editing
  useEffect(() => {
    if (mode === 'edit' && jobLine) {
      setFormData({
        name: jobLine.name || '',
        category: jobLine.category || '',
        subcategory: jobLine.subcategory || '',
        description: jobLine.description || '',
        estimated_hours: jobLine.estimated_hours || 0,
        labor_rate: jobLine.labor_rate || 0,
        labor_rate_type: (jobLine.labor_rate_type as LaborRateType) || 'standard',
        status: (jobLine.status as JobLineStatus) || 'pending',
        notes: jobLine.notes || ''
      });
      setSelectedCategory(jobLine.category || '');
    }
  }, [mode, jobLine]);

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategory && sectors.length > 0) {
      const allSubcategories: any[] = [];
      sectors.forEach(sector => {
        sector.categories.forEach(category => {
          if (category.name === selectedCategory) {
            allSubcategories.push(...category.subcategories);
          }
        });
      });
      setAvailableSubcategories(allSubcategories);
    } else {
      setAvailableSubcategories([]);
    }
  }, [selectedCategory, sectors]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setFormData(prev => ({
      ...prev,
      category: categoryName,
      subcategory: '' // Reset subcategory when category changes
    }));
  };

  const calculateTotalAmount = () => {
    return (formData.estimated_hours || 0) * (formData.labor_rate || 0);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Job line name is required",
        variant: "destructive"
      });
      return;
    }

    const jobLineData: WorkOrderJobLine = {
      id: jobLine?.id || crypto.randomUUID(),
      work_order_id: workOrderId,
      name: formData.name,
      category: formData.category,
      subcategory: formData.subcategory,
      description: formData.description,
      estimated_hours: formData.estimated_hours,
      labor_rate: formData.labor_rate,
      labor_rate_type: formData.labor_rate_type,
      total_amount: calculateTotalAmount(),
      status: formData.status,
      notes: formData.notes,
      display_order: jobLine?.display_order || 0,
      created_at: jobLine?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onSave([jobLineData]);
    onOpenChange(false);
  };

  const getDialogTitle = () => {
    switch (mode) {
      case 'add-service':
        return 'Add Job Line from Service';
      case 'add-manual':
        return 'Add Manual Job Line';
      case 'edit':
        return 'Edit Job Line';
      default:
        return 'Job Line';
    }
  };

  // Get all categories from all sectors
  const allCategories = sectors.flatMap(sector => sector.categories);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 4-Column Grid Layout */}
          <div className="grid grid-cols-4 gap-4">
            {/* Column 1: Name, Category */}
            <div className="space-y-4">
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
                  onValueChange={handleCategoryChange}
                  disabled={sectorsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Column 2: Description, Subcategory */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter description"
                />
              </div>
              
              <div>
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select 
                  value={formData.subcategory} 
                  onValueChange={(value) => handleInputChange('subcategory', value)}
                  disabled={!selectedCategory || availableSubcategories.length === 0}
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

            {/* Column 3: Hours, Labor Rate Type */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="estimated_hours">Estimated Hours</Label>
                <Input
                  id="estimated_hours"
                  type="number"
                  min="0"
                  step="0.25"
                  value={formData.estimated_hours}
                  onChange={(e) => handleInputChange('estimated_hours', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="labor_rate_type">Rate Type</Label>
                <Select 
                  value={formData.labor_rate_type} 
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

            {/* Column 4: Rate, Status */}
            <div className="space-y-4">
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
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
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
            </div>
          </div>

          {/* Full Width Notes Section */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes..."
              className="min-h-[80px]"
            />
          </div>

          {/* Total Amount Display */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-lg font-bold text-green-600">
                ${calculateTotalAmount().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {mode === 'edit' ? 'Update' : 'Add'} Job Line
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
