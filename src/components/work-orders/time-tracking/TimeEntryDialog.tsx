
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { TimeEntry } from "@/types/workOrder";

interface TimeEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: TimeEntry) => void;
  workOrderId: string;
  initialEntry?: TimeEntry;
}

export function TimeEntryDialog({
  isOpen,
  onClose,
  onSave,
  workOrderId,
  initialEntry
}: TimeEntryDialogProps) {
  const isEditing = !!initialEntry;
  
  const [employeeName, setEmployeeName] = useState(initialEntry?.employeeName || "");
  const [date, setDate] = useState<Date>(
    initialEntry?.startTime ? new Date(initialEntry.startTime) : new Date()
  );
  const [startTime, setStartTime] = useState(
    initialEntry?.startTime ? new Date(initialEntry.startTime).toTimeString().slice(0, 5) : ""
  );
  const [endTime, setEndTime] = useState(
    initialEntry?.endTime ? new Date(initialEntry.endTime).toTimeString().slice(0, 5) : ""
  );
  const [duration, setDuration] = useState(initialEntry?.duration || 0);
  const [billable, setBillable] = useState(initialEntry?.billable !== false);
  const [notes, setNotes] = useState(initialEntry?.notes || "");

  // Reset form when initialEntry changes or dialog is opened/closed
  useEffect(() => {
    if (initialEntry) {
      setEmployeeName(initialEntry.employeeName);
      setDate(new Date(initialEntry.startTime));
      setStartTime(new Date(initialEntry.startTime).toTimeString().slice(0, 5));
      setEndTime(initialEntry.endTime ? new Date(initialEntry.endTime).toTimeString().slice(0, 5) : "");
      setDuration(initialEntry.duration);
      setBillable(initialEntry.billable !== false);
      setNotes(initialEntry.notes || "");
    } else if (!isOpen) {
      resetForm();
    }
  }, [initialEntry, isOpen]);

  const resetForm = () => {
    setEmployeeName("");
    setDate(new Date());
    setStartTime("");
    setEndTime("");
    setDuration(0);
    setBillable(true);
    setNotes("");
  };

  const handleSave = () => {
    // Create date strings for start and end times
    const startDate = new Date(date);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    startDate.setHours(startHour, startMinute);
    
    let endDate: Date | undefined;
    if (endTime) {
      endDate = new Date(date);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      endDate.setHours(endHour, endMinute);
    }

    // Format as ISO strings
    const startISOString = startDate.toISOString();
    const endISOString = endDate?.toISOString();

    const entry: TimeEntry = {
      id: initialEntry?.id || crypto.randomUUID(),
      employee_id: initialEntry?.employee_id || crypto.randomUUID(),
      employeeId: initialEntry?.employeeId || crypto.randomUUID(),
      employeeName,
      startTime: startISOString,
      endTime: endISOString,
      duration,
      notes,
      billable
    };
    
    onSave(entry);
    resetForm();
  };

  // Calculate duration when start and end times change
  useEffect(() => {
    if (startTime && endTime) {
      const start = startTime.split(':').map(Number);
      const end = endTime.split(':').map(Number);
      
      // Convert to minutes since midnight
      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];
      
      // Calculate duration (handle cases where end time is on the next day)
      let durationMinutes = endMinutes - startMinutes;
      if (durationMinutes < 0) {
        durationMinutes += 24 * 60; // Add a full day in minutes
      }
      
      setDuration(durationMinutes);
    }
  }, [startTime, endTime]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Time Entry" : "Add Time Entry"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="employee">Employee</Label>
              <Input
                id="employee"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Enter employee name"
              />
            </div>
            
            <div>
              <Label>Date</Label>
              <DatePicker 
                date={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="billable"
                checked={billable}
                onCheckedChange={setBillable}
              />
              <Label htmlFor="billable">Billable</Label>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this time entry"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isEditing ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
