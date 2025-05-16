
import React, { useState } from "react";
import { TimeEntry } from "@/types/workOrder";
import { TimeEntriesList } from "./TimeEntriesList";
import { TimeEntryForm } from "./TimeEntryForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TimeTrackingSectionProps {
  workOrder_id: string; // Changed from workOrder to workOrder_id
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (updatedEntries: TimeEntry[]) => void;
}

export function TimeTrackingSection({ 
  workOrder_id, 
  timeEntries, 
  onUpdateTimeEntries 
}: TimeTrackingSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  const handleAddEntry = () => {
    setEditingEntry(null);
    setShowAddForm(true);
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setShowAddForm(true);
  };

  const handleDeleteEntry = (entryId: string) => {
    // Filter out the deleted entry
    const updatedEntries = timeEntries.filter(entry => entry.id !== entryId);
    onUpdateTimeEntries(updatedEntries);
  };

  const handleSaveEntry = (entry: TimeEntry) => {
    let updatedEntries: TimeEntry[];
    
    if (editingEntry) {
      // Update existing entry
      updatedEntries = timeEntries.map(e => 
        e.id === entry.id ? entry : e
      );
    } else {
      // Add new entry
      updatedEntries = [...timeEntries, entry];
    }
    
    onUpdateTimeEntries(updatedEntries);
    setShowAddForm(false);
    setEditingEntry(null);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingEntry(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Time Tracking</h2>
        <Button 
          onClick={handleAddEntry} 
          size="sm" 
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Time Entry
        </Button>
      </div>

      {showAddForm ? (
        <TimeEntryForm
          workOrderId={workOrder_id}
          timeEntry={editingEntry}
          onSave={handleSaveEntry}
          onCancel={handleCancelForm}
        />
      ) : (
        <TimeEntriesList
          entries={timeEntries}
          onDelete={handleDeleteEntry}
          onEdit={handleEditEntry}
        />
      )}
    </div>
  );
}
