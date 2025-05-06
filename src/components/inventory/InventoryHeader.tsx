
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { PlusCircle, Package, ShoppingCart, Boxes } from "lucide-react";

export function InventoryHeader() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          asChild 
          variant={currentPath === "/inventory" ? "default" : "outline"}
        >
          <Link to="/inventory" className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        
        <Button 
          asChild 
          variant={currentPath === "/inventory/stock" ? "default" : "outline"}
        >
          <Link to="/inventory/stock" className="flex items-center gap-1">
            <Boxes className="h-4 w-4" />
            Inventory Stock
          </Link>
        </Button>

        <Button 
          asChild 
          variant={currentPath === "/inventory/orders" ? "default" : "outline"}
        >
          <Link to="/inventory/orders" className="flex items-center gap-1">
            <ShoppingCart className="h-4 w-4" />
            Items on Order
          </Link>
        </Button>
        
        <Button asChild className="ml-auto">
          <Link to="/inventory/add" className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Item
          </Link>
        </Button>
      </div>
    </div>
  );
}
