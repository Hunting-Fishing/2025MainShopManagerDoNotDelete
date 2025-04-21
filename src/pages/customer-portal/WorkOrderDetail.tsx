
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  MessageSquare,
  AlertOctagon,
  Clipboard
} from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkOrderProgressIndicator } from './WorkOrderProgressIndicator';

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API call to fetch work order details
    const fetchWorkOrder = async () => {
      setTimeout(() => {
        const mockWorkOrder = {
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
          notes: 'Customer requested synthetic oil and tire pressure check.',
          lastUpdatedAt: '2025-04-16T14:30:00Z',
          timeEntries: [
            { 
              id: 'te-001', 
              employeeId: 'emp-001', 
              employeeName: 'Mike Smith', 
              startTime: '2025-04-16T13:00:00Z', 
              endTime: '2025-04-16T14:30:00Z', 
              duration: 90, 
              notes: 'Changed oil and rotated tires', 
              billable: true 
            }
          ],
          inventoryItems: [
            {
              id: 'item-001',
              name: 'Synthetic Oil 5W-30',
              sku: 'OIL-5W30-SYN',
              category: 'Oils',
              quantity: 1,
              unitPrice: 49.99
            },
            {
              id: 'item-002',
              name: 'Oil Filter',
              sku: 'FLT-OIL-001',
              category: 'Filters',
              quantity: 1,
              unitPrice: 12.99
            }
          ],
          activities: [
            { 
              id: 'act-001', 
              timestamp: '2025-04-15T09:00:00Z', 
              action: 'Work order created' 
            },
            { 
              id: 'act-002', 
              timestamp: '2025-04-16T13:00:00Z', 
              action: 'Technician started working' 
            },
            { 
              id: 'act-003', 
              timestamp: '2025-04-16T14:30:00Z', 
              action: 'Oil change completed' 
            }
          ],
          estimatedCompletionDate: '2025-04-18T17:00:00Z',
          progress: 60
        } as any;
        
        setWorkOrder(mockWorkOrder);
        setLoading(false);
      }, 1000);
    };
    
    fetchWorkOrder();
  }, [id]);

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
          <p className="mt-4 text-gray-500">Loading work order details...</p>
        </div>
      </div>
    );
  }
  
  if (!workOrder) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <AlertOctagon className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="text-xl font-semibold">Work Order Not Found</h2>
            <p className="text-gray-500">The requested work order could not be found.</p>
            <Button asChild className="mt-4">
              <Link to="/customer-portal/work-orders">Back to Work Orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild size="sm">
          <Link to="/customer-portal/work-orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{workOrder.description}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-500">Work Order #{workOrder.id}</span>
            {getStatusBadge(workOrder.status)}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/customer-portal/messages?workOrderId=${workOrder.id}`}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Link>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Work Order Progress</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <WorkOrderProgressIndicator 
            status={workOrder.status} 
            progress={workOrder.progress} 
            estimatedCompletion={workOrder.estimatedCompletionDate}
          />
        </CardContent>
      </Card>
      
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="parts">Parts & Labor</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Vehicle</h3>
                    <p className="font-medium">{workOrder.vehicleMake} {workOrder.vehicleModel}</p>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Technician</h3>
                      <p>{workOrder.technician}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Location</h3>
                      <p>{workOrder.location}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date Created</h3>
                      <p>{new Date(workOrder.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                      <p>{new Date(workOrder.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clipboard className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                      <p>{workOrder.notes || "No notes provided"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="parts" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Parts</CardTitle>
            </CardHeader>
            <CardContent>
              {workOrder.inventoryItems && workOrder.inventoryItems.length > 0 ? (
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-xs text-gray-500 border-b">
                      <tr>
                        <th className="py-2 px-4 text-left font-medium">Item</th>
                        <th className="py-2 px-4 text-left font-medium">Quantity</th>
                        <th className="py-2 px-4 text-right font-medium">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workOrder.inventoryItems.map(item => (
                        <tr key={item.id} className="border-b last:border-b-0">
                          <td className="py-3 px-4">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.sku}</div>
                          </td>
                          <td className="py-3 px-4">{item.quantity}</td>
                          <td className="py-3 px-4 text-right">${item.unitPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 py-2">No parts have been added to this work order yet.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Labor</CardTitle>
            </CardHeader>
            <CardContent>
              {workOrder.timeEntries && workOrder.timeEntries.length > 0 ? (
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-xs text-gray-500 border-b">
                      <tr>
                        <th className="py-2 px-4 text-left font-medium">Technician</th>
                        <th className="py-2 px-4 text-left font-medium">Description</th>
                        <th className="py-2 px-4 text-right font-medium">Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workOrder.timeEntries.map(entry => {
                        const hours = entry.duration / 60;
                        return (
                          <tr key={entry.id} className="border-b last:border-b-0">
                            <td className="py-3 px-4">{entry.employeeName}</td>
                            <td className="py-3 px-4">{entry.notes || "No description"}</td>
                            <td className="py-3 px-4 text-right">{hours.toFixed(1)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 py-2">No labor has been recorded for this work order yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              {workOrder.activities && workOrder.activities.length > 0 ? (
                <div className="space-y-4">
                  {workOrder.activities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-4">
                      <div className="min-w-[2px] h-full bg-blue-200 rounded-full"></div>
                      <div className="space-y-1">
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 py-2">No activity has been recorded for this work order.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
