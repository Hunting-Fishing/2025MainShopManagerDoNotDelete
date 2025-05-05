
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle, ShoppingCart } from "lucide-react";

export function InventoryHeader() {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
      <div className="flex space-x-4">
        <Button asChild variant="outline">
          <Link to="/inventory/orders" className="flex items-center gap-1">
            <ShoppingCart className="h-4 w-4" />
            Items on Order
          </Link>
        </Button>
        <Button asChild>
          <Link to="/inventory/add" className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Item
          </Link>
        </Button>
      </div>
    </div>
  );
}
