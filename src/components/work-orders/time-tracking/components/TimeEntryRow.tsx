
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TimeEntry } from "@/types/workOrder";
import { TimeEntryActions } from "./TimeEntryActions";
import { formatDate, formatTime, formatTimeInHoursAndMinutes } from "../utils/formatTime";

interface TimeEntryRowProps {
  entry: TimeEntry;
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entryId: string) => void;
}

export function TimeEntryRow({ entry, onEdit, onDelete }: TimeEntryRowProps) {
  return (
    <TableRow key={entry.id}>
      <TableCell className="font-medium">{entry.employeeName}</TableCell>
      <TableCell>{formatDate(entry.startTime)}</TableCell>
      <TableCell>
        {formatTime(entry.startTime)} - {entry.endTime ? formatTime(entry.endTime) : "Ongoing"}
      </TableCell>
      <TableCell>{formatTimeInHoursAndMinutes(entry.duration)}</TableCell>
      <TableCell>
        {entry.billable ? (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Billable</Badge>
        ) : (
          <Badge variant="outline" className="text-slate-500">Non-billable</Badge>
        )}
      </TableCell>
      <TableCell className="max-w-xs truncate">{entry.notes}</TableCell>
      <TableCell className="text-right">
        <TimeEntryActions entry={entry} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  );
}
