
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Tool, ChevronRight, Car } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WorkOrder } from "@/types/workOrder";
import { format } from "date-fns";

export function CustomerWorkOrders() {
  const { userId } = useAuthUser();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            id, 
            description, 
            status, 
            priority,
            start_time, 
            end_time,
            vehicle_id,
            vehicles(make, model, year),
            created_at,
            updated_at
          `)
          .eq('customer_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data) {
          setWorkOrders(data);
        }
      } catch (error) {
        console.error('Error fetching work orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkOrders();
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleShowDetails = (order: WorkOrder) => {
    setSelectedOrder(order);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Your Work Orders</h2>
        <p className="text-muted-foreground">
          View and track the status of your service work orders.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="h-10 w-10 border-4 border-t-blue-600 border-b-blue-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
        </div>
      ) : workOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Tool className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No work orders found</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-sm">
              You don't have any service work orders yet. Book an appointment to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {workOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-stretch">
                  <div className="p-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{order.description || `Work Order #${order.id.substring(0, 8)}`}</h3>
                        <div className="text-sm text-gray-500 mt-1 flex items-center">
                          <CalendarDays className="h-3.5 w-3.5 mr-1" />
                          {order.created_at ? format(new Date(order.created_at), 'MMM d, yyyy') : 'Date not available'}
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} capitalize`}>
                        {order.status}
                      </Badge>
                    </div>
                    
                    <div className="mt-3 text-sm">
                      <div className="flex items-center text-gray-500 mb-1">
                        <Car className="h-3.5 w-3.5 mr-1" />
                        {order.vehicles ? 
                          `${order.vehicles.year} ${order.vehicles.make} ${order.vehicles.model}` : 
                          'Vehicle not specified'}
                      </div>
                      {order.start_time && (
                        <div className="flex items-center text-gray-500">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {format(new Date(order.start_time), 'MMM d, h:mm a')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 flex items-center justify-center sm:border-l border-t sm:border-t-0">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleShowDetails(order)}
                      className="flex items-center"
                    >
                      Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Work Order Details</DialogTitle>
            <DialogDescription>
              Details of your service work order.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Work Order ID</h4>
                  <p className="mt-1">{selectedOrder.id.substring(0, 8)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <Badge className={`${getStatusColor(selectedOrder.status)} capitalize mt-1`}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="mt-1">{selectedOrder.description || 'No description provided'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Vehicle</h4>
                <p className="mt-1">
                  {selectedOrder.vehicles ? 
                    `${selectedOrder.vehicles.year} ${selectedOrder.vehicles.make} ${selectedOrder.vehicles.model}` : 
                    'Vehicle not specified'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Created On</h4>
                  <p className="mt-1">
                    {selectedOrder.created_at ? 
                      format(new Date(selectedOrder.created_at), 'MMM d, yyyy') : 
                      'Not available'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                  <p className="mt-1">
                    {selectedOrder.updated_at ? 
                      format(new Date(selectedOrder.updated_at), 'MMM d, yyyy') : 
                      'Not available'}
                  </p>
                </div>
              </div>
              
              {selectedOrder.start_time && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Scheduled Time</h4>
                  <p className="mt-1">
                    {format(new Date(selectedOrder.start_time), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              )}
              
              <Button className="w-full" onClick={() => setShowDialog(false)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
