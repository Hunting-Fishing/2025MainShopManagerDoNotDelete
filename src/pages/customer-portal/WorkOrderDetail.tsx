
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkOrder } from '@/types/workOrder';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ClipboardList, FileText, MessageSquare, Clock, History, Car } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { WorkOrderProgressIndicator } from './WorkOrderProgressIndicator';

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState<string>('');

  useEffect(() => {
    const mockFetchWorkOrder = async () => {
      setLoading(true);
      try {
        // Mock data for demonstration
        // In a real app, this would be fetched from an API
        const mockWorkOrder = {
          id: id || 'wo-001',
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
        } as WorkOrder;
        
        // Calculate mock progress based on status
        let calculatedProgress = 0;
        switch(mockWorkOrder.status) {
          case 'pending': calculatedProgress = 0; break;
          case 'in-progress': calculatedProgress = 50; break;
          case 'completed': calculatedProgress = 100; break;
          default: calculatedProgress = 25;
        }
        setProgress(calculatedProgress);
        
        // Set mock estimated completion date
        const estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + 2);
        setEstimatedCompletionDate(estimatedDate.toISOString());
        
        // Mock activity history
        const mockActivities = [
          {
            id: '1',
            action: 'created',
            user_name: 'Service Advisor',
            timestamp: '2025-04-15T09:00:00Z'
          },
          {
            id: '2',
            action: 'status_changed_to_in-progress',
            user_name: 'Mike Smith',
            timestamp: '2025-04-15T10:30:00Z'
          },
          {
            id: '3',
            action: 'time_entry_added',
            user_name: 'Mike Smith',
            timestamp: '2025-04-16T14:30:00Z'
          }
        ];
        setActivities(mockActivities);
        
        setWorkOrder(mockWorkOrder);
      } catch (error) {
        console.error("Error loading work order:", error);
        toast({
          title: "Error",
          description: "Failed to load work order details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    mockFetchWorkOrder();
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
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Work Order Not Found</h2>
          <p className="text-gray-500 mb-4">
            The requested work order could not be found.
          </p>
          <Button onClick={() => navigate('/customer-portal/work-orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Work Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/customer-portal/work-orders')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Work Orders
        </Button>
        <div>
          {getStatusBadge(workOrder.status)}
        </div>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Work Order #{workOrder.id}</h1>
        <p className="text-gray-500">{workOrder.description}</p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <WorkOrderProgressIndicator 
            status={workOrder.status} 
            progress={progress} 
            estimatedCompletion={estimatedCompletionDate}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-xl font-semibold">Work Order Details</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-500">Vehicle</h3>
              <p>{workOrder.vehicleMake} {workOrder.vehicleModel}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Service Location</h3>
              <p>{workOrder.location}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Technician</h3>
              <p>{workOrder.technician}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Due Date</h3>
              <p>{new Date(workOrder.dueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Status</h3>
              <p>{workOrder.status}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Priority</h3>
              <p>{workOrder.priority}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="parts">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="parts">
            <ClipboardList className="h-4 w-4 mr-2" />
            Parts
          </TabsTrigger>
          <TabsTrigger value="labor">
            <Clock className="h-4 w-4 mr-2" />
            Labor
          </TabsTrigger>
          <TabsTrigger value="notes">
            <FileText className="h-4 w-4 mr-2" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="parts">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 py-4">No parts have been added to this work order yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="labor">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 py-4">No labor entries have been recorded yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notes">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500">{workOrder.notes || 'No notes available for this work order.'}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              {activities && activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4 pb-4 border-b">
                      <div className="min-w-[100px] text-sm text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span>{formatActivityAction(activity.action)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">by {activity.user_name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No activity history available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Message Technician</h2>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-4">
              This feature is coming soon. You will be able to communicate directly with your technician.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const formatActivityAction = (action: string): string => {
  if (action.startsWith('status_changed_to_')) {
    const status = action.replace('status_changed_to_', '');
    return `Status changed to ${status}`;
  }
  
  if (action === 'created') {
    return 'Work order created';
  }
  
  if (action === 'updated') {
    return 'Work order details updated';
  }
  
  if (action === 'time_entry_added') {
    return 'Labor time recorded';
  }
  
  return action.replace(/_/g, ' ');
};
