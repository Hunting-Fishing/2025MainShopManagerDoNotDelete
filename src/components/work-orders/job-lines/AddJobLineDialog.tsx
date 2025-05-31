
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine } from '@/types/jobLine';
import { useLabourRates } from '@/hooks/useLabourRates';

interface AddJobLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddJobLine: (jobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  workOrderId: string;
  shopId?: string;
}

export function AddJobLineDialog({
  open,
  onOpenChange,
  onAddJobLine,
  workOrderId,
  shopId
}: AddJobLineDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    estimatedHours: 0,
    laborRate: 0
  });
  
  const { rates } = useLabourRates();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const jobLine = {
      workOrderId,
      name: formData.name,
      category: formData.category || undefined,
      description: formData.description || undefined,
      estimatedHours: formData.estimatedHours,
      laborRate: formData.laborRate,
      totalAmount: formData.estimatedHours * formData.laborRate,
      status: 'pending' as const,
      notes: undefined
    };

    onAddJobLine(jobLine);
    
    // Reset form
    setFormData({
      name: '',
      category: '',
      description: '',
      estimatedHours: 0,
      laborRate: 0
    });
    
    onOpenChange(false);
  };

  const handleLaborRateTypeChange = (rateType: string) => {
    let laborRate = typeof rates.standard_rate === 'number' ? rates.standard_rate : parseFloat(rates.standard_rate.toString()) || 100;
    
    switch (rateType) {
      case 'diagnostic':
        laborRate = typeof rates.diagnostic_rate === 'number' ? rates.diagnostic_rate : parseFloat(rates.diagnostic_rate.toString()) || 120;
        break;
      case 'emergency':
        laborRate = typeof rates.emergency_rate === 'number' ? rates.emergency_rate : parseFloat(rates.emergency_rate.toString()) || 150;
        break;
      case 'warranty':
        laborRate = typeof rates.warranty_rate === 'number' ? rates.warranty_rate : parseFloat(rates.warranty_rate.toString()) || 80;
        break;
      case 'internal':
        laborRate = typeof rates.internal_rate === 'number' ? rates.internal_rate : parseFloat(rates.internal_rate.toString()) || 75;
        break;
    }

    setFormData(prev => ({ ...prev, laborRate }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Job Line</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Oil Change, Brake Pad Replacement"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., Maintenance, Repair"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Additional details about the service"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hours">Estimated Hours *</Label>
              <Input
                id="hours"
                type="number"
                step="0.1"
                min="0"
                value={formData.estimatedHours || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  estimatedHours: parseFloat(e.target.value) || 0 
                }))}
                placeholder="0.0"
                required
              />
            </div>

            <div>
              <Label>Labor Rate Type *</Label>
              <Select onValueChange={handleLaborRateTypeChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select rate type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (${typeof rates.standard_rate === 'number' ? rates.standard_rate : parseFloat(rates.standard_rate.toString()) || 100}/hr)</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic (${typeof rates.diagnostic_rate === 'number' ? rates.diagnostic_rate : parseFloat(rates.diagnostic_rate.toString()) || 120}/hr)</SelectItem>
                  <SelectItem value="emergency">Emergency (${typeof rates.emergency_rate === 'number' ? rates.emergency_rate : parseFloat(rates.emergency_rate.toString()) || 150}/hr)</SelectItem>
                  <SelectItem value="warranty">Warranty (${typeof rates.warranty_rate === 'number' ? rates.warranty_rate : parseFloat(rates.warranty_rate.toString()) || 80}/hr)</SelectItem>
                  <SelectItem value="internal">Internal (${typeof rates.internal_rate === 'number' ? rates.internal_rate : parseFloat(rates.internal_rate.toString()) || 75}/hr)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Labor Rate: ${formData.laborRate}/hr
            </div>
            <div className="font-semibold">
              Total: ${(formData.estimatedHours * formData.laborRate).toFixed(2)}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || formData.estimatedHours <= 0 || formData.laborRate <= 0}>
              Add Job Line
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
