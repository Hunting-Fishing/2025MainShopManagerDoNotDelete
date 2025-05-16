
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TimeEntry } from "@/types/workOrder";
import { TimeEntriesList } from "./TimeEntriesList";
import { TimeEntryDialog } from "./TimeEntryDialog";

export interface TimeTrackingSectionProps {
  work_order_id: string;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (updatedEntries: TimeEntry[]) => void;
}

export function TimeTrackingSection({ 
  work_order_id, 
  timeEntries, 
  onUpdateTimeEntries 
}: TimeTrackingSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  
  const handleAdd = () => {
    setEditingEntry(null);
    setShowAddDialog(true);
  };
  
  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setShowAddDialog(true);
  };
  
  const handleDelete = (entryId: string) => {
    const updatedEntries = timeEntries.filter(entry => entry.id !== entryId);
    onUpdateTimeEntries(updatedEntries);
  };
  
  const handleSave = (entry: TimeEntry) => {
    let updatedEntries;
    
    if (editingEntry) {
      // Update existing entry
      updatedEntries = timeEntries.map(item => 
        item.id === entry.id ? entry : item
      );
    } else {
      // Add new entry with generated ID if needed
      const newEntry = {
        ...entry,
        id: entry.id || crypto.randomUUID(),
        work_order_id
      };
      updatedEntries = [...timeEntries, newEntry];
    }
    
    onUpdateTimeEntries(updatedEntries);
    setShowAddDialog(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Time Tracking</h2>
        <Button onClick={handleAdd} size="sm" className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add Time Entry
        </Button>
      </div>
      
      <TimeEntriesList 
        entries={timeEntries} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
      
      <TimeEntryDialog 
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        workOrderId={work_order_id}
        timeEntry={editingEntry}
        onSave={handleSave}
      />
    </div>
  );
}
