
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
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full p-1 border border-gray-200/50 shadow-sm">
      <span className="text-sm text-gray-500 mr-2 pl-2">View:</span>
      <ToggleGroup 
        type="single" 
        value={viewMode} 
        onValueChange={(val) => val && onViewModeChange(val as 'table' | 'card')}
        className="space-x-1"
      >
        <ToggleGroupItem 
          value="table" 
          aria-label="Table view" 
          className="h-8 w-8 p-0 
            bg-gray-100 hover:bg-gray-200 
            data-[state=on]:bg-indigo-500 data-[state=on]:text-white
            transition-colors duration-200 rounded-full"
        >
          <Table className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="card" 
          aria-label="Card view" 
          className="h-8 w-8 p-0 
            bg-gray-100 hover:bg-gray-200 
            data-[state=on]:bg-indigo-500 data-[state=on]:text-white
            transition-colors duration-200 rounded-full"
        >
          <LayoutGrid className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
