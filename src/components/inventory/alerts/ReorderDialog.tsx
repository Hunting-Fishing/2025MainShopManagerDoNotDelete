
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventoryItemExtended } from "@/types/inventory";

interface ReorderDialogProps {
  item: InventoryItemExtended;
  onReorder: (itemId: string, quantity: number) => Promise<boolean>;
}

export function ReorderDialog({ item, onReorder }: ReorderDialogProps) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(item.reorderPoint * 2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onReorder(item.id, quantity);
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        size="sm" 
        variant={item.quantity === 0 ? "destructive" : "outline"}
        className={item.quantity === 0 ? "bg-red-100 text-red-800 hover:bg-red-200 border-red-300" : ""}
      >
        Reorder
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reorder {item.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current">Current Stock</Label>
                <Input id="current" value={item.quantity} disabled />
              </div>
              <div>
                <Label htmlFor="reorderPoint">Reorder Point</Label>
                <Input id="reorderPoint" value={item.reorderPoint} disabled />
              </div>
            </div>
            
            <div>
              <Label htmlFor="quantity">Order Quantity</Label>
              <Input 
                id="quantity" 
                type="number"
                value={quantity} 
                onChange={e => setQuantity(Number(e.target.value))}
                min={1}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Ordering..." : "Place Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
