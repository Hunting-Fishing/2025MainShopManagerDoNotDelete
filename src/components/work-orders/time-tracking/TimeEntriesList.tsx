
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { TimeEntry } from "@/types/workOrder";
import { formatRelativeTime } from "@/utils/dateUtils";
import { TimeEntryRow } from "./components/TimeEntryRow";
import { EmptyTimeEntriesTable } from "./components/EmptyTimeEntriesTable";
import { formatTimeInHoursAndMinutes } from "@/utils/workOrders";

interface TimeEntriesListProps {
  timeEntries: TimeEntry[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entryId: string) => void;
}

export function TimeEntriesList({ timeEntries, onEdit, onDelete }: TimeEntriesListProps) {
  if (timeEntries.length === 0) {
    return <EmptyTimeEntriesTable />;
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Billable</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeEntries.map((entry) => (
            <TimeEntryRow 
              key={entry.id}
              entry={entry}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
