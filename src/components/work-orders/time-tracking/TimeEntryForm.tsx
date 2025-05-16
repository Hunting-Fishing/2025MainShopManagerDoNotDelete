import React, { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface TimeEntryFormProps {
  values: {
    employeeId: string;
    employeeName: string;
    startTime: string;
    endTime: string;
    duration: number;
    billable: boolean;
    notes: string;
  };
  error: string;
  handleChange: (e: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSave: () => void;
  onCancel: () => void;
}

export const TimeEntryForm: React.FC<TimeEntryFormProps> = (props) => {
  const { 
    values,
    error,
    handleChange,
    handleSave,
    onCancel
  } = props;
  
  // Use the values directly from props
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSave();
    }} className="space-y-4">
      <div>
        <Label htmlFor="employeeId">Employee</Label>
        <Input
          type="text"
          id="employeeName"
          name="employeeName"
          value={values.employeeName}
          onChange={handleChange}
          placeholder="Employee Name"
        />
      </div>
      <div>
        <Label htmlFor="startTime">Start Time</Label>
        <Input
          type="datetime-local"
          id="startTime"
          name="startTime"
          value={values.startTime}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="endTime">End Time</Label>
        <Input
          type="datetime-local"
          id="endTime"
          name="endTime"
          value={values.endTime}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          type="number"
          id="duration"
          name="duration"
          value={values.duration}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="billable">Billable</Label>
        <input
          type="checkbox"
          id="billable"
          name="billable"
          checked={values.billable}
          onChange={handleChange as any}
        />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={values.notes}
          onChange={handleChange}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};
