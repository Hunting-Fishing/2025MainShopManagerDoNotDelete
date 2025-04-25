
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EditPartQuantityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuantity: number;
  onConfirm: (quantity: number) => void;
}

export function EditPartQuantityDialog({ 
  open, 
  onOpenChange, 
  initialQuantity, 
  onConfirm 
}: EditPartQuantityDialogProps) {
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleConfirm = () => {
    if (quantity > 0) {
      onConfirm(quantity);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Part Quantity</DialogTitle>
          <DialogDescription>
            Adjust the quantity of this part in the work order.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Input 
            type="number" 
            min="1" 
            value={quantity} 
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Update Quantity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
