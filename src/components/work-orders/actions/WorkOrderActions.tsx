
import React from "react";
import { Button } from "@/components/ui/button";
import {
  PlayCircle,
  CheckCircle,
  XCircle,
  PauseCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { WorkOrderStatusType } from "@/types/workOrder";

interface WorkOrderActionsProps {
  currentStatus: WorkOrderStatusType;
  onStatusChange: (newStatus: WorkOrderStatusType) => void;
}

export function WorkOrderActions({
  currentStatus,
  onStatusChange
}: WorkOrderActionsProps) {
  // Define the available actions based on the current status
  const getActionButtons = () => {
    switch (currentStatus) {
      case "pending":
        return (
          <>
            <Button
              className="flex items-center gap-1"
              onClick={() => onStatusChange("in-progress")}
            >
              <PlayCircle className="h-4 w-4" />
              Start Work
            </Button>
            <Button
              variant="destructive"
              className="flex items-center gap-1"
              onClick={() => onStatusChange("cancelled")}
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </Button>
          </>
        );

      case "in-progress":
        return (
          <>
            <Button
              className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
              onClick={() => onStatusChange("completed")}
            >
              <CheckCircle className="h-4 w-4" />
              Mark Completed
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => onStatusChange("pending")}
            >
              <PauseCircle className="h-4 w-4" />
              On Hold
            </Button>
            <Button
              variant="destructive"
              className="flex items-center gap-1"
              onClick={() => onStatusChange("cancelled")}
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </Button>
          </>
        );

      case "completed":
        return (
          <>
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => onStatusChange("in-progress")}
            >
              <Clock className="h-4 w-4" />
              Reopen
            </Button>
          </>
        );

      case "cancelled":
        return (
          <>
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => onStatusChange("pending")}
            >
              <AlertTriangle className="h-4 w-4" />
              Reopen as Pending
            </Button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">{getActionButtons()}</div>
      </CardContent>
    </Card>
  );
}
