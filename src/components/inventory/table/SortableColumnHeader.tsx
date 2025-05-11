
import React from "react";
import { TableHead } from "@/components/ui/table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ColumnId = "name" | "sku" | "partNumber" | "barcode" | "category" | 
  "subcategory" | "manufacturer" | "vehicleCompatibility" | "location" | 
  "quantity" | "quantityReserved" | "quantityAvailable" | "onOrder" | 
  "reorderPoint" | "cost" | "unitPrice" | "marginMarkup" | "totalValue" | 
  "warrantyPeriod" | "status" | "supplier" | "dateBought" | "dateLast" | 
  "notes" | "coreCharge" | "serialNumbers";

export interface Column {
  id: ColumnId;
  label: string;
  visible: boolean;
}

export interface SortableColumnHeaderProps {
  id: ColumnId;
  label: string;
  visible: boolean;
  onHideColumn: (columnId: ColumnId) => void;
  onAddColumn?: () => void;
}

export const SortableColumnHeader = ({ 
  id, 
  label,
  visible,
  onHideColumn, 
  onAddColumn 
}: SortableColumnHeaderProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableHead ref={setNodeRef} style={style} className="relative">
      <div className="flex items-center">
        <div 
          {...attributes} 
          {...listeners}
          className="mr-2 touch-none cursor-grab opacity-50 hover:opacity-100"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <span>{label}</span>
      </div>
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={() => onHideColumn(id)}
        >
          <Eye className="h-3 w-3" />
        </Button>
        {onAddColumn && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={onAddColumn}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
    </TableHead>
  );
};
