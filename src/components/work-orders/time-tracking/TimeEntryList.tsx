
import React from "react";
import { TimeEntry } from "@/types/workOrder";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatTimeInHoursAndMinutes } from "@/utils/dateUtils";
import { TimeEntryActions } from "./components/TimeEntryActions";
import { EmptyTimeEntriesTable } from "./components/EmptyTimeEntriesTable";

interface TimeEntryListProps {
  entries: TimeEntry[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entryId: string) => void;
}

export function TimeEntryList({
  entries,
  onEdit,
  onDelete
}: TimeEntryListProps) {
  if (!entries.length) {
    return <EmptyTimeEntriesTable />;
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Staff</TableHead>
          <TableHead>Start Time</TableHead>
          <TableHead>End Time</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Billable</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{entry.employeeName}</TableCell>
            <TableCell>{formatDateTime(entry.startTime)}</TableCell>
            <TableCell>{entry.endTime ? formatDateTime(entry.endTime) : 'N/A'}</TableCell>
            <TableCell>{formatTimeInHoursAndMinutes(entry.duration)}</TableCell>
            <TableCell>{entry.billable ? 'Yes' : 'No'}</TableCell>
            <TableCell className="max-w-xs truncate">
              {entry.notes || <span className="text-muted-foreground italic">No notes</span>}
            </TableCell>
            <TableCell>
              <TimeEntryActions
                entry={entry}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
