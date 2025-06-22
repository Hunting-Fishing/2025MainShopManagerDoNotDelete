
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { WorkOrdersTable } from '@/components/work-orders/WorkOrdersTable';
import { WorkOrdersHeader } from '@/components/work-orders/WorkOrdersHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function WorkOrders() {
  const { workOrders, loading, error } = useWorkOrders();

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Work Orders | ServicePro</title>
        </Helmet>
        
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-lg">Loading work orders...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Work Orders | ServicePro</title>
        </Helmet>
        
        <div className="space-y-6">
          <WorkOrdersHeader workOrders={[]} />
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Work Orders</h3>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Work Orders | ServicePro</title>
      </Helmet>
      
      <div className="space-y-6">
        <WorkOrdersHeader workOrders={workOrders} />
        <WorkOrdersTable workOrders={workOrders} />
      </div>
    </>
  );
}
