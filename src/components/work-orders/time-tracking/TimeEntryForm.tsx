
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TimeEntryFormActions } from "./components/TimeEntryFormActions";

interface TimeEntryFormValues {
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  duration: number;
  billable: boolean;
  notes: string;
}

interface TimeEntryFormProps {
  values: TimeEntryFormValues;
  error: string;
  handleChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSave: () => void;
  onCancel: () => void;
}

export function TimeEntryForm({
  values,
  error,
  handleChange,
  handleSave,
  onCancel
}: TimeEntryFormProps) {
  return (
    <div className="space-y-4 p-4 border rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="employeeName">Technician/Employee Name*</Label>
          <Input
            id="employeeName"
            name="employeeName"
            value={values.employeeName}
            onChange={handleChange}
            placeholder="Enter name"
            required
          />
        </div>
        <div>
          <Label htmlFor="employeeId">Employee ID</Label>
          <Input
            id="employeeId"
            name="employeeId"
            value={values.employeeId}
            onChange={handleChange}
            placeholder="Employee ID (optional)"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Start Time*</Label>
          <Input
            id="startTime"
            name="startTime"
            type="datetime-local"
            value={values.startTime}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            name="endTime"
            type="datetime-local"
            value={values.endTime}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="duration">Duration (minutes)*</Label>
        <Input
          id="duration"
          name="duration"
          type="number"
          value={values.duration}
          onChange={handleChange}
          required
          min={1}
        />
      </div>
      
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={values.notes}
          onChange={handleChange}
          placeholder="Add any relevant notes about the work performed"
          rows={3}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="billable"
          name="billable"
          checked={values.billable}
          onCheckedChange={(checked) => {
            const event = {
              target: {
                name: 'billable',
                value: checked === true
              }
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleChange(event);
          }}
        />
        <Label htmlFor="billable">Billable time</Label>
      </div>
      
      {error && (
        <p className="text-sm font-medium text-red-500">{error}</p>
      )}
      
      <TimeEntryFormActions 
        isEditing={!!values.employeeId}
        onCancel={onCancel}
      />
    </div>
  );
}
