
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InventoryItem } from "@/types/inventory";

interface InventoryItemSelectorProps {
  inventoryItems: InventoryItem[];
  onSelect: (item: InventoryItem) => void;
  open?: boolean;
  onClose?: () => void;
  showInventoryDialog?: boolean;
  setShowInventoryDialog?: (show: boolean) => void;
}

export function InventoryItemSelector({ 
  inventoryItems,
  onSelect,
  open,
  onClose,
  showInventoryDialog,
  setShowInventoryDialog
}: InventoryItemSelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle both dialog control methods
  const isOpen = open !== undefined ? open : showInventoryDialog;
  const handleClose = () => {
    if (onClose) onClose();
    if (setShowInventoryDialog) setShowInventoryDialog(false);
  };

  const handleSelect = (item: InventoryItem) => {
    onSelect(item);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Inventory Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search for items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <div className="border rounded-md overflow-hidden max-h-80 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No items found matching your search
              </div>
            ) : (
              filteredItems.map((item) => (
                <div 
                  key={item.id}
                  className="border-b last:border-b-0 p-3 flex justify-between items-center hover:bg-slate-50"
                >
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground flex gap-3">
                      <span>SKU: {item.sku || 'N/A'}</span>
                      <span>Price: ${item.price?.toFixed(2) || '0.00'}</span>
                      {item.quantity && <span>In Stock: {item.quantity}</span>}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleSelect(item)}
                  >
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
