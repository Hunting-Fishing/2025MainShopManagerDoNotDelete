
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableHead } from "@/components/ui/table";
import { Eye, EyeOff } from "lucide-react";

export interface Column {
  id: string;
  name: string; // This is needed for compatibility
  label: string;
  visible: boolean;
}

export type ColumnId = string;

interface SortableColumnHeaderProps {
  column: Column;
  onToggleVisibility: (id: string) => void;
}

export function SortableColumnHeader({ column, onToggleVisibility }: SortableColumnHeaderProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium"
    >
      <div className="flex items-center">
        <div {...attributes} {...listeners} className="mr-2 flex-shrink-0">
          <GripVertical className="h-4 w-4 text-gray-500" />
        </div>
        <span>{column.label}</span>
        <button
          type="button"
          onClick={() => onToggleVisibility(column.id)}
          className="ml-2 rounded p-1 hover:bg-gray-100"
        >
          {column.visible ? (
            <Eye className="h-3 w-3 text-gray-500" />
          ) : (
            <EyeOff className="h-3 w-3 text-gray-500" />
          )}
        </button>
      </div>
    </TableHead>
  );
}

// Let's import the GripVertical icon which was missing
import { GripVertical } from "lucide-react";
