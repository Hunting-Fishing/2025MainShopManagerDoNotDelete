
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AddPartsDialogProps {
  workOrderId: string;
  jobLineId?: string;
  onPartAdd: (part: WorkOrderPartFormValues) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPartsDialog({ 
  workOrderId, 
  jobLineId, 
  onPartAdd, 
  open, 
  onOpenChange 
}: AddPartsDialogProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    part_number: '',
    name: '',
    unit_price: 0,
    quantity: 1,
    description: '',
    job_line_id: jobLineId,
    status: 'pending',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const partData = {
        ...formData,
        work_order_id: workOrderId,
        job_line_id: jobLineId,
        total_price: formData.quantity * formData.unit_price
      };

      await createWorkOrderPart(partData);
      
      onPartAdd(formData);
      toast.success('Part added successfully');
      
      // Reset form
      setFormData({
        part_number: '',
        name: '',
        unit_price: 0,
        quantity: 1,
        description: '',
        job_line_id: jobLineId,
        status: 'pending',
        notes: ''
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error('Failed to add part');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Part to Job Line</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="part_number">Part Number</Label>
            <Input 
              id="part_number"
              value={formData.part_number} 
              onChange={e => setFormData({
                ...formData,
                part_number: e.target.value
              })} 
              required
            />
          </div>
          
          <div>
            <Label htmlFor="name">Part Name</Label>
            <Input 
              id="name"
              value={formData.name} 
              onChange={e => setFormData({
                ...formData,
                name: e.target.value
              })} 
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              value={formData.description || ''} 
              onChange={e => setFormData({
                ...formData,
                description: e.target.value
              })} 
              placeholder="Optional part description..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity"
                type="number" 
                min="1"
                value={formData.quantity} 
                onChange={e => setFormData({
                  ...formData,
                  quantity: parseInt(e.target.value) || 1
                })} 
                required
              />
            </div>
            
            <div>
              <Label htmlFor="unit_price">Unit Price</Label>
              <Input 
                id="unit_price"
                type="number" 
                step="0.01" 
                min="0"
                value={formData.unit_price} 
                onChange={e => setFormData({
                  ...formData,
                  unit_price: parseFloat(e.target.value) || 0
                })} 
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes"
              value={formData.notes || ''} 
              onChange={e => setFormData({
                ...formData,
                notes: e.target.value
              })} 
              placeholder="Optional notes..."
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Part'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
