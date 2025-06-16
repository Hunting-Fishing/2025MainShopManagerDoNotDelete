
import React, { useState, useEffect } from 'react';
import { TimeEntry } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TimeEntriesTable } from './components/TimeEntriesTable';

interface TimeTrackingSectionProps {
  workOrderId: string;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
  isEditMode: boolean;
}

export function TimeTrackingSection({
  workOrderId,
  timeEntries,
  onUpdateTimeEntries,
  isEditMode
}: TimeTrackingSectionProps) {
  const [localTimeEntries, setLocalTimeEntries] = useState<TimeEntry[]>(timeEntries);

  useEffect(() => {
    setLocalTimeEntries(timeEntries);
  }, [timeEntries]);

  const handleEdit = (entryId: string) => {
    console.log('Edit time entry:', entryId);
    // TODO: Implement edit functionality
  };

  const handleDelete = (entryId: string) => {
    const updatedEntries = localTimeEntries.filter(entry => entry.id !== entryId);
    setLocalTimeEntries(updatedEntries);
    onUpdateTimeEntries(updatedEntries);
  };

  const totalHours = localTimeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const billableHours = localTimeEntries.filter(entry => entry.billable).reduce((sum, entry) => sum + (entry.duration || 0), 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Time Tracking</CardTitle>
            <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
              <span>Total: {totalHours.toFixed(1)}h</span>
              <span>Billable: {billableHours.toFixed(1)}h</span>
            </div>
          </div>
          {isEditMode && (
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Time Entry
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <TimeEntriesTable
          timeEntries={localTimeEntries}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </CardContent>
    </Card>
  );
}
