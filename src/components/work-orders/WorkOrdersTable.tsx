
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
}

export function WorkOrdersTable({ workOrders }: WorkOrdersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {workOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No work orders found.</p>
            <p className="text-sm mt-2">Create your first work order to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workOrders.map((workOrder) => (
              <div key={workOrder.id} className="border rounded-lg p-4">
                <h3 className="font-medium">{workOrder.title}</h3>
                <p className="text-sm text-muted-foreground">{workOrder.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
