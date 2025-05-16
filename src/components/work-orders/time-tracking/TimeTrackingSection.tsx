
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TimeEntry } from "@/types/workOrder";
import { TimeTrackingSummary } from "./components/TimeTrackingSummary";
import { ActiveTimerBanner } from "./components/ActiveTimerBanner";
import { TimeEntryDialog } from "./TimeEntryDialog";
import { TimeEntryList } from "./TimeEntryList";

export interface TimeTrackingSectionProps {
  workOrderId: string;
  timeEntries?: TimeEntry[];
  onUpdateTimeEntries?: (updatedEntries: TimeEntry[]) => void;
}

export function TimeTrackingSection({
  workOrderId,
  timeEntries = [],
  onUpdateTimeEntries
}: TimeTrackingSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  
  const totalBillableTime = timeEntries
    .filter(entry => entry.billable)
    .reduce((total, entry) => total + entry.duration, 0);
    
  const totalNonBillableTime = timeEntries
    .filter(entry => !entry.billable)
    .reduce((total, entry) => total + entry.duration, 0);
  
  const handleAddEntry = (entry: TimeEntry) => {
    if (!onUpdateTimeEntries) return;
    onUpdateTimeEntries([...timeEntries, entry]);
    setShowAddDialog(false);
  };
  
  const handleUpdateEntry = (updatedEntry: TimeEntry) => {
    if (!onUpdateTimeEntries) return;
    const updatedEntries = timeEntries.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    onUpdateTimeEntries(updatedEntries);
    setEditingEntry(null);
  };
  
  const handleDeleteEntry = (entryId: string) => {
    if (!onUpdateTimeEntries) return;
    onUpdateTimeEntries(timeEntries.filter(entry => entry.id !== entryId));
  };
  
  const handleStartTimer = (employeeId: string, employeeName: string) => {
    const newTimer: TimeEntry = {
      id: crypto.randomUUID(),
      employee_id: employeeId,
      employeeId: employeeId,
      employeeName: employeeName,
      startTime: new Date().toISOString(),
      duration: 0,
      billable: true
    };
    
    setActiveTimer(newTimer);
  };
  
  const handleStopTimer = () => {
    if (!activeTimer || !onUpdateTimeEntries) return;
    
    const endTime = new Date().toISOString();
    const duration = Math.round(
      (new Date(endTime).getTime() - new Date(activeTimer.startTime).getTime()) / 60000
    );
    
    const completedEntry: TimeEntry = {
      ...activeTimer,
      endTime,
      duration
    };
    
    onUpdateTimeEntries([...timeEntries, completedEntry]);
    setActiveTimer(null);
  };

  return (
    <div className="space-y-4">
      {activeTimer && (
        <ActiveTimerBanner
          activeTimer={activeTimer}
          onStopTimer={handleStopTimer}
        />
      )}
      
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Time Entries</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddDialog(true)}
          disabled={!!activeTimer}
        >
          <PlusCircle className="mr-1 h-4 w-4" />
          Add Time Entry
        </Button>
      </div>
      
      {(totalBillableTime > 0 || totalNonBillableTime > 0) && (
        <TimeTrackingSummary
          totalBillableTime={totalBillableTime}
          totalNonBillableTime={totalNonBillableTime}
        />
      )}
      
      <TimeEntryList
        entries={timeEntries}
        onEdit={setEditingEntry}
        onDelete={handleDeleteEntry}
      />

      <TimeEntryDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSave={handleAddEntry}
        workOrderId={workOrderId}
      />
      
      {editingEntry && (
        <TimeEntryDialog
          isOpen={!!editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={handleUpdateEntry}
          workOrderId={workOrderId}
          initialEntry={editingEntry}
        />
      )}
    </div>
  );
}
