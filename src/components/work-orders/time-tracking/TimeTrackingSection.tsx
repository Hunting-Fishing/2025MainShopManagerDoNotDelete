
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TimeEntry } from "@/types/workOrder";
import { TimeEntryForm } from "./TimeEntryForm";
import { useTimeEntryForm } from "./hooks/useTimeEntryForm";
import { TimeEntryTable } from "./TimeEntryTable";

export interface TimeTrackingSectionProps {
  workOrderId: string;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
}

export const TimeTrackingSection: React.FC<TimeTrackingSectionProps> = ({
  workOrderId,
  timeEntries,
  onUpdateTimeEntries,
}) => {
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const editingEntry = editingEntryId
    ? timeEntries.find(entry => entry.id === editingEntryId)
    : null;

  const formProps = useTimeEntryForm({
    workOrderId,
    timeEntry: editingEntry,
    onSave: handleSaveTimeEntry,
    onCancel: handleCancelEdit
  });

  function handleAddNewEntry() {
    setIsAddingEntry(true);
    setEditingEntryId(null);
  }

  function handleEditEntry(entryId: string) {
    setEditingEntryId(entryId);
    setIsAddingEntry(false);
  }

  function handleSaveTimeEntry(timeEntry: TimeEntry) {
    let updatedEntries: TimeEntry[];

    if (editingEntryId) {
      // Updating existing entry
      updatedEntries = timeEntries.map((entry) =>
        entry.id === editingEntryId ? timeEntry : entry
      );
    } else {
      // Adding new entry
      updatedEntries = [...timeEntries, timeEntry];
    }

    onUpdateTimeEntries(updatedEntries);
    setIsAddingEntry(false);
    setEditingEntryId(null);
  }

  function handleDeleteEntry(entryId: string) {
    const updatedEntries = timeEntries.filter((entry) => entry.id !== entryId);
    onUpdateTimeEntries(updatedEntries);
    
    if (editingEntryId === entryId) {
      setEditingEntryId(null);
      setIsAddingEntry(false);
    }
  }

  function handleCancelEdit() {
    setIsAddingEntry(false);
    setEditingEntryId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Time Tracking</h3>
        <Button onClick={handleAddNewEntry} disabled={isAddingEntry || !!editingEntryId}>
          <Plus className="h-4 w-4 mr-2" />
          Add Time Entry
        </Button>
      </div>

      {(isAddingEntry || editingEntryId) && (
        <div className="border p-4 rounded-md bg-muted/50">
          <h4 className="text-sm font-medium mb-4">
            {editingEntryId ? "Edit Time Entry" : "New Time Entry"}
          </h4>
          <TimeEntryForm {...formProps} />
        </div>
      )}

      <TimeEntryTable 
        entries={timeEntries} 
        onEdit={handleEditEntry} 
        onDelete={handleDeleteEntry} 
      />
    </div>
  );
}
