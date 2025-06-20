
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
    name: '',
    part_number: '',
    description: '',
    category: '',
    quantity: 1,
    unit_price: 0,
    supplier_name: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.part_number.trim()) {
      toast({
        title: "Error",
        description: "Part name and part number are required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const partData = {
        work_order_id: workOrderId,
        job_line_id: jobLineId || null,
        name: formData.name.trim(),
        part_number: formData.part_number.trim(),
        description: formData.description.trim() || null,
        category: formData.category || null,
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        total_price: formData.quantity * formData.unit_price,
        status: 'special-order',
        notes: formData.notes.trim() || null
      };

      console.log('Creating special order part:', partData);

      const { error } = await supabase
        .from('work_order_parts')
        .insert([partData]);

      if (error) {
        console.error('Error creating special order part:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Special order part added successfully",
      });

      // Reset form
      setFormData({
        name: '',
        part_number: '',
        description: '',
        category: '',
        quantity: 1,
        unit_price: 0,
        supplier_name: '',
        notes: ''
      });

      onClose();
      
      if (onPartAdded) {
        onPartAdded();
      }

    } catch (error) {
      console.error('Error adding special order part:', error);
      toast({
        title: "Error",
        description: "Failed to add special order part",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      name: '',
      part_number: '',
      description: '',
      category: '',
      quantity: 1,
      unit_price: 0,
      supplier_name: '',
      notes: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Special Order Part</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Part Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter part name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => handleInputChange('part_number', e.target.value)}
                placeholder="Enter part number"
                required
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
              <Label htmlFor="unit_price">Unit Price</Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Total Price</Label>
              <div className="px-3 py-2 bg-gray-50 rounded-md text-sm font-medium">
                ${(formData.quantity * formData.unit_price).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier_name">Supplier</Label>
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

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Special Order Part'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
