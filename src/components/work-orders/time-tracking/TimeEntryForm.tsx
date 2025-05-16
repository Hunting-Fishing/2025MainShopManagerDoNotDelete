
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { TimeEntry } from "@/types/workOrder";

interface TimeEntryFormProps {
  formData: Partial<TimeEntry>;
  errors: Record<string, string>;
  handleChange: (field: keyof TimeEntry, value: any) => void;
  calculateDuration: () => void;
  handleSubmit: () => void;
  handleCancel: () => void;
  isEditing: boolean;
}

export const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
  formData,
  errors,
  handleChange,
  calculateDuration,
  handleSubmit,
  handleCancel,
  isEditing
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="employee_name">Employee Name</Label>
          <Input
            id="employee_name"
            value={formData.employee_name || ''}
            onChange={(e) => handleChange('employee_name', e.target.value)}
            placeholder="Enter employee name"
          />
          {errors.employee_name && <p className="text-sm text-red-500">{errors.employee_name}</p>}
        </div>

        <div>
          <Label htmlFor="start_time">Start Time</Label>
          <Input
            id="start_time"
            type="datetime-local"
            value={formData.start_time || ''}
            onChange={(e) => {
              handleChange('start_time', e.target.value);
              calculateDuration();
            }}
          />
          {errors.start_time && <p className="text-sm text-red-500">{errors.start_time}</p>}
        </div>

        <div>
          <Label htmlFor="end_time">End Time</Label>
          <Input
            id="end_time"
            type="datetime-local"
            value={formData.end_time || ''}
            onChange={(e) => {
              handleChange('end_time', e.target.value);
              calculateDuration();
            }}
          />
          {errors.end_time && <p className="text-sm text-red-500">{errors.end_time}</p>}
        </div>

        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min="0"
            value={formData.duration?.toString() || '0'}
            onChange={(e) => handleChange('duration', parseInt(e.target.value, 10))}
          />
          {errors.duration && <p className="text-sm text-red-500">{errors.duration}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="billable"
          checked={formData.billable !== undefined ? formData.billable : true}
          onCheckedChange={(checked) => handleChange('billable', !!checked)}
        />
        <Label htmlFor="billable">Billable Time</Label>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Add any additional notes about this time entry"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {isEditing ? 'Update' : 'Add'} Time Entry
        </Button>
      </div>
    </div>
  );
};
