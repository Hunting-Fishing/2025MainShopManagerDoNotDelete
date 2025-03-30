
import { Calendar } from "lucide-react";
import { CardContent } from "@/components/ui/card";

export function EmptyRemindersList() {
  return (
    <CardContent>
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <Calendar className="h-12 w-12 text-slate-300 mb-2" />
        <h3 className="text-lg font-medium">No reminders</h3>
        <p className="text-sm text-slate-500 mt-1">
          There are no service reminders scheduled at this time.
        </p>
      </div>
    </CardContent>
  );
}
