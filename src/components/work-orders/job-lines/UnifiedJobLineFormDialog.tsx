
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { createJobLine, updateJobLine } from '@/services/workOrder/jobLinesService';
import { toast } from '@/hooks/use-toast';

interface UnifiedJobLineFormDialogProps {
  workOrderId: string;
  jobLine?: WorkOrderJobLine;
  mode: 'add-service' | 'add-manual' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (jobLines: WorkOrderJobLine[]) => void;
}

export function UnifiedJobLineFormDialog({
  workOrderId,
  jobLine,
  mode,
  open,
  onOpenChange,
  onSave
}: UnifiedJobLineFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimated_hours: 0,
    labor_rate: 0,
    labor_rate_type: 'standard' as const,
    status: 'pending' as const,
    notes: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when dialog opens or job line changes
  useEffect(() => {
    console.log('🔄 UnifiedJobLineFormDialog - Initializing form data:', { jobLine, mode });
    
    if (jobLine && mode === 'edit') {
      setFormData({
        name: jobLine.name || '',
        category: jobLine.category || '',
        subcategory: jobLine.subcategory || '',
        description: jobLine.description || '',
        estimated_hours: jobLine.estimated_hours || 0,
        labor_rate: jobLine.labor_rate || 0,
        labor_rate_type: jobLine.labor_rate_type || 'standard',
        status: jobLine.status || 'pending',
        notes: jobLine.notes || ''
      });
    } else {
      // Reset form for new job lines
      setFormData({
        name: '',
        category: '',
        subcategory: '',
        description: '',
        estimated_hours: 0,
        labor_rate: 0,
        labor_rate_type: 'standard',
        status: 'pending',
        notes: ''
      });
    }
    
    // Clear any previous errors
    setError(null);
  }, [jobLine, mode, open]);

  const calculateTotalAmount = () => {
    return formData.estimated_hours * formData.labor_rate;
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Job line name is required';
    }
    if (formData.estimated_hours < 0) {
      return 'Estimated hours cannot be negative';
    }
    if (formData.labor_rate < 0) {
      return 'Labor rate cannot be negative';
    }
    return null;
  };

  const handleSave = async () => {
    console.log('💾 UnifiedJobLineFormDialog - Starting save process');
    console.log('📊 Form data:', formData);
    console.log('🎯 Mode:', mode);
    console.log('🔗 Work Order ID:', workOrderId);
    
    setError(null);
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      console.error('❌ Form validation failed:', validationError);
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const jobLineData = {
        work_order_id: workOrderId,
        name: formData.name.trim(),
        category: formData.category.trim(),
        subcategory: formData.subcategory.trim(),
        description: formData.description.trim(),
        estimated_hours: formData.estimated_hours,
        labor_rate: formData.labor_rate,
        labor_rate_type: formData.labor_rate_type,
        total_amount: calculateTotalAmount(),
        status: formData.status,
        display_order: 0,
        notes: formData.notes.trim()
      };

      console.log('📝 Prepared job line data:', jobLineData);

      let savedJobLine: WorkOrderJobLine;

      if (mode === 'edit' && jobLine?.id) {
        console.log('🔧 Updating existing job line:', jobLine.id);
        savedJobLine = await updateJobLine(jobLine.id, jobLineData);
        console.log('✅ Job line updated successfully:', savedJobLine);
        
        toast({
          title: 'Success',
          description: 'Job line updated successfully',
        });
      } else {
        console.log('🔨 Creating new job line');
        savedJobLine = await createJobLine(jobLineData);
        console.log('✅ Job line created successfully:', savedJobLine);
        
        toast({
          title: 'Success',
          description: 'Job line created successfully',
        });
      }

      // Call the onSave callback with the saved job line
      console.log('📤 Calling onSave callback with job line:', savedJobLine);
      onSave([savedJobLine]);
      
      // Close the dialog
      onOpenChange(false);

    } catch (error: any) {
      console.error('❌ Error saving job line:', error);
      
      const errorMessage = error?.message || 'Failed to save job line. Please try again.';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('❌ UnifiedJobLineFormDialog - Cancel clicked');
    setError(null);
    onOpenChange(false);
  };

  const getDialogTitle = () => {
    switch (mode) {
      case 'add-service':
        return 'Add Service Job Line';
      case 'add-manual':
        return 'Add Manual Job Line';
      case 'edit':
        return 'Edit Job Line';
      default:
        return 'Job Line';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter job line name"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Enter category"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                placeholder="Enter subcategory"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                disabled={isLoading}
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                min="0"
                step="0.1"
                value={formData.estimated_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: parseFloat(e.target.value) || 0 }))}
                disabled={isLoading}
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
                onChange={(e) => setFormData(prev => ({ ...prev, labor_rate: parseFloat(e.target.value) || 0 }))}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="labor_rate_type">Rate Type</Label>
              <Select 
                value={formData.labor_rate_type} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, labor_rate_type: value }))}
                disabled={isLoading}
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

          <div>
            <Label htmlFor="total_amount">Total Amount</Label>
            <Input
              id="total_amount"
              type="number"
              value={calculateTotalAmount().toFixed(2)}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter any additional notes"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'edit' ? 'Update' : 'Save'} Job Line
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
