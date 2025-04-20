
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { TimeEntry } from "@/types/workOrder";
import { TimeEntryRow } from "./components/TimeEntryRow";
import { EmptyTimeEntriesTable } from "./components/EmptyTimeEntriesTable";
import { TimeTracker } from "./TimeTracker";
import { TimeEntryForm } from "./components/TimeEntryForm";

interface TimeEntriesListProps {
  timeEntries: TimeEntry[];
  activeTimer: TimeEntry | null;
  onStartTimer: () => void;
  onStopTimer: () => void;
  onAddEntry: (entry: Partial<TimeEntry>) => void;
  onEditEntry: (entry: TimeEntry) => void;
  onDeleteEntry: (entryId: string) => void;
}

export function TimeEntriesList({ 
  timeEntries, 
  activeTimer,
  onStartTimer,
  onStopTimer,
  onAddEntry,
  onEditEntry,
  onDeleteEntry 
}: TimeEntriesListProps) {
  const [showAddForm, setShowAddForm] = React.useState(false);

  if (timeEntries.length === 0 && !showAddForm) {
    return (
      <EmptyTimeEntriesTable 
        onAddEntry={() => setShowAddForm(true)}
        onStartTimer={onStartTimer}
      />
    );
  }

  return (
    <div className="space-y-4">
      <TimeTracker
        activeTimer={activeTimer}
        onStartTimer={onStartTimer}
        onStopTimer={onStopTimer}
      />

      {showAddForm && (
        <div className="border rounded-md p-4 bg-slate-50">
          <TimeEntryForm
            onSubmit={(data) => {
              onAddEntry(data);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

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
                onEdit={onEditEntry}
                onDelete={onDeleteEntry}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
