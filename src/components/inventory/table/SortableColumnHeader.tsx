
import React from 'react';
import { TableHead } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DndContext, 
  DragOverlay, 
  UniqueIdentifier, 
  useDraggable, 
  useDroppable 
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { GripVertical } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type ColumnId = 
  | "name" 
  | "sku" 
  | "partNumber" 
  | "barcode" 
  | "category" 
  | "subcategory" 
  | "manufacturer" 
  | "vehicleCompatibility" 
  | "location" 
  | "quantity" 
  | "quantityReserved" 
  | "quantityAvailable" 
  | "onOrder" 
  | "reorderPoint" 
  | "cost" 
  | "unitPrice" 
  | "marginMarkup" 
  | "totalValue" 
  | "warrantyPeriod" 
  | "status" 
  | "supplier" 
  | "dateBought" 
  | "dateLast" 
  | "notes" 
  | "coreCharge"
  | "serialNumbers";

export interface Column {
  id: ColumnId;
  label: string;
  visible: boolean;
}

export interface SortableColumnHeaderProps {
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  isDragging: boolean;
  onDragStart: (event: any) => void;
  onDragEnd: (event: any) => void;
  onDragCancel: () => void;
  activeId: UniqueIdentifier | null;
}

export function SortableColumnHeader({
  columns,
  setColumns,
  isDragging,
  onDragStart,
  onDragEnd,
  onDragCancel,
  activeId,
}: SortableColumnHeaderProps) {
  const visibleColumns = columns.filter((col) => col.visible);

  const toggleColumnVisibility = (columnId: ColumnId) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  return (
    <>
      {visibleColumns.map((column) => (
        <DraggableColumnHeader
          key={column.id}
          id={column.id}
          label={column.label}
          onDragStart={onDragStart}
        />
      ))}
      <TableHead className="w-[100px]">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open column menu</span>
              <GripVertical className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[200px] p-0">
            <div className="p-2">
              <p className="font-medium text-sm">Toggle Columns</p>
            </div>
            <div className="max-h-[400px] overflow-auto">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className="relative flex items-center py-2 px-3 cursor-pointer hover:bg-slate-100"
                  onClick={() => toggleColumnVisibility(column.id)}
                >
                  <Checkbox
                    id={`column-${column.id}`}
                    checked={column.visible}
                    onCheckedChange={() => toggleColumnVisibility(column.id)}
                  />
                  <label
                    htmlFor={`column-${column.id}`}
                    className="ml-2 text-sm font-normal cursor-pointer"
                  >
                    {column.label}
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </TableHead>

      {isDragging && (
        <DragOverlay>
          {activeId ? <DragLayerHeader id={activeId as string} /> : null}
        </DragOverlay>
      )}
    </>
  );
}

function DraggableColumnHeader({
  id,
  label,
  onDragStart,
}: {
  id: ColumnId;
  label: string;
  onDragStart: (event: any) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onPointerDown={(e) => {
        listeners.onPointerDown(e);
        onDragStart(e);
      }}
      className="select-none cursor-grab active:cursor-grabbing"
    >
      {label}
    </TableHead>
  );
}

function DragLayerHeader({ id }: { id: string }) {
  const columnLabel = id;
  return (
    <div className="px-4 py-2 bg-white border rounded shadow-md opacity-80">
      {columnLabel}
    </div>
  );
}

interface DroppableColumnHeaderProps {
  id: string;
  children: React.ReactNode;
}

export function DroppableColumnHeader({
  id,
  children,
}: DroppableColumnHeaderProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <TableHead
      ref={setNodeRef}
      className={isOver ? "bg-slate-100" : undefined}
    >
      {children}
    </TableHead>
  );
}
