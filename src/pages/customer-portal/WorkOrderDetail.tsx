
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clipboard, Calendar, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrder } from '@/types/workOrder';
import { Badge } from '@/components/ui/badge';
import WorkOrderChat from '@/components/customer-portal/WorkOrderChat';

const statusColors: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
  'completed': 'bg-green-100 text-green-800 border-green-300',
  'cancelled': 'bg-red-100 text-red-800 border-red-300'
};

export default function CustomerWorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const customer = {
    id: 'cust_123',  // This would typically come from auth context
    name: 'John Doe' // This would typically come from auth context
  };
  
  const shopName = "Main Service Center"; // This would typically be fetched from shop settings
  
  // Mock data for demonstration - in a real app, you would fetch this from an API
  useEffect(() => {
    const fetchWorkOrder = async () => {
      setLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          const mockWorkOrder: WorkOrder = {
            id: id || 'wo_123',
            customer_id: 'cust_123',
            customer: 'John Doe',
            description: 'Oil change and tire rotation',
            status: 'in-progress',
            priority: 'medium',
            technician_id: 'tech_456',
            technician: 'Alex Technician',
            date: new Date().toISOString(),
            dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            location: 'Main Service Bay',
            notes: 'Customer requested synthetic oil',
            inventoryItems: [
              {
                id: 'item_1',
                name: 'Synthetic Oil',
                sku: 'OIL-SYN-5W30',
                category: 'Fluids',
                quantity: 1,
                unitPrice: 49.99
              },
              {
                id: 'item_2',
                name: 'Oil Filter',
                sku: 'FILT-OIL-123',
                category: 'Filters',
                quantity: 1,
                unitPrice: 12.99
              }
            ],
            timeEntries: [
              {
                id: 'time_1',
                employeeId: 'tech_456',
                employeeName: 'Alex Technician',
                startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                endTime: new Date().toISOString(),
                duration: 60, // minutes
                billable: true,
                notes: 'Performed oil change'
              }
            ],
            totalBillableTime: 60,
            lastUpdatedAt: new Date().toISOString(),
            start_time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            end_time: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
          };
          setWorkOrder(mockWorkOrder);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching work order:', error);
        setLoading(false);
      }
    };

    fetchWorkOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading work order details...</p>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/customer-portal/work-orders')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Work Orders
        </Button>
        
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Work Order Not Found</h2>
          <p className="text-slate-600 mb-4">The work order you are looking for does not exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/customer-portal/work-orders')}>
            View All Work Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/customer-portal/work-orders')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Work Orders
      </Button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">
              Work Order #{workOrder.id.substring(0, 8)}
            </h1>
            <p className="text-slate-600 mb-4">{workOrder.description}</p>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge className={`${statusColors[workOrder.status]} border px-3 py-1 text-sm font-medium`}>
                {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
              </Badge>
              
              <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
                Due: {new Date(workOrder.dueDate).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="details">
            <Clipboard className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="communication">
            <MessageSquare className="h-4 w-4 mr-2" />
            Communication
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Service Description</dt>
                    <dd className="text-base text-slate-900 mt-1">{workOrder.description}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Service Date</dt>
                    <dd className="text-base text-slate-900 mt-1">{new Date(workOrder.date).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Estimated Completion</dt>
                    <dd className="text-base text-slate-900 mt-1">{new Date(workOrder.dueDate).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Location</dt>
                    <dd className="text-base text-slate-900 mt-1">{workOrder.location}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parts & Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workOrder.inventoryItems.map(item => (
                    <div key={item.id} className="border-b pb-3 border-slate-200 last:border-0">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.name}</span>
                        <span className="font-medium">${item.unitPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-500 mt-1">
                        <span>SKU: {item.sku}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}

                  <div className="mt-4 pt-2 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span className="font-medium">Labor</span>
                      <span className="font-medium">${(workOrder.totalBillableTime / 60 * 95).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500 mt-1">
                      <span>{workOrder.totalBillableTime} minutes</span>
                      <span>@ $95/hr</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-200">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Estimated Total</span>
                      <span>${(
                        workOrder.inventoryItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0) + 
                        workOrder.totalBillableTime / 60 * 95
                      ).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Service Schedule</CardTitle>
              <CardDescription>Current status and timing for your service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-slate-900">Current Status</h3>
                  <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                      <span className="font-medium">{workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-slate-900">Service Timeline</h3>
                  <div className="mt-2 border rounded-md">
                    <div className="flex border-b p-3">
                      <div className="w-32 text-slate-500">Started</div>
                      <div>{new Date(workOrder.start_time).toLocaleTimeString()} on {new Date(workOrder.start_time).toLocaleDateString()}</div>
                    </div>
                    <div className="flex border-b p-3">
                      <div className="w-32 text-slate-500">Expected End</div>
                      <div>{new Date(workOrder.end_time).toLocaleTimeString()} on {new Date(workOrder.end_time).toLocaleDateString()}</div>
                    </div>
                    <div className="flex p-3">
                      <div className="w-32 text-slate-500">Technician</div>
                      <div>{workOrder.technician}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle>Customer Communication</CardTitle>
              <CardDescription>Message directly with our service team</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkOrderChat 
                workOrderId={workOrder.id}
                customerId={customer.id}
                customerName={customer.name}
                shopName={shopName}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
