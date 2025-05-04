
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { WorkOrder } from "@/types/workOrder";

interface WorkOrderNotesProps {
  workOrder: WorkOrder;
}

export function WorkOrderNotes({ workOrder }: WorkOrderNotesProps) {
  return (
    <Card>
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-lg">Notes</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {workOrder.notes ? (
          <div className="whitespace-pre-wrap text-slate-800">{workOrder.notes}</div>
        ) : (
          <div className="text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-slate-500">No notes available for this work order</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
