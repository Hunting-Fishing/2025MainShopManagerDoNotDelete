
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

interface AddPartsDialogProps {
  workOrderId: string;
  jobLineId?: string;
  onPartAdd: (part: WorkOrderPartFormValues & { work_order_id: string }) => void;
}

export function AddPartsDialog({ workOrderId, jobLineId, onPartAdd }: AddPartsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    part_number: '',
    name: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    status: 'pending',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const partData: WorkOrderPartFormValues & { work_order_id: string } = {
      work_order_id: workOrderId,
      job_line_id: jobLineId,
      part_number: formData.part_number,
      name: formData.name,
      description: formData.description,
      quantity: formData.quantity,
      unit_price: formData.unit_price,
      status: formData.status,
      notes: formData.notes
    };
    
    onPartAdd(partData);
    setIsOpen(false);
    setFormData({
      part_number: '',
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      status: 'pending',
      notes: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Manual Entry</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manual Part Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Part Number</label>
            <Input
              value={formData.part_number}
              onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit Price</label>
            <Input
              type="number"
              step="0.01"
              value={formData.unit_price}
              onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <Input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Part</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
