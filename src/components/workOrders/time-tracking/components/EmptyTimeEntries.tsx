
import React from "react";
import { Clock } from "lucide-react";

export function EmptyTimeEntries() {
  return (
    <div className="text-center py-12 border rounded-lg bg-slate-50">
      <Clock className="mx-auto h-12 w-12 text-slate-300" />
      <p className="mt-3 text-lg font-medium text-slate-700">No time entries recorded</p>
      <p className="mt-1 text-sm text-slate-500">
        Track time spent on this work order by adding time entries
      </p>
    </div>
  );
}
