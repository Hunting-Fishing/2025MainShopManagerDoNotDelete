import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateJobPartOrder } from '@/hooks/useGunsmithJobPartOrders';
import { Loader2 } from 'lucide-react';

interface GunsmithJobPartOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  customerId?: string;
}

export function GunsmithJobPartOrderDialog({
  open,
  onOpenChange,
  jobId,
  customerId,
}: GunsmithJobPartOrderDialogProps) {
  const [formData, setFormData] = useState({
    part_number: '',
    part_name: '',
    supplier: '',
    supplier_contact: '',
    quantity_ordered: 1,
    unit_cost: '',
    expected_date: '',
    notes: '',
  });

  const createOrder = useCreateJobPartOrder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createOrder.mutateAsync({
      job_id: jobId,
      customer_id: customerId,
      part_number: formData.part_number,
      part_name: formData.part_name,
      supplier: formData.supplier || undefined,
      supplier_contact: formData.supplier_contact || undefined,
      quantity_ordered: formData.quantity_ordered,
      unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : undefined,
      expected_date: formData.expected_date || undefined,
      notes: formData.notes || undefined,
    });

    // Reset form and close
    setFormData({
      part_number: '',
      part_name: '',
      supplier: '',
      supplier_contact: '',
      quantity_ordered: 1,
      unit_cost: '',
      expected_date: '',
      notes: '',
    });
    onOpenChange(false);
  };

  const totalCost = formData.unit_cost 
    ? (parseFloat(formData.unit_cost) * formData.quantity_ordered).toFixed(2)
    : '0.00';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Order Part for Job</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                placeholder="e.g., GLK-19-TB"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity_ordered}
                onChange={(e) => setFormData({ ...formData, quantity_ordered: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="part_name">Part Name *</Label>
            <Input
              id="part_name"
              value={formData.part_name}
              onChange={(e) => setFormData({ ...formData, part_name: e.target.value })}
              placeholder="e.g., Glock 19 Gen 5 Trigger Bar"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="e.g., Brownells, MidwayUSA"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier_contact">Supplier Contact / Order #</Label>
            <Input
              id="supplier_contact"
              value={formData.supplier_contact}
              onChange={(e) => setFormData({ ...formData, supplier_contact: e.target.value })}
              placeholder="e.g., 1-800-741-0015 or Order #12345"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit_cost">Unit Cost ($)</Label>
              <Input
                id="unit_cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Total Cost</Label>
              <div className="h-10 flex items-center px-3 bg-muted rounded-md text-muted-foreground">
                ${totalCost}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected_date">Expected Arrival Date</Label>
            <Input
              id="expected_date"
              type="date"
              value={formData.expected_date}
              onChange={(e) => setFormData({ ...formData, expected_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this order..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createOrder.isPending}>
              {createOrder.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
