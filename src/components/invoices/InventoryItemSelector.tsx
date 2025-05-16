
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { InventoryItem } from '@/types/inventory';

export interface InventoryItemSelectorProps {
  inventoryItems: InventoryItem[];
  showInventoryDialog?: boolean;
  setShowInventoryDialog?: (show: boolean) => void;
  onSelect?: (item: InventoryItem) => void;
  onAddInventoryItem?: (item: InventoryItem) => void;
}

export function InventoryItemSelector({
  inventoryItems,
  showInventoryDialog,
  setShowInventoryDialog,
  onSelect,
  onAddInventoryItem,
}: InventoryItemSelectorProps) {
  const [search, setSearch] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  
  // Use either the controlled or uncontrolled dialog state
  const isOpen = showInventoryDialog !== undefined ? showInventoryDialog : dialogOpen;
  const setIsOpen = setShowInventoryDialog || setDialogOpen;
  
  const handleSelect = (item: InventoryItem) => {
    if (onAddInventoryItem) {
      onAddInventoryItem(item);
    } else if (onSelect) {
      onSelect(item);
    }
    setIsOpen(false);
  };
  
  const filteredItems = search
    ? inventoryItems.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase())))
    : inventoryItems;

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Add Item
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4"
            />
            <div className="max-h-[300px] overflow-y-auto">
              {filteredItems.length > 0 ? (
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-2 hover:bg-muted rounded-md cursor-pointer"
                      onClick={() => handleSelect(item)}
                    >
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                      <div className="font-bold">${item.price?.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No items found
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
