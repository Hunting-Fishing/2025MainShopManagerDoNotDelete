
import React, { useState } from "react";
import { TableHead, TableHeader as UITableHeader, TableRow } from "@/components/ui/table";
import { Column, SortableColumnHeader, ColumnId } from "./SortableColumnHeader";
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface TableHeaderProps {
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
}

export const TableHeader = ({ columns, setColumns }: TableHeaderProps) => {
  const visibleColumns = columns.filter(col => col.visible);
  const [showAddColumnDialog, setShowAddColumnDialog] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<ColumnId | "">("");
  
  const availableColumns = columns.filter(col => !col.visible);
  
  const handleHideColumn = (columnId: ColumnId) => {
    setColumns(prev => 
      prev.map(col => 
        col.id === columnId ? { ...col, visible: false } : col
      )
    );
  };
  
  const handleAddColumn = () => {
    setShowAddColumnDialog(true);
  };
  
  const handleSaveNewColumn = () => {
    if (selectedColumnId) {
      setColumns(prev => 
        prev.map(col => 
          col.id === selectedColumnId ? { ...col, visible: true } : col
        )
      );
      setSelectedColumnId("");
      setShowAddColumnDialog(false);
    }
  };
  
  return (
    <>
      <SortableContext items={visibleColumns.map(col => col.id)} strategy={horizontalListSortingStrategy}>
        <UITableHeader>
          <TableRow>
            {visibleColumns.map((column) => (
              <SortableColumnHeader 
                key={column.id} 
                column={column} 
                onHideColumn={handleHideColumn}
                onAddColumn={availableColumns.length > 0 ? handleAddColumn : undefined}
              />
            ))}
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </UITableHeader>
      </SortableContext>
      
      <Dialog open={showAddColumnDialog} onOpenChange={setShowAddColumnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="columnSelect">Select a column to add</Label>
              <Select 
                value={selectedColumnId} 
                onValueChange={(value) => setSelectedColumnId(value as ColumnId)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map(col => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddColumnDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewColumn} disabled={!selectedColumnId}>
              Add Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
