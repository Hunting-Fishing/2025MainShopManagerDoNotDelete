
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WorkOrder } from '@/types/workOrder';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CalendarCheck } from 'lucide-react';

export default function WorkOrdersList() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, this would fetch customer's work orders from the API
    // For now we'll use mock data
    const fetchWorkOrders = async () => {
      // Simulate API call
      setTimeout(() => {
        const mockWorkOrders = [
          {
            id: 'wo-001',
            customer: 'John Doe',
            description: 'Oil change and tire rotation',
            status: 'in-progress',
            priority: 'medium',
            technician: 'Mike Smith',
            date: '2025-04-15',
            dueDate: '2025-04-18',
            location: 'Bay 3',
            vehicleModel: 'Honda Civic',
            vehicleMake: 'Honda',
            lastUpdatedAt: '2025-04-16T14:30:00Z',
          },
          {
            id: 'wo-002',
            customer: 'John Doe',
            description: 'Brake pad replacement',
            status: 'pending',
            priority: 'high',
            technician: 'Sarah Johnson',
            date: '2025-04-17',
            dueDate: '2025-04-19',
            location: 'Bay 1',
            vehicleModel: 'Honda Accord',
            vehicleMake: 'Honda',
            lastUpdatedAt: '2025-04-17T09:15:00Z',
          },
          {
            id: 'wo-003',
            customer: 'John Doe',
            description: 'Engine diagnostic',
            status: 'completed',
            priority: 'medium',
            technician: 'Mike Smith',
            date: '2025-04-10',
            dueDate: '2025-04-12',
            location: 'Bay 2',
            vehicleModel: 'Honda Civic',
            vehicleMake: 'Honda',
            lastUpdatedAt: '2025-04-12T16:45:00Z',
          }
        ] as WorkOrder[];
        
        setWorkOrders(mockWorkOrders);
        setLoading(false);
      }, 1000);
    };
    
    fetchWorkOrders();
  }, []);
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300">Pending</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800 border border-blue-300">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border border-green-300">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border border-red-300">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading work orders...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Work Orders</h1>
      </div>
      
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {workOrders.filter(wo => wo.status !== 'completed' && wo.status !== 'cancelled').map(workOrder => (
              <WorkOrderCard key={workOrder.id} workOrder={workOrder} statusBadge={getStatusBadge(workOrder.status)} />
            ))}
            {workOrders.filter(wo => wo.status !== 'completed' && wo.status !== 'cancelled').length === 0 && (
              <p className="text-gray-500 col-span-2 text-center py-8">No active work orders found</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {workOrders.filter(wo => wo.status === 'completed').map(workOrder => (
              <WorkOrderCard key={workOrder.id} workOrder={workOrder} statusBadge={getStatusBadge(workOrder.status)} />
            ))}
            {workOrders.filter(wo => wo.status === 'completed').length === 0 && (
              <p className="text-gray-500 col-span-2 text-center py-8">No completed work orders found</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {workOrders.map(workOrder => (
              <WorkOrderCard key={workOrder.id} workOrder={workOrder} statusBadge={getStatusBadge(workOrder.status)} />
            ))}
            {workOrders.length === 0 && (
              <p className="text-gray-500 col-span-2 text-center py-8">No work orders found</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WorkOrderCard({ workOrder, statusBadge }: { workOrder: WorkOrder, statusBadge: React.ReactNode }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between">
          <Link to={`/customer-portal/work-orders/${workOrder.id}`} className="hover:text-blue-600 transition-colors">
            {workOrder.description}
          </Link>
          {statusBadge}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-500">{workOrder.vehicleMake} {workOrder.vehicleModel}</span>
            <span className="font-medium">#{workOrder.id}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Due: {new Date(workOrder.dueDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <CalendarCheck className="h-4 w-4" />
            <span>Last updated: {new Date(workOrder.lastUpdatedAt).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
