
import { Link } from "react-router-dom";
import { BarChart2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InventoryHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">
          Manage your parts, materials, and supplies.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4" />
          Inventory Report
        </Button>
        <Button asChild className="flex items-center gap-2 bg-esm-blue-600 hover:bg-esm-blue-700">
          <Link to="/inventory/new">
            <Plus className="h-4 w-4" />
            Add Item
          </Link>
        </Button>
      </div>
    </div>
  );
}
