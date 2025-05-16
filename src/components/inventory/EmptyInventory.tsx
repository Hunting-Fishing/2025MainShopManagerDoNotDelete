
import React from 'react';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EmptyInventory: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg bg-gray-50">
      <Package className="h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-xl font-medium text-gray-800 mb-2">No inventory items found</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">
        Your inventory is empty or no items match your current filter criteria. 
        Add some items to get started or adjust your search filters.
      </p>
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Reset Filters
        </Button>
        <Button 
          onClick={() => window.location.href = "/inventory/add"}
        >
          Add Item
        </Button>
      </div>
    </div>
  );
};
