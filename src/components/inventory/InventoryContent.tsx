
import React from "react";
import { OptimizedInventoryTable } from "./OptimizedInventoryTable";
import { InventoryGridView } from "./InventoryGridView";
import { InventoryListView } from "./InventoryListView";
import { EmptyInventory } from "@/components/inventory/EmptyInventory";
import { InventoryItemExtended } from "@/types/inventory";
import { useInventoryView } from "@/contexts/InventoryViewContext";
import { AdvancedFilterSidebar } from "./AdvancedFilterSidebar";

interface InventoryContentProps {
  items: InventoryItemExtended[];
  onUpdateItem: (id: string, updates: Partial<InventoryItemExtended>) => Promise<InventoryItemExtended>;
}

export function InventoryContent({ items, onUpdateItem }: InventoryContentProps) {
  const { viewMode, isFilterSidebarOpen } = useInventoryView();

  const renderContent = () => {
    if (items.length === 0) {
      return <EmptyInventory />;
    }

    switch (viewMode) {
      case 'cards':
      case 'grid':
        return <InventoryGridView items={items} onUpdateItem={onUpdateItem} />;
      case 'list':
        return <InventoryListView items={items} onUpdateItem={onUpdateItem} />;
      case 'table':
      default:
        return <OptimizedInventoryTable items={items} />;
    }
  };

  return (
    <div className="flex h-full">
      {isFilterSidebarOpen && <AdvancedFilterSidebar />}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
}
