
import React from "react";
import { OptimizedInventoryTable } from "./OptimizedInventoryTable";
import { EmptyInventory } from "@/components/inventory/EmptyInventory";
import { InventoryItemExtended } from "@/types/inventory";

interface InventoryContentProps {
  items: InventoryItemExtended[];
  onUpdateItem: (id: string, updates: Partial<InventoryItemExtended>) => Promise<InventoryItemExtended>;
}

export function InventoryContent({ items, onUpdateItem }: InventoryContentProps) {
  return (
    <>
      {items.length > 0 ? (
        <OptimizedInventoryTable 
          items={items}
        />
      ) : (
        <EmptyInventory />
      )}
    </>
  );
}
