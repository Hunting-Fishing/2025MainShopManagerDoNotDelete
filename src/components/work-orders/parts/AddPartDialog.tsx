
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';
import { ComprehensivePartEntryForm } from './ComprehensivePartEntryForm';

interface AddPartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderId: string;
  onPartAdded: (part: WorkOrderPart) => void;
  jobLineId?: string;
}

interface PartFormData {
  part_name: string;
  part_number: string;
  quantity: number;
  customer_price: number;
  status: string;
  category?: string;
  supplier_name?: string;
  notes_internal?: string;
  core_charge_applied?: boolean;
  core_charge_amount?: number;
  is_taxable?: boolean;
  warranty_duration?: string;
  part_type?: string;
  markup_percentage?: number;
  supplier_cost?: number;
  retail_price?: number;
  bin_location?: string;
  is_stock_item?: boolean;
  supplier_order_ref?: string;
  inventory_item_id?: string;
}

export function AddPartDialog({
  isOpen,
  onClose,
  workOrderId,
  onPartAdded,
  jobLineId
}: AddPartDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (formData: PartFormData) => {
    if (!formData.part_name || !formData.part_number || formData.quantity <= 0 || formData.customer_price < 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const partData = {
        work_order_id: workOrderId,
        job_line_id: jobLineId || null,
        part_name: formData.part_name,
        part_number: formData.part_number,
        quantity: formData.quantity,
        customer_price: formData.customer_price,
        status: formData.status || 'pending',
        category: formData.category || null,
        supplier_name: formData.supplier_name || null,
        notes_internal: formData.notes_internal || null,
        core_charge_applied: formData.core_charge_applied || false,
        core_charge_amount: formData.core_charge_amount || 0,
        is_taxable: formData.is_taxable !== undefined ? formData.is_taxable : true,
        warranty_duration: formData.warranty_duration || null,
        part_type: formData.part_type || null,
        markup_percentage: formData.markup_percentage || null,
        supplier_cost: formData.supplier_cost || null,
        retail_price: formData.retail_price || null,
        bin_location: formData.bin_location || null,
        is_stock_item: formData.is_stock_item || false,
        supplier_order_ref: formData.supplier_order_ref || null,
        inventory_item_id: formData.inventory_item_id || null
      };

      console.log('Inserting part data:', partData);

      const { data, error } = await supabase
        .from('work_order_parts')
        .insert([partData])
        .select('*')
        .single();

      if (error) {
        console.error('Error inserting part:', error);
        toast({
          title: "Error",
          description: `Failed to add part: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Part inserted successfully:', data);

      // Convert database response to WorkOrderPart format
      const workOrderPart: WorkOrderPart = {
        id: data.id,
        work_order_id: data.work_order_id,
        job_line_id: data.job_line_id,
        part_number: data.part_number,
        name: data.part_name,
        description: data.part_description || '',
        quantity: data.quantity,
        unit_price: data.customer_price, // Map customer_price to unit_price for compatibility
        total_price: data.customer_price * data.quantity,
        status: data.status,
        notes: data.notes_internal || '',
        created_at: data.created_at,
        updated_at: data.updated_at,
        
        // Additional properties
        partName: data.part_name,
        partNumber: data.part_number,
        supplierName: data.supplier_name,
        supplierCost: data.supplier_cost,
        customerPrice: data.customer_price,
        retailPrice: data.retail_price,
        category: data.category,
        warrantyDuration: data.warranty_duration,
        binLocation: data.bin_location,
        partType: data.part_type,
        markupPercentage: data.markup_percentage,
        inventoryItemId: data.inventory_item_id,
        coreChargeApplied: data.core_charge_applied,
        coreChargeAmount: data.core_charge_amount,
        isTaxable: data.is_taxable,
        isStockItem: data.is_stock_item,
        supplierOrderRef: data.supplier_order_ref,
        notesInternal: data.notes_internal
      };

      onPartAdded(workOrderPart);
      
      toast({
        title: "Success",
        description: "Part added successfully",
      });
      
      onClose();
    } catch (err) {
      console.error('Unexpected error adding part:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding the part",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Part</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <ComprehensivePartEntryForm
            onSubmit={handleSubmit}
            submitButtonText="Add Part"
            isSubmitting={isSubmitting}
          />
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
