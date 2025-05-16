
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TimeEntry } from "@/types/workOrder";
import { calculateTotalTime, calculateBillableTime, formatTimeInHoursAndMinutes } from "@/utils/workOrderUtils";
import { TimeEntryTable } from "./TimeEntryTable";
import { TimeEntryDialog } from "./TimeEntryDialog";

export interface TimeTrackingSectionProps {
  workOrderId: string;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
}

export function TimeTrackingSection({ 
  workOrderId,
  timeEntries, 
  onUpdateTimeEntries 
}: TimeTrackingSectionProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | undefined>(undefined);

  // Total time calculations
  const totalTime = calculateTotalTime(timeEntries);
  const totalBillableTime = calculateBillableTime(timeEntries);
  
  // Open dialog to add a new time entry
  const handleAddEntry = () => {
    setCurrentEntry(undefined);
    setShowDialog(true);
  };
  
  // Open dialog to edit an existing time entry
  const handleEditEntry = (entry: TimeEntry) => {
    setCurrentEntry(entry);
    setShowDialog(true);
  };
  
  // Delete a time entry
  const handleDeleteEntry = (entryId: string) => {
    const updatedEntries = timeEntries.filter(entry => entry.id !== entryId);
    onUpdateTimeEntries(updatedEntries);
  };
  
  // Save a new or edited time entry
  const handleSaveEntry = (entryData: Partial<TimeEntry>) => {
    if (currentEntry) {
      // Editing existing entry
      const updatedEntries = timeEntries.map(entry => 
        entry.id === currentEntry.id ? { ...entry, ...entryData } : entry
      );
      onUpdateTimeEntries(updatedEntries);
    } else {
      // Adding new entry
      const newEntry: TimeEntry = {
        id: crypto.randomUUID(),
        work_order_id: workOrderId,
        ...entryData as Omit<TimeEntry, 'id' | 'work_order_id'>
      };
      onUpdateTimeEntries([...timeEntries, newEntry]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Time Tracking</h3>
          <div className="text-sm text-muted-foreground">
            <span className="mr-4">
              Total time: {formatTimeInHoursAndMinutes(totalTime)}
            </span>
            <span>
              Billable time: {formatTimeInHoursAndMinutes(totalBillableTime)}
            </span>
          </div>
        </div>
        <Button
          onClick={handleAddEntry}
          variant="outline"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Time
        </Button>
      </div>

      {timeEntries.length > 0 ? (
        <TimeEntryTable
          entries={timeEntries}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
        />
      ) : (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground">No time entries recorded for this work order.</p>
        </div>
      )}
      
      <TimeEntryDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSave={handleSaveEntry}
        entry={currentEntry}
        workOrderId={workOrderId}
      />
    </div>
  );
}
