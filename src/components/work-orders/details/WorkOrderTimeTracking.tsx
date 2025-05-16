import React from "react";
import { format } from "date-fns";
import { TimeEntry } from "@/types/workOrder";

interface TimeTrackingProps {
  timeEntries: TimeEntry[];
}

export function WorkOrderTimeTracking({ timeEntries }: TimeTrackingProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Time Tracking</h3>
      <p className="text-sm text-slate-500">
        View and manage time entries for this work order
      </p>
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Start Time
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Employee
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              End Time
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Duration
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Billable
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {timeEntries.map((entry) => (
            <tr key={entry.id}>
              <td className="px-4 py-3 whitespace-nowrap">
                {entry.start_time ? format(new Date(entry.start_time), "MMM d, yyyy h:mm a") : "N/A"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {entry.employee_name}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {entry.end_time ? format(new Date(entry.end_time), "MMM d, yyyy h:mm a") : "N/A"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {formatDuration(entry.duration)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {entry.billable ? "Yes" : "No"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
