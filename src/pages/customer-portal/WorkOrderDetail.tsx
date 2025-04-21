
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  Calendar, 
  Clock, 
  Tool, 
  CreditCard, 
  MessageSquare, 
  FileText,
  ArrowLeft
} from 'lucide-react';
import { WorkOrderProgressIndicator } from '@/pages/customer-portal/WorkOrderProgressIndicator';
import { WorkOrderNotifications } from '@/components/customer-portal/WorkOrderNotifications';
import { Link } from 'react-router-dom';

const CustomerWorkOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [workOrder, setWorkOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkOrderDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            *,
            customers(first_name, last_name, email, phone),
            vehicles(year, make, model, vin, color)
          `)
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setWorkOrder(data);
        }
      } catch (err: any) {
        console.error("Error fetching work order:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkOrderDetails();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-40">
              <p>Loading work order details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col justify-center items-center h-40">
              <p className="text-red-500 mb-4">Error loading work order: {error}</p>
              <Button asChild>
                <Link to="/customer-portal/work-orders">Back to Work Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col justify-center items-center h-40">
              <p className="mb-4">Work order not found</p>
              <Button asChild>
                <Link to="/customer-portal/work-orders">Back to Work Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link to="/customer-portal/work-orders">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Work Orders
          </Link>
        </Button>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Work Order #{workOrder.id.slice(0, 8)}</CardTitle>
                <CardDescription>
                  {workOrder.description}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(workOrder.status)}>
                {workOrder.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Progress Indicator */}
            <div className="mb-8">
              <WorkOrderProgressIndicator 
                status={workOrder.status} 
                progress={
                  workOrder.status === 'pending' ? 10 :
                  workOrder.status === 'in-progress' ? 50 :
                  workOrder.status === 'completed' ? 100 : 0
                }
                estimatedCompletion={
                  workOrder.end_time || 
                  (new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)).toISOString()
                }
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Service Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Wrench className="h-5 w-5 text-indigo-500 mr-3" />
                    <div>
                      <p className="text-sm text-slate-500">Service Type</p>
                      <p>{workOrder.service_type || "General Service"}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-indigo-500 mr-3" />
                    <div>
                      <p className="text-sm text-slate-500">Date Created</p>
                      <p>{workOrder.created_at && new Date(workOrder.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-indigo-500 mr-3" />
                    <div>
                      <p className="text-sm text-slate-500">Estimated Completion</p>
                      <p>
                        {workOrder.end_time 
                          ? new Date(workOrder.end_time).toLocaleDateString() 
                          : "To be determined"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Tool className="h-5 w-5 text-indigo-500 mr-3" />
                    <div>
                      <p className="text-sm text-slate-500">Technician</p>
                      <p>{workOrder.technician || "Assigned Technician"}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {workOrder.vehicles && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Vehicle Information</h3>
                  <div className="border rounded-lg p-4">
                    <p className="font-medium">{workOrder.vehicles.year} {workOrder.vehicles.make} {workOrder.vehicles.model}</p>
                    <p className="text-sm text-slate-500 mt-1">Color: {workOrder.vehicles.color || "N/A"}</p>
                    {workOrder.vehicles.vin && (
                      <p className="text-sm text-slate-500">VIN: {workOrder.vehicles.vin}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-6" />
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-4">
              <Button className="bg-indigo-600" asChild>
                <Link to="/customer-portal/messages">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message Staff
                </Link>
              </Button>
              <Button variant="outline" disabled>
                <FileText className="mr-2 h-4 w-4" />
                View Invoice
              </Button>
              <Button variant="outline" disabled>
                <CreditCard className="mr-2 h-4 w-4" />
                Make Payment
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Notifications Feed */}
        <WorkOrderNotifications customerId={workOrder.customer_id} />
      </div>
    </div>
  );
};

export default CustomerWorkOrderDetail;
