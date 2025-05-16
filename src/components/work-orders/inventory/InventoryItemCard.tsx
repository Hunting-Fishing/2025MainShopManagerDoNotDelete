
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, Truck, AlertCircle, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { InventoryItemExtended } from "@/types/inventory";
import { Badge } from "@/components/ui/badge";

interface InventoryItemCardProps {
  item: InventoryItemExtended;
  onAddToOrder: (item: InventoryItemExtended) => void;
}

export const InventoryItemCard: React.FC<InventoryItemCardProps> = ({ item, onAddToOrder }) => {
  // Function to determine stock status and appropriate styling
  const getStockStatus = () => {
    if (item.quantity <= 0) {
      return { 
        label: "Out of Stock", 
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        color: "bg-red-100 text-red-800 border-red-300" 
      };
    } else if (item.quantity <= item.reorder_point) {
      return { 
        label: "Low Stock", 
        icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
        color: "bg-amber-100 text-amber-800 border-amber-300" 
      };
    } else {
      return { 
        label: "In Stock", 
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        color: "bg-green-100 text-green-800 border-green-300" 
      };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-md font-semibold">{item.name}</CardTitle>
          <Badge className={stockStatus.color} variant="outline">
            <span className="flex items-center gap-1">
              {stockStatus.icon}
              {stockStatus.label}
            </span>
          </Badge>
        </div>
        <CardDescription className="flex justify-between mt-1">
          <span>SKU: {item.sku}</span>
          <span className="font-semibold">{formatCurrency(item.unit_price)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="block text-muted-foreground">Stock</span>
            <span>{item.quantity} units</span>
          </div>
          <div>
            <span className="block text-muted-foreground">Category</span>
            <span>{item.category}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          size="sm" 
          className="w-full flex items-center gap-1"
          disabled={item.quantity <= 0}
          onClick={() => onAddToOrder(item)}
        >
          <Plus className="h-4 w-4" />
          Add to Work Order
        </Button>
      </CardFooter>
    </Card>
  );
};
