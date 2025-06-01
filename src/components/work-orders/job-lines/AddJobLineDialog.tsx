
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkOrderJobLine } from '@/types/jobLine';
import { ServiceJob } from '@/types/serviceHierarchy';
import { HierarchicalServiceSelector } from '../fields/services/HierarchicalServiceSelector';
import { toast } from 'sonner';

interface AddJobLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddJobLine: (newJobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => void;
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
  const [activeTab, setActiveTab] = useState<'browse' | 'manual'>('browse');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimatedHours: '',
    laborRate: '',
    totalAmount: '',
    status: 'pending' as const,
    notes: ''
  });

  const handleServiceSelect = (service: ServiceJob & { categoryName: string; subcategoryName: string }) => {
    // Convert estimated time from minutes to hours
    const estimatedHours = service.estimatedTime ? (service.estimatedTime / 60).toString() : '';
    
    setFormData({
      name: service.name,
      category: service.categoryName,
      subcategory: service.subcategoryName,
      description: service.description || '',
      estimatedHours,
      laborRate: '75', // Default labor rate - could be made configurable
      totalAmount: service.price ? service.price.toString() : '',
      status: 'pending',
      notes: ''
    });
    
    // Switch to manual tab to show the populated form
    setActiveTab('manual');
    
    toast.success(`Selected: ${service.name}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Job name is required');
      return;
    }

    const newJobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'> = {
      workOrderId,
      name: formData.name.trim(),
      category: formData.category || undefined,
      subcategory: formData.subcategory || undefined,
      description: formData.description || undefined,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
      laborRate: formData.laborRate ? parseFloat(formData.laborRate) : undefined,
      totalAmount: formData.totalAmount ? parseFloat(formData.totalAmount) : undefined,
      status: formData.status,
      notes: formData.notes || undefined
    };

    onAddJobLine(newJobLine);
    
    // Reset form
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      description: '',
      estimatedHours: '',
      laborRate: '',
      totalAmount: '',
      status: 'pending',
      notes: ''
    });
    
    setActiveTab('browse');
    onOpenChange(false);
    
    toast.success('Job line added successfully');
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      description: '',
      estimatedHours: '',
      laborRate: '',
      totalAmount: '',
      status: 'pending',
      notes: ''
    });
    setActiveTab('browse');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Job Line</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'browse' | 'manual')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Services</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-4">
            <div className="max-h-[500px] overflow-y-auto">
              <HierarchicalServiceSelector onServiceSelect={handleServiceSelect} />
            </div>
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Job Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter job name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
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
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Service category"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                    placeholder="Service subcategory"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="laborRate">Labor Rate ($/hour)</Label>
                  <Input
                    id="laborRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.laborRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, laborRate: e.target.value }))}
                    placeholder="75.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Job description..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount ($)</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Job Line
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
