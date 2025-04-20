
import React from "react";
import { Button } from "@/components/ui/button";
import { Pause } from "lucide-react";
import { TimeEntry } from "@/types/workOrder";

interface ActiveTimerBannerProps {
  activeTimer: TimeEntry;
  onStopTimer: () => void;
}

export function ActiveTimerBanner({ activeTimer, onStopTimer }: ActiveTimerBannerProps) {
  return (
    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded flex justify-between items-center">
      <div>
        <p className="font-medium">Timer Running</p>
        <p className="text-sm text-slate-500">
          Started: {new Date(activeTimer.startTime).toLocaleTimeString()}
        </p>
      </div>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={onStopTimer}
      >
        <Pause className="mr-1 h-4 w-4" />
        Stop
      </Button>
    </div>
  );
}
