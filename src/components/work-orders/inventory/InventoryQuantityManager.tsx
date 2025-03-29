
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { inventoryItems } from "@/data/mockInventoryData";

interface InventoryQuantityManagerProps {
  itemId: string;
  quantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  maxAllowed?: number;
}

export const InventoryQuantityManager: React.FC<InventoryQuantityManagerProps> = ({
  itemId,
  quantity,
  onUpdateQuantity,
  maxAllowed
}) => {
  // Find the current inventory item to check available stock
  const inventoryItem = React.useMemo(() => 
    inventoryItems.find(item => item.id === itemId), [itemId]);
  
  // Determine if quantity is valid
  const isInvalidQuantity = React.useMemo(() => {
    if (!inventoryItem) return false;
    // If maxAllowed is specified, use it, otherwise use the inventory item's quantity
    const max = maxAllowed !== undefined ? maxAllowed : inventoryItem.quantity;
    return quantity > max;
  }, [inventoryItem, quantity, maxAllowed]);

  const handleQuantityChange = (newQuantity: number) => {
    // Don't allow negative quantities
    if (newQuantity < 1) return;
    
    if (inventoryItem && maxAllowed === undefined && newQuantity > inventoryItem.quantity) {
      toast({
        title: "Insufficient inventory",
        description: `Only ${inventoryItem.quantity} units available in stock`,
        variant: "destructive"
      });
      // Set to maximum available
      onUpdateQuantity(itemId, inventoryItem.quantity);
      return;
    }
    
    onUpdateQuantity(itemId, newQuantity);
  };

  return (
    <div className="flex items-center justify-center">
      <Button 
        variant="outline" 
        size="icon" 
        className="h-7 w-7"
        onClick={() => handleQuantityChange(quantity - 1)}
        disabled={quantity <= 1}
      >
        -
      </Button>
      <Input 
        type="number" 
        value={quantity}
        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
        className={`h-7 w-16 mx-1 text-center ${isInvalidQuantity ? 'border-red-500' : ''}`}
        min={1}
      />
      <Button 
        variant="outline" 
        size="icon" 
        className="h-7 w-7"
        onClick={() => handleQuantityChange(quantity + 1)}
        disabled={isInvalidQuantity}
      >
        +
      </Button>
    </div>
  );
};
