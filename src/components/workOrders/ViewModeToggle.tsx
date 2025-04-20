
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, Table } from "lucide-react";

interface ViewModeToggleProps {
  viewMode: 'table' | 'card';
  onViewModeChange: (mode: 'table' | 'card') => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ 
  viewMode, 
  onViewModeChange 
}) => {
  return (
    <div className="flex items-center gap-2 bg-white shadow-md rounded-lg p-2 border border-gray-200">
      <span className="text-sm font-medium text-gray-700">View:</span>
      <ToggleGroup 
        type="single" 
        value={viewMode} 
        onValueChange={(val) => val && onViewModeChange(val as 'table' | 'card')}
        className="bg-gray-100 rounded-md p-1 space-x-1"
      >
        <ToggleGroupItem 
          value="table" 
          aria-label="Table view" 
          className="h-8 w-8 rounded-md 
            data-[state=on]:bg-indigo-600 data-[state=on]:text-white 
            data-[state=off]:bg-white data-[state=off]:text-gray-600
            hover:bg-indigo-50 hover:text-indigo-600
            shadow-sm transition-all duration-200"
        >
          <Table className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="card" 
          aria-label="Card view" 
          className="h-8 w-8 rounded-md
            data-[state=on]:bg-indigo-600 data-[state=on]:text-white
            data-[state=off]:bg-white data-[state=off]:text-gray-600
            hover:bg-indigo-50 hover:text-indigo-600
            shadow-sm transition-all duration-200"
        >
          <LayoutGrid className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
