
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ComprehensivePartEntryForm } from './ComprehensivePartEntryForm';
import { WorkOrderJobLine } from '@/types/jobLine';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AddPartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderId: string;
  jobLines?: WorkOrderJobLine[];
  jobLineId?: string;
  onPartAdded?: () => void;
}

export interface PartFormData {
  name: string;
  part_number: string;
  description?: string;
  quantity: number;
  unit_price: number;
  status?: string;
  notes?: string;
  job_line_id?: string;
  category?: string;
  customerPrice?: number;
  supplierCost?: number;
  retailPrice?: number;
  markupPercentage?: number;
  isTaxable?: boolean;
  coreChargeAmount?: number;
  coreChargeApplied?: boolean;
  warrantyDuration?: string;
  warrantyExpiryDate?: string;
  installDate?: string;
  installedBy?: string;
  invoiceNumber?: string;
  poLine?: string;
  isStockItem?: boolean;
  supplierName?: string;
  supplierOrderRef?: string;
  notesInternal?: string;
  inventoryItemId?: string;
  partType?: string;
  estimatedArrivalDate?: string;
  itemStatus?: string;
}

export function AddPartDialog({
  isOpen,
  onClose,
  workOrderId,
  jobLines = [],
  jobLineId,
  onPartAdded
}: AddPartDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (formData: PartFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting part data:', formData);

      // Calculate total price
      const totalPrice = formData.quantity * formData.unit_price;

      // Prepare data for database insertion
      const partData = {
        work_order_id: workOrderId,
        job_line_id: formData.job_line_id || jobLineId || null,
        part_number: formData.part_number,
        part_name: formData.name, // Use part_name instead of name
        notes: formData.description || '', // Use notes field for description
        quantity: formData.quantity,
        customer_price: formData.unit_price, // Use customer_price instead of unit_price
        total_price: totalPrice,
        status: formData.status || 'pending',
        category: formData.category || '',
        supplier_cost: formData.supplierCost || 0,
        retail_price: formData.retailPrice || formData.unit_price,
        markup_percentage: formData.markupPercentage || 0,
        is_taxable: formData.isTaxable || false,
        core_charge_amount: formData.coreChargeAmount || 0,
        core_charge_applied: formData.coreChargeApplied || false,
        warranty_duration: formData.warrantyDuration || '',
        warranty_expiry_date: formData.warrantyExpiryDate || null,
        install_date: formData.installDate || null,
        installed_by: formData.installedBy || '',
        invoice_number: formData.invoiceNumber || '',
        po_line: formData.poLine || '',
        is_stock_item: formData.isStockItem || false,
        supplier_name: formData.supplierName || '',
        notes_internal: formData.notesInternal || '',
        inventory_item_id: formData.inventoryItemId || null,
        part_type: formData.partType || '',
        estimated_arrival_date: formData.estimatedArrivalDate || null,
        item_status: formData.itemStatus || 'pending'
      };

      console.log('Inserting part data to database:', partData);

      const { data, error } = await supabase
        .from('work_order_parts')
        .insert([partData])
        .select()
        .single();

      if (error) {
        console.error('Error inserting part:', error);
        throw error;
      }

      console.log('Part inserted successfully:', data);

      toast({
        title: "Success",
        description: "Part added successfully",
      });

      onPartAdded?.();
      onClose();
    } catch (error: any) {
      console.error('Error adding part:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add part",
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
          <DialogTitle>Add Part to Work Order</DialogTitle>
        </DialogHeader>
        
        <ComprehensivePartEntryForm
          workOrderId={workOrderId}
          jobLines={jobLines}
          onFormSubmit={handleSubmit}
          submitButtonText="Add Part"
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
