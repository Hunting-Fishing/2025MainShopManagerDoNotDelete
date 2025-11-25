import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import { format } from 'date-fns';

export default function WorkOrders() {
  const navigate = useNavigate();
  const { workOrders, loading, error, refetch } = useWorkOrders();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading work orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-3 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Work Orders</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage service work orders and track inventory usage
              </p>
            </div>
            <Button 
              onClick={() => navigate('/work-orders/create')} 
              size="lg"
              className="w-full sm:w-auto min-h-[44px]"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Work Order
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-6 py-6">
        {workOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold text-foreground mb-2">
                No work orders yet. Create one to get started.
              </p>
              <Button 
                onClick={() => navigate('/work-orders/create')} 
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Work Order
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workOrders.map((workOrder) => (
              <Card 
                key={workOrder.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/work-orders/${workOrder.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {workOrder.work_order_number || workOrder.id}
                      </CardTitle>
                      {(workOrder.equipment_name || workOrder.customer_name) && (
                        <p className="text-sm font-semibold text-primary mb-2">
                          {workOrder.equipment_name || workOrder.customer_name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {workOrder.description?.substring(0, 50) || 'No description'}
                      </p>
                    </div>
                    <Badge 
                      className={`${getStatusColor(workOrder.status)} text-white`}
                    >
                      {workOrder.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Priority</span>
                      <Badge 
                        variant="outline" 
                        className={getPriorityColor(workOrder.priority)}
                      >
                        {workOrder.priority}
                      </Badge>
                    </div>
                    
                    {workOrder.customer && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Customer</span>
                        <span className="text-sm font-medium">{workOrder.customer}</span>
                      </div>
                    )}
                    
                    {workOrder.technician && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Technician</span>
                        <span className="text-sm font-medium">{workOrder.technician}</span>
                      </div>
                    )}
                    
                    {workOrder.created_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Created</span>
                        <span className="text-sm">
                          {format(new Date(workOrder.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
