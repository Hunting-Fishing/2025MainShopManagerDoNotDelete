
import React from "react";
import { Table } from "@/components/ui/table";
import { InventoryItemExtended } from "@/types/inventory";
import { useNavigate } from "react-router-dom";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors
} from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { TableHeader } from "./TableHeader";
import { TableBody } from "./TableBody";
import { useColumnDragDrop } from "./useColumnDragDrop";
import { Column } from "./SortableColumnHeader";

interface InventoryTableProps {
  items: InventoryItemExtended[];
}

export const InventoryTable = ({ items }: InventoryTableProps) => {
  const navigate = useNavigate();
  const initialColumns: Column[] = [
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
  ];

  const { columns, handleDragEnd } = useColumnDragDrop(initialColumns);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleRowClick = (itemId: string) => {
    navigate(`/inventory/item/${itemId}`);
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
          <TableHeader columns={columns} />
          <TableBody 
            items={items} 
            visibleColumns={visibleColumns} 
            onRowClick={handleRowClick} 
          />
        </DndContext>
      </Table>
    </div>
  );
};
