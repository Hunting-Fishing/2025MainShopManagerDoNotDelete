
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InventoryItemCard } from "./InventoryItemCard";
import { InventoryItemExtended } from "@/types/inventory";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import { Search, FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface InventorySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (item: InventoryItemExtended) => void;
}

export const InventorySelectionDialog: React.FC<InventorySelectionDialogProps> = ({
  open,
  onOpenChange,
  onAddItem,
}) => {
  const [items, setItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showOutOfStock, setShowOutOfStock] = useState(false);

  // Fetch inventory items when dialog opens
  useEffect(() => {
    if (open) {
      fetchInventoryItems();
    }
  }, [open]);

  // Fetch inventory items from Supabase
  const fetchInventoryItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*');

      if (error) throw error;

      // Format the data to match InventoryItemExtended
      const formattedItems = data.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku || '',
        category: item.category || '',
        supplier: item.supplier || '',
        quantity: item.quantity || 0,
        reorderPoint: item.reorder_point || 0,
        unitPrice: item.unit_price || 0,
        location: item.location || '',
        status: item.quantity <= 0 ? 'Out of Stock' : 
               item.quantity <= item.reorder_point ? 'Low Stock' : 'In Stock'
      }));

      setItems(formattedItems);

      // Extract unique categories
      const uniqueCategories = [...new Set(formattedItems.map(item => item.category))].filter(Boolean);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error loading inventory items:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search query, categories, and stock status
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategories.length === 0 || 
      selectedCategories.includes(item.category);
    
    const matchesStock = 
      showOutOfStock || item.quantity > 0;
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setShowOutOfStock(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Inventory Item</DialogTitle>
          <DialogDescription>
            Choose items from inventory to add to the work order
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-2 my-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-accent' : ''}
          >
            <FilterIcon className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="bg-muted p-3 rounded-md mb-2">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Filters</h4>
              <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium mb-1">Categories</h5>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {categories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <Label htmlFor={`category-${category}`}>{category}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium mb-1">Stock Status</h5>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="show-out-of-stock"
                    checked={showOutOfStock}
                    onCheckedChange={(checked) => setShowOutOfStock(!!checked)}
                  />
                  <Label htmlFor="show-out-of-stock">Show out of stock items</Label>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-1 my-1">
            {selectedCategories.map(cat => (
              <Badge key={cat} variant="outline" className="flex items-center gap-1">
                {cat}
                <button 
                  className="ml-1 hover:text-destructive" 
                  onClick={() => handleCategoryToggle(cat)}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}

        <Separator className="my-2" />
        
        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <InventoryItemCard 
                  key={item.id} 
                  item={item} 
                  onAddItem={onAddItem} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || selectedCategories.length > 0 
                ? "No items match your search criteria." 
                : "No inventory items available."}
            </div>
          )}
        </div>

        <div className="mt-2 text-sm text-muted-foreground">
          Showing {filteredItems.length} of {items.length} items
        </div>
      </DialogContent>
    </Dialog>
  );
};
