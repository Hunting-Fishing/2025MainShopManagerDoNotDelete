
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Clock, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TimeEntry } from "@/types/workOrder";
import { formatTimeInHoursAndMinutes } from "@/data/workOrdersData";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/reportExport";
import { toast } from "@/components/ui/use-toast";

interface TimeEntriesListProps {
  timeEntries: TimeEntry[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entryId: string) => void;
}

export function TimeEntriesList({ timeEntries, onEdit, onDelete }: TimeEntriesListProps) {
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format time for display
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
    return (
      <div className="text-center py-10 border rounded">
        <Clock className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-2 text-slate-500">No time entries recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Time Entries
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExportTimeEntries("csv")}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportTimeEntries("excel")}>
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportTimeEntries("pdf")}>
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
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
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(entry)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => onDelete(entry.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
