
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderPart, WORK_ORDER_PART_STATUSES } from '@/types/workOrderPart';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface EditPartDialogProps {
  part: WorkOrderPart | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (part: WorkOrderPart) => void;
}

export function EditPartDialog({
  part,
  open,
  onOpenChange,
  onSave
}: EditPartDialogProps) {
  const [formData, setFormData] = useState<Partial<WorkOrderPart>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (part) {
      setFormData({
        ...part,
        total_price: (part.unit_price || 0) * (part.quantity || 0)
      });
    }
  }, [part]);

  const handleSave = async () => {
    if (!part || !formData) return;

    try {
      setIsSaving(true);
      
      const updatedPart: WorkOrderPart = {
        ...part,
        ...formData,
        total_price: (formData.unit_price || 0) * (formData.quantity || 0)
      };

      onSave(updatedPart);
      toast.success('Part updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving part:', error);
      toast.error('Failed to save part');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (field: keyof WorkOrderPart, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Recalculate total when quantity or unit price changes
      if (field === 'quantity' || field === 'unit_price') {
        updated.total_price = (updated.unit_price || 0) * (updated.quantity || 0);
      }
      return updated;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Part</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Part Name</Label>
            <Input 
              id="name" 
              value={formData.name || ''} 
              onChange={e => updateFormData('name', e.target.value)} 
            />
          </div>

          <div>
            <Label htmlFor="part_number">Part Number</Label>
            <Input 
              id="part_number" 
              value={formData.part_number || ''} 
              onChange={e => updateFormData('part_number', e.target.value)} 
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description || ''} 
              onChange={e => updateFormData('description', e.target.value)} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity" 
                type="number" 
                min="0"
                step="1"
                value={formData.quantity || ''} 
                onChange={e => updateFormData('quantity', parseInt(e.target.value) || 0)} 
              />
            </div>
            
            <div>
              <Label htmlFor="unit_price">Unit Price</Label>
              <Input 
                id="unit_price" 
                type="number" 
                min="0"
                step="0.01" 
                value={formData.unit_price || ''} 
                onChange={e => updateFormData('unit_price', parseFloat(e.target.value) || 0)} 
              />
            </div>
          </div>

          <div>
            <Label htmlFor="total_price">Total Price</Label>
            <Input 
              id="total_price" 
              type="number" 
              value={formData.total_price?.toFixed(2) || '0.00'} 
              readOnly
              className="bg-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status || 'pending'} 
              onValueChange={(value) => updateFormData('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {WORK_ORDER_PART_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              value={formData.notes || ''} 
              onChange={e => updateFormData('notes', e.target.value)} 
              placeholder="Add notes for this part..."
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
