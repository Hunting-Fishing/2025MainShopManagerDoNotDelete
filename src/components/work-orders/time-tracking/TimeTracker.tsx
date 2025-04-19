
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { TimeEntry } from "@/types/workOrder";

interface TimeTrackerProps {
  activeTimer: TimeEntry | null;
  onStartTimer: () => void;
  onStopTimer: () => void;
}

export function TimeTracker({ activeTimer, onStartTimer, onStopTimer }: TimeTrackerProps) {
  return (
    <div className="mb-4">
      {activeTimer ? (
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onStopTimer}
          className="gap-2"
        >
          <Pause className="h-4 w-4" />
          Stop Timer
        </Button>
      ) : (
        <Button 
          variant="default" 
          size="sm" 
          onClick={onStartTimer}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          <Play className="h-4 w-4" />
          Start Timer
        </Button>
      )}
    </div>
  );
}
