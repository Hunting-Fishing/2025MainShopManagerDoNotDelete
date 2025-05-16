
import React from 'react';
import { Button } from '@/components/ui/button';
import { Package2, Filter, Search } from 'lucide-react';

interface EmptyInventoryProps {
  searchQuery: string;
  filtersActive: boolean;
  onReset: () => void;
}

export function EmptyInventory({ searchQuery, filtersActive, onReset }: EmptyInventoryProps) {
  // Display different messages based on search or filter state
  const getMessage = () => {
    if (searchQuery) {
      return {
        title: 'No items found',
        description: `We couldn't find any inventory items matching "${searchQuery}"`,
        icon: <Search className="h-12 w-12 text-muted-foreground/40" />
      };
    } else if (filtersActive) {
      return {
        title: 'No matching items',
        description: 'No inventory items match your current filter selections',
        icon: <Filter className="h-12 w-12 text-muted-foreground/40" />
      };
    } else {
      return {
        title: 'No inventory items',
        description: 'Your inventory is empty. Add items to get started.',
        icon: <Package2 className="h-12 w-12 text-muted-foreground/40" />
      };
    }
  };
  
  const message = getMessage();
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-lg shadow">
      {message.icon}
      <h3 className="mt-4 text-lg font-semibold">{message.title}</h3>
      <p className="mt-2 text-muted-foreground">{message.description}</p>
      {(searchQuery || filtersActive) && (
        <Button onClick={onReset} variant="outline" className="mt-4">
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
