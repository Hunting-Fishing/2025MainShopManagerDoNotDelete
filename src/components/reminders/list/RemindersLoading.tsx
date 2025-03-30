
import { CardContent } from "@/components/ui/card";

export function RemindersLoading() {
  return (
    <CardContent>
      <div className="flex justify-center py-6">
        <div className="text-center text-slate-500">
          Loading reminders...
        </div>
      </div>
    </CardContent>
  );
}
