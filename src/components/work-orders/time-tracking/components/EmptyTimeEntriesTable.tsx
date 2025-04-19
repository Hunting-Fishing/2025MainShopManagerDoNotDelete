
import { Clock } from "lucide-react";

export function EmptyTimeEntriesTable() {
  return (
    <div className="text-center p-8 bg-slate-50 border rounded-lg">
      <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-slate-900 mb-2">No Time Entries</h3>
      <p className="text-sm text-slate-500">
        Start tracking time for this work order using the timer controls above.
      </p>
    </div>
  );
}
