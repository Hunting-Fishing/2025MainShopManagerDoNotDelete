
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, PlusCircle, Play, Pause, Edit, Trash2 } from "lucide-react";
import { TimeEntry } from "@/types/workOrder";
import { formatTimeInHoursAndMinutes } from "@/data/workOrdersData";
import { TimeEntryForm } from "./TimeEntryForm";
import { TimeEntriesList } from "./TimeEntriesList";
import { toast } from "@/hooks/use-toast";

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
      endTime: null,
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
      description: `Recorded ${formatTimeInHoursAndMinutes(durationMinutes)} of time.`,
    });
  };

  return (
    <Card className="mt-6">
      <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-slate-500" />
          <CardTitle className="text-lg">Time Tracking</CardTitle>
        </div>
        <div className="flex gap-2">
          {activeTimer ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-500" 
              onClick={handleStopTimer}
            >
              <Pause className="mr-1 h-4 w-4" />
              Stop Timer
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-green-500" 
              onClick={() => handleStartTimer("EMP-001", "Michael Brown")}
            >
              <Play className="mr-1 h-4 w-4" />
              Start Timer
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setEditingTimeEntry(null);
              setShowTimeEntryForm(true);
            }}
          >
            <PlusCircle className="mr-1 h-4 w-4" />
            Add Time Entry
          </Button>
        </div>
      </CardHeader>
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
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded flex justify-between items-center">
                <div>
                  <p className="font-medium">Timer Running</p>
                  <p className="text-sm text-slate-500">
                    Started: {new Date(activeTimer.startTime).toLocaleTimeString()}
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleStopTimer}
                >
                  <Pause className="mr-1 h-4 w-4" />
                  Stop
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-lg border">
                <p className="text-sm text-slate-500">Total Billable Time</p>
                <p className="text-2xl font-bold">{formatTimeInHoursAndMinutes(totalBillableTime)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border">
                <p className="text-sm text-slate-500">Total Non-Billable Time</p>
                <p className="text-2xl font-bold">{formatTimeInHoursAndMinutes(totalNonBillableTime)}</p>
              </div>
            </div>
            
            <TimeEntriesList 
              timeEntries={timeEntries}
              onEdit={handleEditTimeEntry}
              onDelete={handleDeleteTimeEntry}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
