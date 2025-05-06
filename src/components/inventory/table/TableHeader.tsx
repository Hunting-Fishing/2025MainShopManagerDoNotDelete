
import React from "react";
import { TableHead, TableHeader as UITableHeader, TableRow } from "@/components/ui/table";
import { Column, SortableColumnHeader } from "./SortableColumnHeader";
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';

interface TableHeaderProps {
  columns: Column[];
}

export const TableHeader = ({ columns }: TableHeaderProps) => {
  const visibleColumns = columns.filter(col => col.visible);
  
  return (
    <SortableContext items={visibleColumns.map(col => col.id)} strategy={horizontalListSortingStrategy}>
      <UITableHeader>
        <TableRow>
          {visibleColumns.map((column) => (
            <SortableColumnHeader key={column.id} column={column} />
          ))}
          <TableHead className="w-[80px]">Actions</TableHead>
        </TableRow>
      </UITableHeader>
    </SortableContext>
  );
};
