
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ClearInventoryButton } from "./ClearInventoryButton";

export function InventoryPageHeader() {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">
          Manage your real inventory items from the database
        </p>
      </div>
      <div className="flex gap-2">
        <ClearInventoryButton onCleared={handleRefresh} />
        <Button onClick={() => navigate("/inventory/add")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
    </div>
  );
}
