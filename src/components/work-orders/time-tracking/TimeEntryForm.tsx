
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TimeEntry } from "@/types/workOrder";
import { v4 as uuidv4 } from "uuid";

interface TimeEntryFormProps {
  workOrderId: string;
  timeEntry?: TimeEntry | null;
  onSave: (timeEntry: TimeEntry) => void;
  onCancel: () => void;
}

export function TimeEntryForm({ 
  workOrderId, 
  timeEntry, 
  onSave, 
  onCancel 
}: TimeEntryFormProps) {
  const [employee, setEmployee] = useState<string>(timeEntry?.employeeName || "");
  const [startDate, setStartDate] = useState<string>(
    timeEntry?.startTime 
      ? new Date(timeEntry.startTime).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>(
    timeEntry?.startTime 
      ? new Date(timeEntry.startTime).toTimeString().slice(0, 5) 
      : new Date().toTimeString().slice(0, 5)
  );
  const [endDate, setEndDate] = useState<string>(
    timeEntry?.endTime 
      ? new Date(timeEntry.endTime).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [endTime, setEndTime] = useState<string>(
    timeEntry?.endTime 
      ? new Date(timeEntry.endTime).toTimeString().slice(0, 5) 
      : new Date().toTimeString().slice(0, 5)
  );
  const [duration, setDuration] = useState<string>(
    timeEntry?.duration ? (timeEntry.duration / 60).toString() : ""
  );
  const [notes, setNotes] = useState<string>(timeEntry?.notes || "");
  const [billable, setBillable] = useState<boolean>(timeEntry?.billable ?? true);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!employee) {
      alert("Employee name is required");
      return;
    }
    
    // Combine date and time
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    // Calculate duration in minutes if not manually entered
    let durationInMinutes = parseFloat(duration) * 60;
    if (!durationInMinutes || isNaN(durationInMinutes)) {
      const diffMs = endDateTime.getTime() - startDateTime.getTime();
      durationInMinutes = Math.round(diffMs / (1000 * 60));
    }
    
    if (durationInMinutes <= 0) {
      alert("Duration must be greater than zero");
      return;
    }
    
    const updatedEntry: TimeEntry = {
      id: timeEntry?.id || `TE-${uuidv4().substring(0, 8)}`,
      employeeId: timeEntry?.employeeId || `EMP-${uuidv4().substring(0, 8)}`,
      employeeName: employee,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      duration: durationInMinutes,
      notes: notes,
      billable: billable
    };
    
    onSave(updatedEntry);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="employee">Employee</Label>
          <Input 
            id="employee"
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            placeholder="Employee Name"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input 
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input 
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input 
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input 
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="duration">Duration (hours)</Label>
            <Input 
              id="duration"
              type="number"
              step="0.25"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Auto-calculated if empty"
            />
            <p className="text-xs text-slate-500 mt-1">
              Override automatic calculation (optional)
            </p>
          </div>
          <div className="flex items-center justify-start h-full pt-7">
            <div className="flex items-center space-x-2">
              <Switch 
                id="billable" 
                checked={billable} 
                onCheckedChange={setBillable} 
              />
              <Label htmlFor="billable">Billable Time</Label>
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea 
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Work performed, issues encountered, etc."
            className="h-24"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {timeEntry ? "Update Entry" : "Save Entry"}
        </Button>
      </div>
    </form>
  );
}
