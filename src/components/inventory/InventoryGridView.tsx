import React from 'react';
import { InventoryItemExtended } from '@/types/inventory';
import { InventoryCard } from './InventoryCard';
import { useInventoryView } from '@/contexts/InventoryViewContext';

interface InventoryGridViewProps {
  items: InventoryItemExtended[];
  onUpdateItem?: (id: string, updates: Partial<InventoryItemExtended>) => Promise<InventoryItemExtended>;
}

export function InventoryGridView({ items, onUpdateItem }: InventoryGridViewProps) {
  const { selectedItems, toggleItemSelection } = useInventoryView();

  const handleEdit = (item: InventoryItemExtended) => {
    // Navigate to edit page or open edit modal
    console.log('Edit item:', item);
  };

  const handleDelete = (id: string) => {
    // Handle delete action
    console.log('Delete item:', id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <InventoryCard
          key={item.id}
          item={item}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isSelected={selectedItems.includes(item.id)}
          onToggleSelect={toggleItemSelection}
        />
      ))}
    </div>
  );
}