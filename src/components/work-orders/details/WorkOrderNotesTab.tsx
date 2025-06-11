
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface WorkOrderNotesTabProps {
  workOrder: WorkOrder;
  notes: string;
  onUpdateNotes: (notes: string) => void;
  isEditMode: boolean;
}

export function WorkOrderNotesTab({
  workOrder,
  notes,
  onUpdateNotes,
  isEditMode
}: WorkOrderNotesTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Work Order Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditMode ? (
            <Textarea
              value={notes}
              onChange={(e) => onUpdateNotes(e.target.value)}
              placeholder="Add notes about this work order..."
              className="min-h-32"
            />
          ) : (
            <div className="min-h-32">
              {notes || workOrder.notes ? (
                <p className="whitespace-pre-wrap">{notes || workOrder.notes}</p>
              ) : (
                <p className="text-muted-foreground">No notes available for this work order.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
