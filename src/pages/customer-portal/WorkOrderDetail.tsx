
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderChat } from '@/components/customer-portal/WorkOrderChat';
import { format } from 'date-fns';

// Mock data for the customer portal work order detail
const mockWorkOrder: WorkOrder = {
  id: "wo-12345-abcde",
  customer: "John Doe",
  description: "Oil change and tire rotation",
  status: "in-progress",
  priority: "medium",
  technician: "Mike Smith",
  date: new Date().toISOString(),
  dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
  location: "Main Shop",
  notes: "Customer requested synthetic oil",
  inventoryItems: [
    {
      id: "item1",
      name: "Synthetic Oil",
      sku: "SYN-5W30",
      category: "Fluids",
      quantity: 5,
      unitPrice: 9.99
    },
    {
      id: "item2",
      name: "Oil Filter",
      sku: "OF-1234",
      category: "Filters",
      quantity: 1,
      unitPrice: 12.99
    }
  ],
  timeEntries: [
    {
      id: "te1",
      employeeId: "emp1",
      employeeName: "Mike Smith",
      startTime: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(),
      endTime: null,
      duration: 120,
      billable: true
    }
  ],
  totalBillableTime: 2,
  createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
  lastUpdatedAt: new Date().toISOString(),
  startTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
  endTime: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
  vehicleId: "v-12345",
  vehicle_make: "Toyota",
  vehicle_model: "Camry",
  total_cost: 89.99,
  vehicleDetails: {
    make: "Toyota",
    model: "Camry",
    year: "2019",
    odometer: "45,000 miles",
    licensePlate: "ABC123"
  }
};

// Status mapping for UI colors
const statusColors: Record<string, string> = {
  "pending": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
  "completed": "bg-green-100 text-green-800 border-green-300",
  "cancelled": "bg-red-100 text-red-800 border-red-300"
};

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    // Simulate API fetch with a small delay
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, fetch from API using the ID
        await new Promise(resolve => setTimeout(resolve, 800));
        setWorkOrder(mockWorkOrder);
      } catch (error) {
        console.error("Error fetching work order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-gray-500">Loading work order details...</div>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Work Order Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the work order you're looking for.</p>
          <Button asChild>
            <Link to="/customer-portal/work-orders">Return to All Work Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link to="/customer-portal/work-orders" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Back to All Work Orders
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Work Order #{id?.substring(0, 8)}</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="updates">Progress</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Work Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm border ${statusColors[workOrder.status]}`}>
                    {workOrder.status === 'in-progress' ? 'In Progress' : 
                     workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="text-gray-900">{workOrder.description}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                    <p className="text-gray-900">{workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created Date</h3>
                    <p className="text-gray-900">{format(new Date(workOrder.date), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Expected Completion</h3>
                    <p className="text-gray-900">{format(new Date(workOrder.dueDate), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Assigned Technician</h3>
                    <p className="text-gray-900">{workOrder.technician}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="text-gray-900">{workOrder.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Vehicle</h3>
                  <p className="text-gray-900">
                    {workOrder.vehicleDetails?.year} {workOrder.vehicleDetails?.make} {workOrder.vehicleDetails?.model}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">License Plate</h3>
                  <p className="text-gray-900">{workOrder.vehicleDetails?.licensePlate}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Odometer</h3>
                  <p className="text-gray-900">{workOrder.vehicleDetails?.odometer}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Parts and Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">Item</th>
                        <th className="px-4 py-2 text-left">SKU</th>
                        <th className="px-4 py-2 text-left">Category</th>
                        <th className="px-4 py-2 text-right">Quantity</th>
                        <th className="px-4 py-2 text-right">Price</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workOrder.inventoryItems?.map(item => (
                        <tr key={item.id} className="border-b">
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2">{item.sku}</td>
                          <td className="px-4 py-2">{item.category}</td>
                          <td className="px-4 py-2 text-right">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Cost</div>
                  <div className="text-xl font-bold">${workOrder.total_cost?.toFixed(2)}</div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="updates" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Work Order Progress</CardTitle>
              <CardDescription>Track the status of your service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">✓</div>
                  <div className="ml-4">
                    <h3 className="font-medium">Order Created</h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(workOrder.createdAt || ''), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">⋯</div>
                  <div className="ml-4">
                    <h3 className="font-medium">Work Started</h3>
                    <p className="text-sm text-gray-500">
                      {workOrder.startTime ? format(new Date(workOrder.startTime), 'MMM d, yyyy h:mm a') : 'Not started yet'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center opacity-50">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white">⋯</div>
                  <div className="ml-4">
                    <h3 className="font-medium">Work Completed</h3>
                    <p className="text-sm text-gray-500">
                      {workOrder.endTime ? format(new Date(workOrder.endTime), 'MMM d, yyyy h:mm a') : 'Pending completion'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chat" className="mt-4">
          <WorkOrderChat workOrderId={workOrder.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
