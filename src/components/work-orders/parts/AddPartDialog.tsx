
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { useToast } from '@/hooks/use-toast';
import { ComprehensivePartEntryForm } from './ComprehensivePartEntryForm';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AddPartDialogProps {
  workOrderId: string;
  jobLineId?: string;
  onPartAdd?: (part: WorkOrderPart) => void;
  isOpen?: boolean;
  onClose?: () => void;
  jobLines?: any[];
  onPartAdded?: () => void;
}

export function AddPartDialog({
  workOrderId,
  jobLineId,
  onPartAdd,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onPartAdded
}: AddPartDialogProps) {
  const { toast } = useToast();
  const params = useParams();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use workOrderId from props or URL params
  const currentWorkOrderId = workOrderId || params.id;

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnClose ? (open: boolean) => {
    if (!open) externalOnClose();
  } : setInternalIsOpen;

  const handlePartAdd = async (partData: WorkOrderPartFormValues) => {
    setIsLoading(true);
    try {
      console.log('Attempting to save part with data:', partData);
      
      // Prepare the data for insertion using the correct column names
      const insertData = {
        work_order_id: currentWorkOrderId,
        job_line_id: jobLineId || null,
        part_number: partData.part_number,
        part_name: partData.name, // Use part_name column
        quantity: partData.quantity,
        unit_price: partData.unit_price,
        status: partData.status || 'pending',
        notes: partData.notes || null,
        supplier_name: partData.supplierName || null,
        supplier_cost: partData.supplierCost || null,
        customer_price: partData.customerPrice || partData.unit_price,
        retail_price: partData.retailPrice || null,
        category: partData.category || null,
        part_type: partData.partType || null,
        markup_percentage: partData.markupPercentage || null,
        is_taxable: partData.isTaxable !== undefined ? partData.isTaxable : true,
        core_charge_amount: partData.coreChargeAmount || null,
        core_charge_applied: partData.coreChargeApplied || false,
        warranty_duration: partData.warrantyDuration || null,
        invoice_number: partData.invoiceNumber || null,
        po_line: partData.poLine || null,
        is_stock_item: partData.isStockItem !== undefined ? partData.isStockItem : false,
        notes_internal: partData.notesInternal || null,
        inventory_item_id: partData.inventoryItemId || null
      };

      console.log('Inserting part with data:', insertData);

      const { data, error } = await supabase
        .from('work_order_parts')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Part saved successfully:', data);

      // Create a WorkOrderPart object for the callback
      const newPart: WorkOrderPart = {
        id: data.id,
        work_order_id: data.work_order_id,
        job_line_id: data.job_line_id,
        part_number: data.part_number,
        name: data.part_name,
        description: '', // This column doesn't exist in the actual table
        quantity: data.quantity,
        unit_price: data.unit_price,
        total_price: data.quantity * data.customer_price,
        status: data.status,
        notes: data.notes,
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
        partType: data.part_type,
        markupPercentage: data.markup_percentage,
        isTaxable: data.is_taxable,
        coreChargeAmount: data.core_charge_amount,
        coreChargeApplied: data.core_charge_applied,
        warrantyDuration: data.warranty_duration,
        invoiceNumber: data.invoice_number,
        poLine: data.po_line,
        isStockItem: data.is_stock_item,
        notesInternal: data.notes_internal,
        inventoryItemId: data.inventory_item_id
      };

      // Call onPartAdd if provided
      if (onPartAdd) {
        onPartAdd(newPart);
      }

      // Call onPartAdded if provided
      if (onPartAdded) {
        onPartAdded();
      }

      toast({
        title: "Success",
        description: "Part added successfully"
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding part:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add part",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {externalIsOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline">Add Part</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50">
        <DialogHeader>
          <DialogTitle>Add Part</DialogTitle>
        </DialogHeader>
        
        <ComprehensivePartEntryForm 
          onPartAdd={handlePartAdd} 
          onCancel={handleCancel} 
          isLoading={isLoading}
          workOrderId={currentWorkOrderId}
          jobLineId={jobLineId}
        />
      </DialogContent>
    </Dialog>
  );
}
