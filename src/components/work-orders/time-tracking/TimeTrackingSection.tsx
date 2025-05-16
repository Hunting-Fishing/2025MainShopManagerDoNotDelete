
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { TimeEntry } from '@/types/workOrder';
import { TimeEntryList } from './TimeEntryList';
import { TimeEntryDialog } from './TimeEntryDialog';
import { calculateTotalTime, formatDuration } from '@/utils/workOrderUtils';

export interface TimeTrackingSectionProps {
  workOrderId: string;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (updatedEntries: TimeEntry[]) => void;
}

export const TimeTrackingSection: React.FC<TimeTrackingSectionProps> = ({
  workOrderId,
  timeEntries = [],
  onUpdateTimeEntries
}) => {
  const [isAddingTime, setIsAddingTime] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  const totalTime = calculateTotalTime(timeEntries);
  const billableTime = calculateTotalTime(timeEntries.filter(entry => entry.billable));

  const handleOpenAddDialog = () => {
    setEditingEntry(null);
    setIsAddingTime(true);
  };

  const handleCloseDialog = () => {
    setIsAddingTime(false);
    setEditingEntry(null);
  };

  const handleSaveEntry = (entry: TimeEntry) => {
    let updatedEntries;
    
    if (editingEntry) {
      // Edit existing entry
      updatedEntries = timeEntries.map(item => 
        item.id === entry.id ? entry : item
      );
    } else {
      // Add new entry
      updatedEntries = [...timeEntries, entry];
    }
    
    onUpdateTimeEntries(updatedEntries);
    handleCloseDialog();
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setIsAddingTime(true);
  };

  const handleDeleteEntry = (entryId: string) => {
    const updatedEntries = timeEntries.filter(entry => entry.id !== entryId);
    onUpdateTimeEntries(updatedEntries);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Time Tracking</CardTitle>
        <Button onClick={handleOpenAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Time
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Time</p>
            <p className="text-2xl font-bold">{formatDuration(totalTime)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Billable Time</p>
            <p className="text-2xl font-bold">{formatDuration(billableTime)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Number of Entries</p>
            <p className="text-2xl font-bold">{timeEntries.length}</p>
          </div>
        </div>

        <TimeEntryList
          entries={timeEntries}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
        />

        <TimeEntryDialog
          isOpen={isAddingTime}
          onClose={handleCloseDialog}
          onSave={handleSaveEntry}
          workOrderId={workOrderId}
          entry={editingEntry}
        />
      </CardContent>
    </Card>
  );
};
