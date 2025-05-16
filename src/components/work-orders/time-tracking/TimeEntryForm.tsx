
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TimeEntry } from "@/types/workOrder";

interface TimeEntryFormProps {
  initialData: Partial<TimeEntry>;
  onSubmit: (data: Partial<TimeEntry>) => void;
  onCancel: () => void;
}

export const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<TimeEntry>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof TimeEntry, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const calculateDuration = () => {
    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time);
      const end = new Date(formData.end_time);
      const durationMs = end.getTime() - start.getTime();
      const durationMinutes = Math.floor(durationMs / (1000 * 60));
      
      handleChange('duration', durationMinutes);
    }
  };

  const handleSubmit = () => {
    const validationErrors: Record<string, string> = {};
    
    if (!formData.employee_name) {
      validationErrors.employee_name = "Employee name is required";
    }
    
    if (!formData.start_time) {
      validationErrors.start_time = "Start time is required";
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Calculate duration if end time exists and not already set
    if (formData.start_time && formData.end_time && !formData.duration) {
      calculateDuration();
    }
    
    onSubmit(formData);
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="employee_name">Employee</Label>
          <Input
            id="employee_name"
            value={formData.employee_name || ''}
            onChange={(e) => handleChange('employee_name', e.target.value)}
            placeholder="Employee Name"
            className={errors.employee_name ? "border-red-500" : ""}
          />
          {errors.employee_name && (
            <p className="text-xs text-red-500 mt-1">{errors.employee_name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_time">Start Time</Label>
            <Input
              id="start_time"
              type="datetime-local"
              value={formData.start_time || ''}
              onChange={(e) => handleChange('start_time', e.target.value)}
              className={errors.start_time ? "border-red-500" : ""}
            />
            {errors.start_time && (
              <p className="text-xs text-red-500 mt-1">{errors.start_time}</p>
            )}
          </div>

          <div>
            <Label htmlFor="end_time">End Time</Label>
            <Input
              id="end_time"
              type="datetime-local"
              value={formData.end_time || ''}
              onChange={(e) => {
                handleChange('end_time', e.target.value);
                setTimeout(calculateDuration, 100);
              }}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration?.toString() || ''}
            onChange={(e) => handleChange('duration', parseInt(e.target.value))}
            disabled={!!formData.end_time}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="billable"
            checked={formData.billable !== false}
            onCheckedChange={(checked) => handleChange('billable', checked)}
          />
          <Label htmlFor="billable">Billable</Label>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add notes about this time entry"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit}>
          Save
        </Button>
      </div>
    </div>
  );
};
