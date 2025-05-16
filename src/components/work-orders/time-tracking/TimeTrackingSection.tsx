
import React, { useState, useEffect } from "react";
import { TimeEntry } from "@/types/workOrder";
import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";
import { TimeEntryTable } from "./TimeEntryTable";
import { TimeEntryDialog } from "./TimeEntryDialog";
import { ActiveTimerBanner } from "./components/ActiveTimerBanner";

interface TimeTrackingSectionProps {
  workOrderId: string;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
}

export const TimeTrackingSection: React.FC<TimeTrackingSectionProps> = ({
  workOrderId,
  timeEntries,
  onUpdateTimeEntries,
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [currentDuration, setCurrentDuration] = useState(0);

  // Find any active timer (entries with start time but no end time)
  useEffect(() => {
    const active = timeEntries.find(
      (entry) => entry.start_time && !entry.end_time
    );
    setActiveTimer(active || null);
  }, [timeEntries]);

  // Update current duration for active timer
  useEffect(() => {
    if (!activeTimer) return;

    const updateDuration = () => {
      const start = new Date(activeTimer.start_time).getTime();
      const now = new Date().getTime();
      const duration = Math.floor((now - start) / (1000 * 60)); // in minutes
      setCurrentDuration(duration);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [activeTimer]);

  const handleOpenAddDialog = () => {
    setSelectedEntry(null);
    setShowAddDialog(true);
  };

  const handleOpenEditDialog = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setShowEditDialog(true);
  };

  const handleStartTimer = () => {
    const newEntry: Partial<TimeEntry> = {
      work_order_id: workOrderId,
      employee_id: "current-user", // Should come from auth context
      employee_name: "Current User", // Should come from auth context
      start_time: new Date().toISOString(),
      billable: true,
    };

    const updatedEntries = [...timeEntries, newEntry as TimeEntry];
    onUpdateTimeEntries(updatedEntries);
  };

  const handleStopTimer = () => {
    if (!activeTimer) return;

    const updatedEntries = timeEntries.map((entry) => {
      if (entry.id === activeTimer.id) {
        return {
          ...entry,
          end_time: new Date().toISOString(),
          duration: currentDuration,
        };
      }
      return entry;
    });

    onUpdateTimeEntries(updatedEntries);
    setActiveTimer(null);
  };

  const handleSaveEntry = (entryData: Partial<TimeEntry>) => {
    let updatedEntries;

    if (selectedEntry) {
      // Edit existing entry
      updatedEntries = timeEntries.map((entry) => {
        if (entry.id === selectedEntry.id) {
          return {
            ...entry,
            ...entryData,
          };
        }
        return entry;
      });
    } else {
      // Add new entry
      const newEntry = {
        id: `te-${Date.now()}`, // Use a proper ID generation method in production
        work_order_id: workOrderId,
        ...entryData,
      };
      updatedEntries = [...timeEntries, newEntry as TimeEntry];
    }

    onUpdateTimeEntries(updatedEntries);
    setShowAddDialog(false);
    setShowEditDialog(false);
  };

  const handleDeleteEntry = (entry: TimeEntry) => {
    const updatedEntries = timeEntries.filter((e) => e.id !== entry.id);
    onUpdateTimeEntries(updatedEntries);
  };

  const totalBillableMinutes = timeEntries
    .filter((entry) => entry.billable && entry.duration)
    .reduce((total, entry) => total + (entry.duration || 0), 0);

  return (
    <div className="space-y-6">
      {activeTimer && (
        <ActiveTimerBanner
          timer={activeTimer}
          onStopTimer={handleStopTimer}
          currentDuration={currentDuration}
        />
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Time Entries</h3>
        <div className="flex space-x-2">
          {!activeTimer && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartTimer}
              className="flex items-center"
            >
              <Clock className="h-4 w-4 mr-1" />
              Start Timer
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleOpenAddDialog}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Entry
          </Button>
        </div>
      </div>

      <TimeEntryTable
        entries={timeEntries}
        onEdit={handleOpenEditDialog}
        onDelete={handleDeleteEntry}
      />

      <div className="flex justify-end">
        <div className="bg-slate-50 p-4 rounded-md">
          <span className="text-sm text-slate-500">Total Billable Time: </span>
          <span className="font-medium">
            {Math.floor(totalBillableMinutes / 60)}h {totalBillableMinutes % 60}m
          </span>
        </div>
      </div>

      {/* Add Entry Dialog */}
      <TimeEntryDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSave={handleSaveEntry}
        workOrderId={workOrderId}
      />

      {/* Edit Entry Dialog */}
      {selectedEntry && (
        <TimeEntryDialog
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSave={handleSaveEntry}
          entry={selectedEntry}
          workOrderId={workOrderId}
        />
      )}
    </div>
  );
};
