
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderPart } from '@/types/workOrderPart';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Plus, Search } from 'lucide-react';

interface AddPartsDialogProps {
  workOrderId: string;
  jobLineId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPartsAdd: () => void;
}

export function AddPartsDialog({
  workOrderId,
  jobLineId,
  open,
  onOpenChange,
  onPartsAdd
}: AddPartsDialogProps) {
  const [partData, setPartData] = useState({
    partName: '',
    partNumber: '',
    quantity: 1,
    supplierCost: 0,
    markupPercentage: 30,
    customerPrice: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const calculateCustomerPrice = () => {
    const markup = partData.supplierCost * (partData.markupPercentage / 100);
    return partData.supplierCost + markup;
  };

  const handleAddPart = async () => {
    if (!partData.partName.trim()) {
      toast({
        title: "Error",
        description: "Part name is required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const customerPrice = calculateCustomerPrice();
      
      const { error } = await supabase
        .from('work_order_parts')
        .insert({
          work_order_id: workOrderId,
          job_line_id: jobLineId,
          part_name: partData.partName,
          part_number: partData.partNumber || null,
          quantity: partData.quantity,
          supplier_cost: partData.supplierCost,
          markup_percentage: partData.markupPercentage,
          customer_price: customerPrice,
          retail_price: customerPrice,
          part_type: 'non-inventory',
          is_taxable: true,
          core_charge_amount: 0,
          core_charge_applied: false,
          status: 'ordered',
          is_stock_item: false,
          date_added: new Date().toISOString(),
          attachments: []
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Part added successfully"
      });

      onPartsAdd();
      setPartData({
        partName: '',
        partNumber: '',
        quantity: 1,
        supplierCost: 0,
        markupPercentage: 30,
        customerPrice: 0
      });
    } catch (error) {
      console.error('Error adding part:', error);
      toast({
        title: "Error",
        description: "Failed to add part",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Parts to Job Line</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="partName">Part Name *</Label>
            <Input
              id="partName"
              value={partData.partName}
              onChange={(e) => setPartData({ ...partData, partName: e.target.value })}
              placeholder="Enter part name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="partNumber">Part Number</Label>
            <Input
              id="partNumber"
              value={partData.partNumber}
              onChange={(e) => setPartData({ ...partData, partNumber: e.target.value })}
              placeholder="Enter part number"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={partData.quantity}
                onChange={(e) => setPartData({ ...partData, quantity: parseInt(e.target.value) || 1 })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="supplierCost">Supplier Cost</Label>
              <Input
                id="supplierCost"
                type="number"
                step="0.01"
                min="0"
                value={partData.supplierCost}
                onChange={(e) => setPartData({ ...partData, supplierCost: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="markupPercentage">Markup Percentage</Label>
            <Input
              id="markupPercentage"
              type="number"
              min="0"
              value={partData.markupPercentage}
              onChange={(e) => setPartData({ ...partData, markupPercentage: parseFloat(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Customer Price (Calculated)</Label>
            <div className="mt-1 p-2 bg-muted rounded-md text-sm">
              ${calculateCustomerPrice().toFixed(2)}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPart} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
