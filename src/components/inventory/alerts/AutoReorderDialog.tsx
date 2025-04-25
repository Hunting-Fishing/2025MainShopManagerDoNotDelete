
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventoryItemExtended } from "@/types/inventory";

interface AutoReorderDialogProps {
  item: InventoryItemExtended;
  autoReorderSettings: { enabled: boolean } | Record<string, { enabled: boolean, threshold?: number, quantity?: number }>;
  onEnableAutoReorder: (itemId: string, threshold: number, quantity: number) => Promise<boolean>;
}

export function AutoReorderDialog({ item, autoReorderSettings, onEnableAutoReorder }: AutoReorderDialogProps) {
  const [open, setOpen] = useState(false);
  const [threshold, setThreshold] = useState(item.reorderPoint);
  const [quantity, setQuantity] = useState(item.reorderPoint * 2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if auto-reorder is enabled for this item
  const isAutoReorderEnabled = typeof autoReorderSettings === 'object' && 
    item.id in autoReorderSettings && 
    autoReorderSettings[item.id]?.enabled;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onEnableAutoReorder(item.id, threshold, quantity);
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
        variant="secondary"
        className={isAutoReorderEnabled ? "bg-purple-100 text-purple-800 hover:bg-purple-200" : ""}
      >
        {isAutoReorderEnabled ? "Auto-reorder On" : "Set Auto-reorder"}
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto-reorder Settings</DialogTitle>
            <DialogDescription>
              Configure automatic reordering for {item.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="threshold">Reorder Threshold</Label>
              <Input 
                id="threshold" 
                type="number"
                value={threshold} 
                onChange={e => setThreshold(Number(e.target.value))}
                min={1}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Order will be placed when quantity falls below this number
              </p>
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
              <p className="text-sm text-muted-foreground mt-1">
                This quantity will be ordered automatically
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Enable Auto-reorder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
