
import React from "react";
import { ArrowUpDown, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Column {
  id: string;
  name: string;
  label: string;
  visible: boolean;
}

export interface SortableColumnHeaderProps {
  column: Column;
  onSort?: () => void;
}

export function SortableColumnHeader({ column, onSort }: SortableColumnHeaderProps) {
  return (
    <div className="flex items-center">
      <Button 
        variant="ghost" 
        onClick={onSort} 
        className="h-8 px-2"
      >
        {column.label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
