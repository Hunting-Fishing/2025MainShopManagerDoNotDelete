
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InventoryQuantityManagerProps {
  itemId: string;
  quantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

export const InventoryQuantityManager: React.FC<InventoryQuantityManagerProps> = ({
  itemId,
  quantity,
  onUpdateQuantity
}) => {
  return (
    <div className="flex items-center justify-center">
      <Button 
        variant="outline" 
        size="icon" 
        className="h-7 w-7"
        onClick={() => onUpdateQuantity(itemId, quantity - 1)}
      >
        -
      </Button>
      <Input 
        type="number" 
        value={quantity}
        onChange={(e) => onUpdateQuantity(itemId, parseInt(e.target.value) || 0)}
        className="h-7 w-16 mx-1 text-center"
        min={1}
      />
      <Button 
        variant="outline" 
        size="icon" 
        className="h-7 w-7"
        onClick={() => onUpdateQuantity(itemId, quantity + 1)}
      >
        +
      </Button>
    </div>
  );
};
