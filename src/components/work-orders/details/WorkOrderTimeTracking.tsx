
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Clock, AlertTriangle } from "lucide-react";
import { WorkOrder } from "@/data/workOrdersData";
import { TimeEntry } from "@/types/workOrder";
import { formatTimeInHoursAndMinutes } from "@/data/workOrdersData";

interface WorkOrderTimeTrackingProps {
  workOrder: WorkOrder;
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
}

export function WorkOrderTimeTracking({ workOrder, onUpdateTimeEntries }: WorkOrderTimeTrackingProps) {
  const timeEntries = workOrder.timeEntries || [];
  const totalTime = timeEntries.reduce((total, entry) => total + entry.duration, 0);
  const totalBillableTime = timeEntries.reduce((total, entry) => {
    return entry.billable ? total + entry.duration : total;
  }, 0);

  if (!timeEntries.length) {
    return (
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">Time Tracking</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-2 text-slate-500">No time entries recorded for this work order</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-lg">Time Tracking</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border-b">
          <div className="p-4 bg-slate-50 rounded-md">
            <p className="text-sm text-slate-500">Total Time</p>
            <p className="text-2xl font-semibold">{formatTimeInHoursAndMinutes(totalTime)}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-md">
            <p className="text-sm text-slate-500">Billable Time</p>
            <p className="text-2xl font-semibold">{formatTimeInHoursAndMinutes(totalBillableTime)}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-md">
            <p className="text-sm text-slate-500">Entries</p>
            <p className="text-2xl font-semibold">{timeEntries.length}</p>
          </div>
        </div>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Technician
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Billable
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {timeEntries.map((entry) => {
              const startDate = new Date(entry.startTime);
              
              return (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {entry.employeeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {startDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {formatTimeInHoursAndMinutes(entry.duration)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {entry.billable ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                    {entry.notes || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
