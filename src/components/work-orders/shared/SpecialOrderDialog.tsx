
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CategorySelector } from '../parts/CategorySelector';

export interface SpecialOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderId?: string;
  jobLineId?: string;
  onPartAdded?: () => void;
  onOrderCreated?: (orderId: string) => void;
}

interface SpecialOrderFormData {
  partName: string;
  partNumber: string;
  description: string;
  quantity: number;
  supplierName: string;
  supplierCost: number;
  customerPrice: number;
  category: string;
  estimatedArrivalDate: string;
  notes: string;
}

const initialFormData: SpecialOrderFormData = {
  partName: '',
  partNumber: '',
  description: '',
  quantity: 1,
  supplierName: '',
  supplierCost: 0,
  customerPrice: 0,
  category: '',
  estimatedArrivalDate: '',
  notes: ''
};

export function SpecialOrderDialog({
  isOpen,
  onClose,
  workOrderId,
  jobLineId,
  onPartAdded,
  onOrderCreated
}: SpecialOrderDialogProps) {
  const [formData, setFormData] = useState<SpecialOrderFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof SpecialOrderFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.partName.trim()) {
      toast({
        title: "Validation Error",
        description: "Part name is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.partNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Part number is required",
        variant: "destructive"
      });
      return false;
    }

    if (formData.quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Quantity must be greater than 0",
        variant: "destructive"
      });
      return false;
    }

    if (formData.customerPrice < 0) {
      toast({
        title: "Validation Error",
        description: "Customer price cannot be negative",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // If we have a work order context, add directly to work_order_parts
      if (workOrderId) {
        const partData = {
          work_order_id: workOrderId,
          job_line_id: jobLineId || null,
          part_name: formData.partName,
          part_number: formData.partNumber,
          description: formData.description,
          quantity: formData.quantity,
          unit_price: formData.customerPrice,
          total_price: formData.customerPrice * formData.quantity,
          supplier_name: formData.supplierName || null,
          supplier_cost: formData.supplierCost || 0,
          customer_price: formData.customerPrice,
          retail_price: formData.customerPrice,
          category: formData.category || null,
          part_type: 'special-order',
          status: 'pending',
          estimated_arrival_date: formData.estimatedArrivalDate || null,
          notes: formData.notes || null
        };

        const { data, error } = await supabase
          .from('work_order_parts')
          .insert([partData])
          .select()
          .single();

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

        if (onPartAdded) {
          onPartAdded();
        }
      } else {
        // General inventory special order - could be extended for other use cases
        toast({
          title: "Info",
          description: "General inventory special orders not yet implemented",
          variant: "destructive"
        });
        return;
      }

      // Reset form and close dialog
      setFormData(initialFormData);
      onClose();

    } catch (error) {
      console.error('Error creating special order:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Special Order</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Basic Part Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partName">Part Name *</Label>
              <Input
                id="partName"
                value={formData.partName}
                onChange={(e) => handleInputChange('partName', e.target.value)}
                placeholder="Enter part name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="partNumber">Part Number *</Label>
              <Input
                id="partNumber"
                value={formData.partNumber}
                onChange={(e) => handleInputChange('partNumber', e.target.value)}
                placeholder="Enter part number"
              />
            </div>
          </div>

          {/* Description */}
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

          {/* Category Selection */}
          <CategorySelector
            value={formData.category}
            onValueChange={(value) => handleInputChange('category', value)}
          />

          {/* Quantity and Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplierCost">Supplier Cost</Label>
              <Input
                id="supplierCost"
                type="number"
                min="0"
                step="0.01"
                value={formData.supplierCost}
                onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerPrice">Customer Price *</Label>
              <Input
                id="customerPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.customerPrice}
                onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Supplier Information */}
          <div className="space-y-2">
            <Label htmlFor="supplierName">Supplier Name</Label>
            <Input
              id="supplierName"
              value={formData.supplierName}
              onChange={(e) => handleInputChange('supplierName', e.target.value)}
              placeholder="Enter supplier name"
            />
          </div>

          {/* Estimated Arrival Date */}
          <div className="space-y-2">
            <Label htmlFor="estimatedArrivalDate">Estimated Arrival Date</Label>
            <Input
              id="estimatedArrivalDate"
              type="date"
              value={formData.estimatedArrivalDate}
              onChange={(e) => handleInputChange('estimatedArrivalDate', e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes or special instructions"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Special Order'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
