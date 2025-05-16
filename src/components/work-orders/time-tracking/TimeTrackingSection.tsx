import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TimeEntry } from "@/types/workOrder";
import { TimeEntryForm } from "./TimeEntryForm";
import { TimeEntriesList } from "./TimeEntriesList";
import { toast } from "@/hooks/use-toast";

// Import our new components
import { TimeTrackingHeader } from "./components/TimeTrackingHeader";
import { ActiveTimerBanner } from "./components/ActiveTimerBanner";
import { TimeTrackingSummary } from "./components/TimeTrackingSummary";
import { EmptyTimeEntries } from "./components/EmptyTimeEntries";

interface TimeTrackingSectionProps {
  workOrderId: string;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
}

export function TimeTrackingSection({ 
  workOrderId, 
  timeEntries = [], 
  onUpdateTimeEntries 
}: TimeTrackingSectionProps) {
  const [showTimeEntryForm, setShowTimeEntryForm] = useState(false);
  const [editingTimeEntry, setEditingTimeEntry] = useState<TimeEntry | null>(null);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);

  // Calculate total time
  const totalBillableTime = timeEntries.reduce((total, entry) => {
    return entry.billable ? total + entry.duration : total;
  }, 0);

  const totalNonBillableTime = timeEntries.reduce((total, entry) => {
    return !entry.billable ? total + entry.duration : total;
  }, 0);

  // Handle adding a new time entry
  const handleAddTimeEntry = (entry: TimeEntry) => {
    const newEntries = [...timeEntries, entry];
    onUpdateTimeEntries(newEntries);
    setShowTimeEntryForm(false);
    
    toast({
      title: "Time Entry Added",
      description: "Time entry has been added successfully.",
    });
  };

  // Handle editing a time entry
  const handleEditTimeEntry = (entry: TimeEntry) => {
    setEditingTimeEntry(entry);
    setShowTimeEntryForm(true);
  };

  // Handle updating a time entry
  const handleUpdateTimeEntry = (updatedEntry: TimeEntry) => {
    const newEntries = timeEntries.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    onUpdateTimeEntries(newEntries);
    setShowTimeEntryForm(false);
    setEditingTimeEntry(null);
    
    toast({
      title: "Time Entry Updated",
      description: "Time entry has been updated successfully.",
    });
  };

  // Handle deleting a time entry
  const handleDeleteTimeEntry = (entryId: string) => {
    const newEntries = timeEntries.filter(entry => entry.id !== entryId);
    onUpdateTimeEntries(newEntries);
    
    toast({
      title: "Time Entry Deleted",
      description: "Time entry has been deleted successfully.",
    });
  };

  // Handle starting a timer
  const handleStartTimer = (employeeId: string, employeeName: string) => {
    // Create a new time entry with start time but no end time
    const newTimer: TimeEntry = {
      id: `TE-${Date.now()}`,
      employeeId,
      employeeName,
      startTime: new Date().toISOString(),
      endTime: undefined,
      duration: 0,
      billable: true
    };
    
    setActiveTimer(newTimer);
    
    toast({
      title: "Timer Started",
      description: "Time tracking has been started.",
    });
  };

  // Handle stopping a timer
  const handleStopTimer = () => {
    if (!activeTimer) return;
    
    const endTime = new Date();
    const startTime = new Date(activeTimer.startTime);
    
    // Calculate duration in minutes
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));
    
    const completedEntry: TimeEntry = {
      ...activeTimer,
      endTime: endTime.toISOString(),
      duration: durationMinutes
    };
    
    const newEntries = [...timeEntries, completedEntry];
    onUpdateTimeEntries(newEntries);
    setActiveTimer(null);
    
    toast({
      title: "Timer Stopped",
      description: `Recorded ${durationMinutes} minutes of time.`,
    });
  };

  return (
    <Card className="mt-6">
      <TimeTrackingHeader
        activeTimer={activeTimer}
        onStartTimer={handleStartTimer}
        onStopTimer={handleStopTimer}
        onAddTimeEntry={() => {
          setEditingTimeEntry(null);
          setShowTimeEntryForm(true);
        }}
      />
      
      <CardContent className="p-6">
        {showTimeEntryForm ? (
          <TimeEntryForm 
            workOrderId={workOrderId}
            timeEntry={editingTimeEntry}
            onSave={editingTimeEntry ? handleUpdateTimeEntry : handleAddTimeEntry}
            onCancel={() => {
              setShowTimeEntryForm(false);
              setEditingTimeEntry(null);
            }}
          />
        ) : (
          <>
            {activeTimer && (
              <ActiveTimerBanner
                activeTimer={activeTimer}
                onStopTimer={handleStopTimer}
              />
            )}
            
            <TimeTrackingSummary
              totalBillableTime={totalBillableTime}
              totalNonBillableTime={totalNonBillableTime}
            />
            
            {timeEntries.length === 0 ? (
              <EmptyTimeEntries />
            ) : (
              <TimeEntriesList 
                timeEntries={timeEntries}
                onEdit={handleEditTimeEntry}
                onDelete={handleDeleteTimeEntry}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
