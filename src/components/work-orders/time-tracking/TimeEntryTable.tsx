
import React from 'react';
import { TimeEntry } from '@/types/workOrder';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export interface TimeEntryTableProps {
  entries: TimeEntry[];
  onEdit: (entryId: string) => void;
  onDelete: (entryId: string) => void;
}

export const TimeEntryTable: React.FC<TimeEntryTableProps> = ({ 
  entries, 
  onEdit, 
  onDelete 
}) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (entries.length === 0) {
    return (
      <div className="py-8 text-center border rounded-md">
        <p className="text-muted-foreground">No time entries recorded</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Start Time</TableHead>
          <TableHead>End Time</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Billable</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => {
          // Parse dates for formatting
          const startDateTime = new Date(entry.start_time);
          const endDateTime = entry.end_time ? new Date(entry.end_time) : null;
          
          return (
            <TableRow key={entry.id}>
              <TableCell>{entry.employee_name}</TableCell>
              <TableCell>{format(startDateTime, 'MMM dd, yyyy')}</TableCell>
              <TableCell>{format(startDateTime, 'h:mm a')}</TableCell>
              <TableCell>
                {endDateTime ? format(endDateTime, 'h:mm a') : 'In progress'}
              </TableCell>
              <TableCell>{formatDuration(entry.duration)}</TableCell>
              <TableCell>{entry.billable ? 'Yes' : 'No'}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => onEdit(entry.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => onDelete(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
