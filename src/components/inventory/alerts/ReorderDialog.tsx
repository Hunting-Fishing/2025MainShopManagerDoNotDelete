
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { InventoryItemExtended } from "@/types/inventory";

interface ReorderDialogProps {
  item: InventoryItemExtended;
  onReorder: (itemId: string, quantity: number) => void;
}

export function ReorderDialog({ item, onReorder }: ReorderDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(10);

  const handleReorder = () => {
    onReorder(item.id, quantity);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ShoppingCart className="h-4 w-4 mr-1" />
          Reorder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reorder Item</DialogTitle>
          <DialogDescription>
            Specify the quantity you want to order for {item.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity to Order</Label>
            <Input 
              id="quantity" 
              type="number" 
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleReorder}>Place Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
