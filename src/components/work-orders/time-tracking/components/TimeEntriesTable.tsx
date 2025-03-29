
import React from "react";
import { TimeEntry } from "@/types/workOrder";
import { TimeEntryRow } from "./TimeEntryRow";
import { EmptyTimeEntriesTable } from "./EmptyTimeEntriesTable";

interface TimeEntriesTableProps {
  timeEntries: TimeEntry[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entryId: string) => void;
}

export function TimeEntriesTable({ timeEntries, onEdit, onDelete }: TimeEntriesTableProps) {
  if (!timeEntries.length) {
    return <EmptyTimeEntriesTable />;
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Notes</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {timeEntries.map((entry) => (
            <TimeEntryRow 
              key={entry.id} 
              entry={entry} 
              onEdit={onEdit} 
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
