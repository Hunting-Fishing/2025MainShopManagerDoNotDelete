
import React, { useEffect } from "react";
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
    { id: "partNumber", label: "Part #", visible: true },
    { id: "name", label: "Item Name", visible: true },
    { id: "sku", label: "SKU", visible: true },
    { id: "barcode", label: "Barcode", visible: true },
    { id: "category", label: "Category", visible: true },
    { id: "subcategory", label: "Subcategory", visible: true },
    { id: "manufacturer", label: "Brand/Manufacturer", visible: true },
    { id: "vehicleCompatibility", label: "Vehicle Compatibility", visible: true },
    { id: "location", label: "Location", visible: true },
    { id: "quantity", label: "Quantity In Stock", visible: true },
    { id: "quantityReserved", label: "Quantity Reserved", visible: false },
    { id: "quantityAvailable", label: "Quantity Available", visible: false },
    { id: "onOrder", label: "Qty on Order", visible: true },
    { id: "reorderPoint", label: "Reorder Level", visible: true },
    { id: "cost", label: "Unit Cost", visible: true },
    { id: "unitPrice", label: "Unit Price", visible: true },
    { id: "marginMarkup", label: "Markup % / Margin", visible: false },
    { id: "totalValue", label: "Total Value", visible: false },
    { id: "warrantyPeriod", label: "Warranty Period", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "supplier", label: "Supplier", visible: true },
    { id: "dateBought", label: "Last Ordered Date", visible: false },
    { id: "dateLast", label: "Last Used On", visible: false },
    { id: "notes", label: "Notes", visible: false },
  ];

  const { columns, setColumns, handleDragEnd } = useColumnDragDrop(initialColumns);
  
  // Load saved columns from localStorage
  useEffect(() => {
    const savedColumns = localStorage.getItem("inventoryTableColumns");
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    }
  }, [setColumns]);

  // Save columns to localStorage when they change
  useEffect(() => {
    localStorage.setItem("inventoryTableColumns", JSON.stringify(columns));
  }, [columns]);

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
          <TableHeader columns={columns} setColumns={setColumns} />
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
