
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { TimeEntry } from "@/types/workOrder";
import { toast } from "@/components/ui/use-toast";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/export";
import { TimeEntryRow } from "./components/TimeEntryRow";
import { TimeEntryExportMenu } from "./components/TimeEntryExportMenu";
import { EmptyTimeEntriesTable } from "./components/EmptyTimeEntriesTable";
import { formatDate, formatTime, formatTimeInHoursAndMinutes } from "./utils/formatTime";

interface TimeEntriesListProps {
  timeEntries: TimeEntry[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entryId: string) => void;
}

export function TimeEntriesList({ timeEntries, onEdit, onDelete }: TimeEntriesListProps) {
  const handleExportTimeEntries = (format: "csv" | "excel" | "pdf") => {
    try {
      if (timeEntries.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no time entries to export",
          variant: "destructive"
        });
        return;
      }

      // Convert time entries to exportable format
      const exportData = timeEntries.map(entry => {
        return {
          employee: entry.employeeName,
          date: formatDate(entry.startTime),
          startTime: formatTime(entry.startTime),
          endTime: entry.endTime ? formatTime(entry.endTime) : "Ongoing",
          duration: formatTimeInHoursAndMinutes(entry.duration),
          billable: entry.billable ? "Yes" : "No",
          notes: entry.notes || ""
        };
      });

      // Define columns for PDF export
      const columns = [
        { header: "Employee", dataKey: "employee" },
        { header: "Date", dataKey: "date" },
        { header: "Start Time", dataKey: "startTime" },
        { header: "End Time", dataKey: "endTime" },
        { header: "Duration", dataKey: "duration" },
        { header: "Billable", dataKey: "billable" },
        { header: "Notes", dataKey: "notes" }
      ];

      switch (format) {
        case "csv":
          exportToCSV(exportData, "TimeEntries");
          break;
        case "excel":
          exportToExcel(exportData, "TimeEntries");
          break;
        case "pdf":
          exportToPDF(exportData, "TimeEntries", columns);
          break;
      }

      toast({
        title: "Export successful",
        description: `Time entries exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting time entries",
        variant: "destructive"
      });
    }
  };

  if (timeEntries.length === 0) {
    return <EmptyTimeEntriesTable />;
  }

  return (
    <div className="space-y-4">
      <TimeEntryExportMenu onExport={handleExportTimeEntries} />
      
      <div className="border rounded overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
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
    </div>
  );
}
