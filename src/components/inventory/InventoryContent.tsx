
import React from "react";
import { OptimizedInventoryTable } from "./OptimizedInventoryTable";
import { InventoryGridView } from "./InventoryGridView";
import { InventoryListView } from "./InventoryListView";
import { EmptyInventory } from "@/components/inventory/EmptyInventory";
import { InventoryContentSkeleton } from "./InventorySkeletons";
import { InventoryItemExtended } from "@/types/inventory";
import { useInventoryView } from "@/contexts/InventoryViewContext";
import { AdvancedFilterSidebar } from "./AdvancedFilterSidebar";

interface InventoryContentProps {
  items: InventoryItemExtended[];
  onUpdateItem: (id: string, updates: Partial<InventoryItemExtended>) => Promise<InventoryItemExtended>;
  loading?: boolean;
}

export function InventoryContent({ items, onUpdateItem, loading = false }: InventoryContentProps) {
  const { viewMode, isFilterSidebarOpen } = useInventoryView();

  const renderContent = () => {
    if (loading) {
      return <InventoryContentSkeleton />;
    }
    
    if (items.length === 0) {
      return <EmptyInventory />;
    }

    switch (viewMode) {
      case 'cards':
      case 'grid':
        return (
          <div className="transition-all duration-300 ease-in-out animate-fade-in">
            <InventoryGridView items={items} onUpdateItem={onUpdateItem} />
          </div>
        );
      case 'list':
        return (
          <div className="transition-all duration-300 ease-in-out animate-fade-in">
            <InventoryListView items={items} onUpdateItem={onUpdateItem} />
          </div>
        );
      case 'table':
      default:
        return (
          <div className="transition-all duration-300 ease-in-out animate-fade-in">
            <OptimizedInventoryTable items={items} />
          </div>
        );
    }
  };

  return (
    <div className="flex h-full">
      {isFilterSidebarOpen && (
        <div className="animate-slide-in-right">
          <AdvancedFilterSidebar />
        </div>
      )}
      <div className="flex-1 transition-all duration-300 ease-in-out">
        {renderContent()}
      </div>
    </div>
  );
}
