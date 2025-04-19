
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
import { BellPlus } from "lucide-react";
import { useState } from "react";
import { InventoryItemExtended } from "@/types/inventory";

interface AutoReorderDialogProps {
  item: InventoryItemExtended;
  autoReorderSettings: { enabled: boolean } | Record<string, { enabled: boolean, threshold?: number, quantity?: number }>;
  onEnableAutoReorder: (itemId: string, threshold: number, quantity: number) => Promise<boolean>;
}

export function AutoReorderDialog({ 
  item, 
  autoReorderSettings,
  onEnableAutoReorder 
}: AutoReorderDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [threshold, setThreshold] = useState(5);
  const [quantity, setQuantity] = useState(20);

  const itemSettings = typeof autoReorderSettings === 'object' && 'enabled' in autoReorderSettings
    ? undefined 
    : autoReorderSettings[item.id];

  const handleEnableAutoReorder = () => {
    onEnableAutoReorder(item.id, threshold, quantity);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <BellPlus className="h-4 w-4 mr-1" />
          Auto-reorder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Auto-reorder</DialogTitle>
          <DialogDescription>
            Set up automatic reordering for {item.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="threshold">Reorder When Stock Falls Below</Label>
            <Input 
              id="threshold" 
              type="number" 
              min="1"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="auto-quantity">Quantity to Order Automatically</Label>
            <Input 
              id="auto-quantity" 
              type="number" 
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleEnableAutoReorder}>
            {itemSettings?.enabled
              ? "Update Auto-reorder" 
              : "Enable Auto-reorder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
