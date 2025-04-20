
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TimeEntry } from "@/types/workOrder";

interface TimeEntryFormProps {
  entry?: TimeEntry;
  onSubmit: (data: Partial<TimeEntry>) => void;
  onCancel: () => void;
}

export function TimeEntryForm({ entry, onSubmit, onCancel }: TimeEntryFormProps) {
  const [formData, setFormData] = React.useState({
    startTime: entry?.startTime || "",
    duration: entry?.duration || 0,
    notes: entry?.notes || "",
    billable: entry?.billable ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Start Time</label>
          <Input
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Duration (minutes)</label>
          <Input
            type="number"
            min={1}
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
            required
          />
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium">Notes</label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Add any notes about this time entry..."
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={formData.billable}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, billable: checked }))}
        />
        <label className="text-sm font-medium">Billable Time</label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {entry ? 'Update' : 'Add'} Time Entry
        </Button>
      </div>
    </form>
  );
}
