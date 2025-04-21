
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkOrder } from "@/types/workOrder";
import { findWorkOrderById } from "@/utils/workOrders";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Wrench } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from "@/hooks/use-toast";

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  useEffect(() => {
    const loadWorkOrder = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch work order details
        const { data, error: fetchError } = await supabase
          .from('work_orders')
          .select(`
            *,
            vehicles (*),
            work_order_time_entries (*)
          `)
          .eq('id', id)
          .single();
          
        if (fetchError) {
          throw fetchError;
        }
        
        if (data) {
          setWorkOrder(data);
          
          // Fetch notifications
          const { data: notificationsData, error: notificationsError } = await supabase
            .from('work_order_notifications')
            .select('*')
            .eq('work_order_id', id)
            .order('created_at', { ascending: false });
            
          if (notificationsError) {
            console.error("Error loading notifications:", notificationsError);
          } else {
            setNotifications(notificationsData || []);
          }
        } else {
          toast({
            title: "Not Found",
            description: "Work order not found",
            variant: "destructive"
          });
          navigate('/customer-portal');
        }
      } catch (error: any) {
        console.error("Error loading work order:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadWorkOrder();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
          <p className="text-slate-500">Loading work order details...</p>
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Work Order Not Found</h2>
          <p className="text-slate-500 mb-4">
            {error || "The requested work order could not be found or may have been deleted."}
          </p>
          <Button onClick={() => navigate('/customer-portal')} className="mt-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Format date strings
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-300';
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate('/customer-portal/work-orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Work Orders
        </Button>
      </div>
      
      <Card>
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl">
                Work Order #{id?.substring(0, 8)}
              </CardTitle>
              <CardDescription>
                {workOrder.description || "No description provided"}
              </CardDescription>
            </div>
            <Badge className={getStatusBadgeClass(workOrder.status)}>
              {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Work Order Details</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2">
                  <span className="text-slate-500">Created:</span>
                  <span>{formatDate(workOrder.created_at)}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-slate-500">Status:</span>
                  <span className={workOrder.status === 'completed' ? 'text-green-600' : 
                                  workOrder.status === 'in-progress' ? 'text-blue-600' : 
                                  workOrder.status === 'cancelled' ? 'text-red-600' : ''}>
                    {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-slate-500">Type:</span>
                  <span>{workOrder.service_type || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            {workOrder.vehicles && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Vehicle</h3>
                <div className="border rounded-lg p-3 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <Wrench className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium">{workOrder.vehicles.year} {workOrder.vehicles.make} {workOrder.vehicles.model}</p>
                      <p className="text-sm text-slate-500">{workOrder.vehicles.license_plate || workOrder.vehicles.vin}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-slate-600">{workOrder.description || "No description provided."}</p>
              </div>
              
              {/* Work performed section could go here */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Work Performed</h3>
                <p className="text-slate-600">Details about the work performed will appear here.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="updates" className="space-y-4 pt-4">
              {notifications.length === 0 ? (
                <div className="text-center py-10 border rounded-lg">
                  <p className="text-slate-500">No status updates yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{notification.title}</h4>
                        <span className="text-sm text-slate-500">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-slate-600">{notification.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="timeline" className="space-y-4 pt-4">
              <div className="text-center py-10 border rounded-lg">
                <p className="text-slate-500">Timeline details will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
          
        </CardContent>
      </Card>
    </div>
  );
}
