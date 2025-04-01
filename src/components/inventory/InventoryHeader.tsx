
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { ClearInventoryButton } from "./ClearInventoryButton";

interface InventoryHeaderProps {
  onInventoryCleared?: () => void;
}

export function InventoryHeader({ onInventoryCleared }: InventoryHeaderProps = {}) {
  // Handle inventory cleared, default to refreshing the page if no callback provided
  const handleInventoryCleared = () => {
    if (onInventoryCleared) {
      onInventoryCleared();
    } else {
      // Force a page refresh to show changes
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">
          Manage your parts and materials inventory
        </p>
      </div>
      <div className="flex gap-2">
        <ClearInventoryButton onSuccess={handleInventoryCleared} />
        <Link to="/inventory/add">
          <Button className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Inventory Item
          </Button>
        </Link>
      </div>
    </div>
  );
}
