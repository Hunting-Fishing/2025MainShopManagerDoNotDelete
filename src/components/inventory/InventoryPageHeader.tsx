
import React from "react";
import { InventoryStockHeader } from "@/components/inventory/InventoryStockHeader";

export function InventoryPageHeader() {
  return (
    <InventoryStockHeader
      title="Inventory Management"
      description="Manage your inventory items, track stock levels, and view inventory metrics."
      showControls={true}
      onExport={() => console.log("Export inventory")}
      onImport={() => console.log("Import inventory")}
    />
  );
}
