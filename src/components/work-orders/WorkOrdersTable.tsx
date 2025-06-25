
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
                <h3 className="font-medium">
                  {workOrder.work_order_number || `Work Order #${workOrder.id.slice(0, 8)}`}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {workOrder.description || 'No description provided'}
                </p>
                {workOrder.customer_name && (
                  <p className="text-sm text-gray-600 mt-1">
                    Customer: {workOrder.customer_name}
                  </p>
                )}
                {workOrder.status && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {workOrder.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
