
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CategorySelector } from './CategorySelector';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SpecialOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderId: string;
  jobLineId?: string;
  onPartAdded?: () => void;
}

export function SpecialOrderDialog({
  isOpen,
  onClose,
  workOrderId,
  jobLineId,
  onPartAdded
}: SpecialOrderDialogProps) {
  const [formData, setFormData] = useState({
    part_name: '',
    part_number: '',
    description: '',
    category: '',
    quantity: 1,
    customer_price: 0,
    supplier_name: '',
    supplier_cost: 0,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.part_name || !formData.part_number) {
      toast({
        title: "Validation Error",
        description: "Part name and part number are required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Adding special order part:', formData);

    try {
      // Map form data to database schema
      const partData = {
        work_order_id: workOrderId,
        job_line_id: jobLineId || null,
        part_name: formData.part_name,
        part_number: formData.part_number,
        category: formData.category || null,
        quantity: formData.quantity,
        customer_price: formData.customer_price,
        supplier_name: formData.supplier_name || null,
        supplier_cost: formData.supplier_cost || 0,
        notes: formData.notes || null,
        part_type: 'special_order',
        status: 'pending'
      };

      const { error } = await supabase
        .from('work_order_parts')
        .insert([partData]);

      if (error) {
        console.error('Error adding special order part:', error);
        toast({
          title: "Error",
          description: "Failed to add special order part",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Special order part added successfully"
      });

      // Reset form
      setFormData({
        part_name: '',
        part_number: '',
        description: '',
        category: '',
        quantity: 1,
        customer_price: 0,
        supplier_name: '',
        supplier_cost: 0,
        notes: ''
      });

      onPartAdded?.();
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      part_name: '',
      part_number: '',
      description: '',
      category: '',
      quantity: 1,
      customer_price: 0,
      supplier_name: '',
      supplier_cost: 0,
      notes: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Special Order Part</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="part_name">Part Name *</Label>
              <Input
                id="part_name"
                value={formData.part_name}
                onChange={(e) => handleInputChange('part_name', e.target.value)}
                placeholder="Enter part name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => handleInputChange('part_number', e.target.value)}
                placeholder="Enter part number"
              />
            </div>
          </div>

          <CategorySelector
            value={formData.category}
            onValueChange={(value) => handleInputChange('category', value)}
          />

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter part description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer_price">Customer Price</Label>
              <Input
                id="customer_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.customer_price}
                onChange={(e) => handleInputChange('customer_price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplier_cost">Supplier Cost</Label>
              <Input
                id="supplier_cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.supplier_cost}
                onChange={(e) => handleInputChange('supplier_cost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier_name">Supplier Name</Label>
            <Input
              id="supplier_name"
              value={formData.supplier_name}
              onChange={(e) => handleInputChange('supplier_name', e.target.value)}
              placeholder="Enter supplier name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Part'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
