import React from "react";
import { TimeEntry } from "@/types/workOrder";
import { format } from "date-fns";

interface TimeEntriesListProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void;
  onEdit: (entry: TimeEntry) => void;
}

export function TimeEntriesList({ entries, onDelete, onEdit }: TimeEntriesListProps) {
  if (!entries || entries.length === 0) {
    return (
      <div className="text-center p-6 border border-dashed rounded-md text-slate-500">
        No time entries recorded yet.
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Staff</th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
            <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
            <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Billable</th>
            <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                {entry.employee_name}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                {entry.start_time ? format(new Date(entry.start_time), "MMM d, yyyy h:mm a") : "N/A"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-slate-900">
                {entry.duration} mins
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                {entry.billable ? "Yes" : "No"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 mr-3"
                  onClick={() => onEdit(entry)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="text-red-600 hover:text-red-800"
                  onClick={() => onDelete(entry.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
