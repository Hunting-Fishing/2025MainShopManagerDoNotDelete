
import React from 'react';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import WorkOrdersHeader from '@/components/work-orders/WorkOrdersHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Loader2 } from 'lucide-react';
import { WorkOrderTable } from '@/components/work-orders/WorkOrderTable';

export default function WorkOrders() {
  const { workOrders, loading, error } = useWorkOrders();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading work orders from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <WorkOrdersHeader workOrders={workOrders} />
        <Alert variant="destructive">
          <Database className="h-4 w-4" />
          <AlertDescription>
            Error loading work orders: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorkOrdersHeader workOrders={workOrders} />
      
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          All work order data is live from your Supabase database. No mock or sample data is displayed.
        </AlertDescription>
      </Alert>

      {workOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <Database className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No work orders found</h3>
              <p className="text-gray-500 mb-6">
                Get started by creating your first work order.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <WorkOrderTable workOrders={workOrders} />
      )}
    </div>
  );
}
