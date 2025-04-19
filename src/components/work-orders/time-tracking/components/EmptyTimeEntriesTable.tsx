
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyTimeEntriesTableProps {
  onAddEntry: () => void;
  onStartTimer: () => void;
}

export function EmptyTimeEntriesTable({ onAddEntry, onStartTimer }: EmptyTimeEntriesTableProps) {
  return (
    <div className="text-center p-8 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center">
      <div className="bg-blue-100 p-3 rounded-full mb-4">
        <Clock className="w-10 h-10 text-blue-600" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-2">No Time Entries</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4">
        Start tracking time for this work order using the timer controls above or add a manual time entry.
      </p>
      <div className="flex gap-2">
        <Button 
          variant="outline"
          size="sm"
          className="border-blue-500 text-blue-600 hover:bg-blue-50"
          onClick={onAddEntry}
        >
          Add Time Entry
        </Button>
        <Button 
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={onStartTimer}
        >
          Start Timer
        </Button>
      </div>
    </div>
  );
}
