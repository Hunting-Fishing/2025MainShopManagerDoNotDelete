
import React from 'react';
import { Link } from 'react-router-dom';
import { WorkOrder } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkOrderStatusBadge } from './WorkOrderStatusBadge';
import { Calendar, User, Car, DollarSign, Clock, Eye } from 'lucide-react';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
}

export function WorkOrdersTable({ workOrders }: WorkOrdersTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Work Orders</h2>
          <p className="text-muted-foreground font-body">
            Manage and track all work orders
          </p>
        </div>
      </div>

      {workOrders.length === 0 ? (
        <Card className="modern-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted/20 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold font-heading">No work orders found</h3>
                <p className="text-muted-foreground font-body">
                  Create your first work order to get started
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {workOrders.map((workOrder, index) => (
            <Card 
              key={workOrder.id} 
              className="work-order-card animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Main Content */}
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold font-heading gradient-text">
                          {workOrder.work_order_number || `WO-${workOrder.id.slice(0, 8)}`}
                        </h3>
                        <p className="text-sm text-muted-foreground font-body mt-1">
                          {workOrder.description || 'No description provided'}
                        </p>
                      </div>
                      <WorkOrderStatusBadge status={workOrder.status} />
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {workOrder.customer_name && (
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-primary/10">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground font-body">Customer</p>
                            <p className="text-sm font-medium font-body truncate">
                              {workOrder.customer_name}
                            </p>
                          </div>
                        </div>
                      )}

                      {(workOrder.vehicle_make && workOrder.vehicle_model) && (
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-info/10">
                            <Car className="w-4 h-4 text-info" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground font-body">Vehicle</p>
                            <p className="text-sm font-medium font-body truncate">
                              {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
                            </p>
                          </div>
                        </div>
                      )}

                      {workOrder.total_cost && (
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-success/10">
                            <DollarSign className="w-4 h-4 text-success" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground font-body">Total Cost</p>
                            <p className="text-sm font-bold font-heading text-success">
                              ${workOrder.total_cost.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )}

                      {workOrder.created_at && (
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-warning/10">
                            <Calendar className="w-4 h-4 text-warning" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground font-body">Created</p>
                            <p className="text-sm font-medium font-body">
                              {formatDate(workOrder.created_at)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="ml-6">
                    <Button 
                      asChild
                      variant="outline"
                      size="sm"
                      className="btn-gradient-primary border-0 text-white hover:shadow-lg transition-all duration-300"
                    >
                      <Link to={`/work-orders/${workOrder.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
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
