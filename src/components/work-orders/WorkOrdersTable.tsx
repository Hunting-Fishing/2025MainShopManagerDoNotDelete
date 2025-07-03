
import React from 'react';
import { Link } from 'react-router-dom';
import { WorkOrder } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
              <div key={workOrder.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">
                      {workOrder.work_order_number || `WO-${workOrder.id.slice(0, 8)}`}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {workOrder.description || 'No description provided'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {workOrder.customer_name && (
                        <span>Customer: {workOrder.customer_name}</span>
                      )}
                      {workOrder.vehicle_make && workOrder.vehicle_model && (
                        <span>Vehicle: {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}</span>
                      )}
                      {workOrder.total_cost && (
                        <span>Total: ${workOrder.total_cost.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {workOrder.status && (
                      <Badge variant={
                        workOrder.status === 'completed' ? 'default' :
                        workOrder.status === 'in_progress' ? 'secondary' :
                        workOrder.status === 'pending' ? 'outline' : 'destructive'
                      }>
                        {workOrder.status.replace('_', ' ')}
                      </Badge>
                    )}
                    <Link to={`/work-orders/${workOrder.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
