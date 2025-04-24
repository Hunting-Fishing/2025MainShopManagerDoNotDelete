import { useEffect, useState } from "react";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { InventoryItem } from "@/types/inventory";
import { mapToInventoryItem } from "@/utils/inventoryAdapters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";

interface WorkOrderPartsEstimatorProps {
  onAdd: (item: InventoryItem, quantity: number) => void;
  onCancel: () => void;
}

export function WorkOrderPartsEstimator({ onAdd, onCancel }: WorkOrderPartsEstimatorProps) {
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { loading: inventoryLoading, items: fetchedItems } = useInventoryManager();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  // Fetch inventory items
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) {
          throw error;
        }

        if (data) {
          // Convert the Supabase response to InventoryItem type
          const mappedItems = mapToInventoryItem(data);
          setInventoryItems(mappedItems);
        }
      } catch (err) {
        console.error('Error fetching inventory:', err);
        toast({
          title: 'Error',
          description: 'Failed to load inventory items',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [toast]);

  const filteredItems = inventoryItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(search.toLowerCase())) ||
    (item.category && item.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddItem = () => {
    if (selectedItem) {
      onAdd(selectedItem, quantity);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add Parts & Inventory</DialogTitle>
          <DialogDescription>
            Search for parts and inventory items to add to this work order.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search parts..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <p>Loading inventory items...</p>
            ) : filteredItems.length === 0 ? (
              <p>No items found.</p>
            ) : (
              filteredItems.map((item) => (
                <Button
                  key={item.id}
                  variant="outline"
                  className={`w-full justify-start ${selectedItem?.id === item.id ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : ''}`}
                  onClick={() => setSelectedItem(item)}
                >
                  {item.name}
                </Button>
              ))
            )}
          </div>

          <div>
            {selectedItem ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{selectedItem.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedItem.description}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>SKU</Label>
                    <Input type="text" value={selectedItem.sku || 'N/A'} disabled />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input type="text" value={selectedItem.category || 'N/A'} disabled />
                  </div>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>
              </div>
            ) : (
              <p>Select an item to add.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleAddItem} disabled={!selectedItem}>
            Add Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
