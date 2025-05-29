
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Wrench, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useWorkOrders } from '@/hooks/useWorkOrders';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  'on-hold': 'bg-gray-100 text-gray-800 border-gray-200'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

export default function WorkOrders() {
  const { workOrders, loading, error, updateWorkOrderStatus } = useWorkOrders();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Work Orders</h1>
            <p className="text-muted-foreground">
              Manage and track service work orders
            </p>
          </div>
          <Button asChild>
            <Link to="/work-orders/create">
              <Plus className="mr-2 h-4 w-4" />
              New Work Order
            </Link>
          </Button>
        </div>
        <LoadingSpinner size="lg" text="Loading work orders..." className="mt-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Work Orders</h1>
            <p className="text-muted-foreground">
              Manage and track service work orders
            </p>
          </div>
          <Button asChild>
            <Link to="/work-orders/create">
              <Plus className="mr-2 h-4 w-4" />
              New Work Order
            </Link>
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading work orders: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Work Orders</h1>
          <p className="text-muted-foreground">
            Manage and track service work orders
          </p>
        </div>
        <Button asChild>
          <Link to="/work-orders/create">
            <Plus className="mr-2 h-4 w-4" />
            New Work Order
          </Link>
        </Button>
      </div>

      {/* Work Orders List or Empty State */}
      {workOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <ClipboardList className="h-24 w-24 text-gray-300 mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Work Orders Yet</h3>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            Get started by creating your first work order to track service jobs and manage customer requests.
          </p>
          <Button asChild size="lg">
            <Link to="/work-orders/create">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Work Order
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {workOrders.map((workOrder) => (
            <Card key={workOrder.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">
                        Work Order #{workOrder.id.substring(0, 8)}
                      </h3>
                      <Badge className={statusColors[workOrder.status]}>
                        {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
                      </Badge>
                      {workOrder.priority && (
                        <Badge variant="outline" className={priorityColors[workOrder.priority]}>
                          {workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)} Priority
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600">{workOrder.description}</p>
                    
                    {workOrder.customer && (
                      <p className="text-sm text-gray-500">
                        Customer: {workOrder.customer}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-400">
                      Created: {new Date(workOrder.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {workOrder.status !== 'completed' && workOrder.status !== 'cancelled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateWorkOrderStatus(workOrder.id, 'completed')}
                      >
                        Mark Complete
                      </Button>
                    )}
                    <Link to={`/work-orders/${workOrder.id}`}>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
