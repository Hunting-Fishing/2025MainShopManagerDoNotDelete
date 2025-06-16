
import React, { useState, useEffect } from 'react';
import { TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, Edit2, Trash2 } from 'lucide-react';
import { getWorkOrderJobLines } from '@/services/workOrder/jobLinesService';

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
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!workOrderId) return;
      
      try {
        setIsLoading(true);
        const lines = await getWorkOrderJobLines(workOrderId);
        setJobLines(lines);
      } catch (error) {
        console.error('Error fetching job lines:', error);
        setJobLines([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [workOrderId]);

  const totalTime = timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0);

  const handleEditTimeEntry = (entry: TimeEntry) => {
    console.log('Edit time entry clicked:', entry.id);
    // TODO: Implement time entry edit dialog
  };

  const handleDeleteTimeEntry = (entryId: string) => {
    if (confirm('Are you sure you want to delete this time entry?')) {
      const updatedEntries = timeEntries.filter(entry => entry.id !== entryId);
      onUpdateTimeEntries(updatedEntries);
    }
  };

  return (
    <div className="space-y-6">
      {/* Time Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Tracking Summary
            </CardTitle>
            {isEditMode && (
              <Button size="sm" className="h-8 px-3">
                <Plus className="h-4 w-4 mr-2" />
                Add Time Entry
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalTime}h</div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{timeEntries.length}</div>
              <div className="text-sm text-muted-foreground">Time Entries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {timeEntries.filter(entry => entry.billable).length}
              </div>
              <div className="text-sm text-muted-foreground">Billable Entries</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Time Entries</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {timeEntries.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No time entries found
            </div>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
                <div className="col-span-3">Employee</div>
                <div className="col-span-2">Start Time</div>
                <div className="col-span-2">Duration</div>
                <div className="col-span-2">Billable</div>
                <div className="col-span-2">Notes</div>
                {isEditMode && <div className="col-span-1">Actions</div>}
              </div>

              {timeEntries.map((entry) => (
                <div key={entry.id} className="grid grid-cols-12 gap-2 py-2 border-b border-gray-100 hover:bg-gray-50">
                  <div className="col-span-3">
                    <div className="font-medium text-sm">{entry.employee_name}</div>
                  </div>
                  <div className="col-span-2 text-sm">
                    {new Date(entry.start_time).toLocaleTimeString()}
                  </div>
                  <div className="col-span-2 text-sm">
                    {entry.duration}h
                  </div>
                  <div className="col-span-2 text-sm">
                    {entry.billable ? 'Yes' : 'No'}
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {entry.notes || '-'}
                  </div>
                  {isEditMode && (
                    <div className="col-span-1 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleEditTimeEntry(entry)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDeleteTimeEntry(entry.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
