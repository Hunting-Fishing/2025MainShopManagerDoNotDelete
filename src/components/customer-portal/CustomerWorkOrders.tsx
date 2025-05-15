import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/utils/workOrderUtils';
import { Search, Filter, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkOrder, priorityMap } from '@/types/workOrder';

// Define an extended type to handle the database response format
interface WorkOrderWithVehicle extends WorkOrder {
  vehicleDetails?: {
    make: string;
    model: string;
    year: string;
  };
  start_time?: string;
}

export default function CustomerWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user?.id) {
        setIsLoading(false);
        return;
      }

      // Get the customer ID associated with this user
      const { data: customerData } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', user.user.id)
        .single();

      if (!customerData) {
        setIsLoading(false);
        return;
      }
      
      // Fetch work orders with join to vehicles
      const { data } = await supabase
        .from('work_orders')
        .select(`
          id, 
          description, 
          status, 
          priority,
          start_time,
          end_time,
          vehicle_id,
          technician,
          location,
          created_at,
          updated_at,
          vehicles:vehicle_id (
            make,
            model,
            year
          )
        `)
        .eq('customer_id', customerData.id)
        .order('created_at', { ascending: false });

      if (data) {
        // Map the database response to our WorkOrder type
        const mappedOrders = data.map(order => ({
          id: order.id,
          customer: '', // Will be populated from customer data if needed
          description: order.description || '',
          status: order.status || 'pending',
          priority: order.priority || 'medium',
          technician: order.technician || '',
          date: order.created_at || '',
          dueDate: order.end_time || order.created_at || '',
          location: order.location || '',
          notes: '',
          // Store vehicle details in a format that matches our component usage
          vehicleDetails: order.vehicles ? {
            make: order.vehicles.make || '',
            model: order.vehicles.model || '',
            year: order.vehicles.year || '',
          } : undefined,
          // Keep track of start_time for rendering
          start_time: order.start_time
        })) as WorkOrder[];

        setWorkOrders(mappedOrders);
        setFilteredOrders(mappedOrders);
      }
    } catch (error) {
      console.error('Error fetching work orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters when searchTerm or statusFilter changes
    let result = [...workOrders];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(order => 
        order.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(result);
  }, [searchTerm, statusFilter, workOrders]);

  const handleOpenDetails = (order: WorkOrder) => {
    setSelectedOrder(order);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Your Work Orders</CardTitle>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search work orders..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              className="border border-gray-300 rounded px-3 py-1.5"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium">No Work Orders Found</h3>
                <p className="text-gray-500 mt-1">There are no work orders matching your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleOpenDetails(order)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="outline" className={`${priorityMap[order.priority].classes} mt-1`}>
                            {priorityMap[order.priority].label}
                          </Badge>
                          <h3 className="font-semibold mt-2 text-lg line-clamp-1">{order.description}</h3>
                        </div>
                        <Badge className={
                          order.status === "completed" ? "bg-green-100 text-green-800 border border-green-300" :
                          order.status === "in-progress" ? "bg-blue-100 text-blue-800 border border-blue-300" : 
                          order.status === "cancelled" ? "bg-red-100 text-red-800 border border-red-300" :
                          "bg-yellow-100 text-yellow-800 border border-yellow-300"
                        }>
                          {order.status === "in-progress" ? "In Progress" : 
                           order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      
                      {order.vehicleDetails && (
                        <p className="text-sm text-gray-600 mt-2">
                          {order.vehicleDetails.year} {order.vehicleDetails.make} {order.vehicleDetails.model}
                        </p>
                      )}
                      
                      <div className="mt-3 text-sm text-gray-500">
                        <p>Created: {formatDate(order.date)}</p>
                        {(order as WorkOrderWithVehicle).start_time && (
                          <p>Scheduled: {formatDate((order as WorkOrderWithVehicle).start_time || '')}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="list">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium">No Work Orders Found</h3>
                <p className="text-gray-500 mt-1">There are no work orders matching your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-semibold">Description</th>
                      <th className="text-left py-2 px-4 font-semibold">Vehicle</th>
                      <th className="text-left py-2 px-4 font-semibold">Status</th>
                      <th className="text-left py-2 px-4 font-semibold">Date</th>
                      <th className="text-left py-2 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{order.description}</td>
                        <td className="py-3 px-4">
                          {order.vehicleDetails && (
                            <span>{order.vehicleDetails.year} {order.vehicleDetails.make} {order.vehicleDetails.model}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={
                            order.status === "completed" ? "bg-green-100 text-green-800 border border-green-300" :
                            order.status === "in-progress" ? "bg-blue-100 text-blue-800 border border-blue-300" : 
                            order.status === "cancelled" ? "bg-red-100 text-red-800 border border-red-300" :
                            "bg-yellow-100 text-yellow-800 border border-yellow-300"
                          }>
                            {order.status === "in-progress" ? "In Progress" : 
                            order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {formatDate((order as WorkOrderWithVehicle).start_time || order.date)}
                        </td>
                        <td className="py-3 px-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenDetails(order)}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Work Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Work Order Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-4">
                  <h2 className="text-xl font-semibold">{selectedOrder.description}</h2>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">Status</label>
                  <div>
                    <Badge className={
                      selectedOrder.status === "completed" ? "bg-green-100 text-green-800 border border-green-300" :
                      selectedOrder.status === "in-progress" ? "bg-blue-100 text-blue-800 border border-blue-300" : 
                      selectedOrder.status === "cancelled" ? "bg-red-100 text-red-800 border border-red-300" :
                      "bg-yellow-100 text-yellow-800 border border-yellow-300"
                    }>
                      {selectedOrder.status === "in-progress" ? "In Progress" : 
                       selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">Priority</label>
                  <div>
                    <Badge variant="outline" className={priorityMap[selectedOrder.priority].classes}>
                      {priorityMap[selectedOrder.priority].label}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">Created Date</label>
                  <p>{formatDate(selectedOrder.date)}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">Scheduled Date</label>
                  <p>{formatDate((selectedOrder as WorkOrderWithVehicle).start_time || '')}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">Location</label>
                  <p>{selectedOrder.location || 'Not specified'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">Technician</label>
                  <p>{selectedOrder.technician || 'Not assigned'}</p>
                </div>
                <div className="col-span-4">
                  <label className="text-sm text-gray-500">Vehicle</label>
                  {selectedOrder.vehicleDetails && (
                    <p>{selectedOrder.vehicleDetails.year} {selectedOrder.vehicleDetails.make} {selectedOrder.vehicleDetails.model}</p>
                  )}
                </div>
                <div className="col-span-4">
                  <label className="text-sm text-gray-500">Notes</label>
                  <p className="text-sm">{selectedOrder.notes || 'No notes available'}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setSelectedOrder(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
