
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InventoryItemExtended } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Column type definition
type ColumnId = 
  | "name" 
  | "sku" 
  | "partNumber" 
  | "category" 
  | "subcategory" 
  | "quantity" 
  | "location" 
  | "supplier" 
  | "unitPrice" 
  | "cost"
  | "vehicleCompatibility"
  | "manufacturer"
  | "status"
  | "warrantyPeriod"
  | "notes";

interface Column {
  id: ColumnId;
  label: string;
  visible: boolean;
}

interface SortableColumnHeaderProps {
  column: Column;
}

// Sortable column header component
const SortableColumnHeader = ({ column }: SortableColumnHeaderProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: column.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <TableHead ref={setNodeRef} style={style} {...attributes} {...listeners} className="select-none cursor-grab">
      <div className="flex flex-col items-center">
        <span>{column.label}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 mt-1">
              <span className="text-xs text-gray-500">•••</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Sort Ascending</DropdownMenuItem>
            <DropdownMenuItem>Sort Descending</DropdownMenuItem>
            <DropdownMenuItem>Filter</DropdownMenuItem>
            <DropdownMenuItem>Hide Column</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TableHead>
  );
};

interface InventoryTableProps {
  items: InventoryItemExtended[];
}

export const InventoryTable = ({ items }: InventoryTableProps) => {
  const navigate = useNavigate();
  const [columns, setColumns] = useState<Column[]>([
    { id: "name", label: "Name", visible: true },
    { id: "sku", label: "SKU", visible: true },
    { id: "partNumber", label: "Part #", visible: true },
    { id: "category", label: "Category", visible: true },
    { id: "subcategory", label: "Subcategory", visible: true },
    { id: "quantity", label: "Quantity", visible: true },
    { id: "location", label: "Location", visible: true },
    { id: "supplier", label: "Supplier", visible: true },
    { id: "unitPrice", label: "Unit Price", visible: true },
    { id: "cost", label: "Cost", visible: true },
    { id: "vehicleCompatibility", label: "Vehicle Compatibility", visible: false },
    { id: "manufacturer", label: "Manufacturer", visible: false },
    { id: "status", label: "Status", visible: true },
    { id: "warrantyPeriod", label: "Warranty", visible: false },
    { id: "notes", label: "Notes", visible: false },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = [...items];
        const [removed] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, removed);
        
        return newItems;
      });
    }
  };

  const handleRowClick = (itemId: string) => {
    navigate(`/inventory/item/${itemId}`);
  };

  const getColumnValue = (item: InventoryItemExtended, columnId: ColumnId) => {
    switch (columnId) {
      case "name":
        return item.name;
      case "sku":
        return item.sku;
      case "partNumber":
        return item.partNumber;
      case "category":
        return item.category;
      case "subcategory":
        return item.subcategory;
      case "quantity":
        return item.quantity;
      case "location":
        return item.location;
      case "supplier":
        return item.supplier;
      case "unitPrice":
        return `$${item.unitPrice.toFixed(2)}`;
      case "cost":
        return item.cost ? `$${item.cost.toFixed(2)}` : "-";
      case "vehicleCompatibility":
        return item.vehicleCompatibility || "-";
      case "manufacturer":
        return item.manufacturer || "-";
      case "status":
        return item.status;
      case "warrantyPeriod":
        return item.warrantyPeriod || "-";
      case "notes":
        return item.notes || "-";
      default:
        return "-";
    }
  };

  const visibleColumns = columns.filter((col) => col.visible);

  return (
    <div className="w-full overflow-auto border rounded-md">
      <Table>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToHorizontalAxis]}
        >
          <SortableContext items={visibleColumns.map(col => col.id)} strategy={horizontalListSortingStrategy}>
            <TableHeader>
              <TableRow>
                {visibleColumns.map((column) => (
                  <SortableColumnHeader key={column.id} column={column} />
                ))}
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
          </SortableContext>
        </DndContext>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleColumns.length + 1} className="h-24 text-center">
                No inventory items found
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleRowClick(item.id)}>
                {visibleColumns.map((column) => (
                  <TableCell key={`${item.id}-${column.id}`}>
                    {getColumnValue(item, column.id)}
                  </TableCell>
                ))}
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/inventory/item/${item.id}/edit`);
                  }}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
