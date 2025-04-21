
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderChat } from '@/components/customer-portal/WorkOrderChat';

// Mock activity data for rendering
interface Activity {
  id: string;
  timestamp: string;
  action: string;
  userName: string;
}

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [progress, setProgress] = useState(0);
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<{id: string, name: string}>({id: '', name: ''});

  useEffect(() => {
    const fetchWorkOrderDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        
        // Fetch work order details
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            *,
            customers!work_orders_customer_id_fkey(id, first_name, last_name)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          setWorkOrder(data);
          
          // Set customer info for chat
          if (data.customers) {
            setCustomerInfo({
              id: data.customers.id,
              name: `${data.customers.first_name} ${data.customers.last_name}`,
            });
          }
          
          // Calculate progress based on status
          let calculatedProgress = 0;
          switch(data.status) {
            case 'pending':
              calculatedProgress = 0;
              break;
            case 'in-progress':
              calculatedProgress = 50;
              break;
            case 'completed':
              calculatedProgress = 100;
              break;
            default:
              calculatedProgress = 25;
          }
          setProgress(calculatedProgress);
          
          // Set estimated completion date (7 days from creation for this example)
          const creationDate = new Date(data.created_at);
          const estimatedDate = new Date(creationDate);
          estimatedDate.setDate(creationDate.getDate() + 7);
          setEstimatedCompletionDate(estimatedDate.toLocaleDateString());
          
          // Fetch or generate mock activities
          const mockActivities: Activity[] = [
            {
              id: '1',
              timestamp: new Date(data.created_at).toISOString(),
              action: 'Work order created',
              userName: 'System',
            },
            {
              id: '2',
              timestamp: new Date(new Date(data.created_at).getTime() + 24*60*60*1000).toISOString(),
              action: 'Diagnostic completed',
              userName: 'Technician',
            },
          ];
          
          if (data.status === 'in-progress' || data.status === 'completed') {
            mockActivities.push({
              id: '3',
              timestamp: new Date(new Date(data.created_at).getTime() + 2*24*60*60*1000).toISOString(),
              action: 'Work started',
              userName: 'Technician',
            });
          }
          
          if (data.status === 'completed') {
            mockActivities.push({
              id: '4',
              timestamp: new Date(new Date(data.created_at).getTime() + 5*24*60*60*1000).toISOString(),
              action: 'Work completed',
              userName: 'Technician',
            });
          }
          
          setActivities(mockActivities);
        }
      } catch (error) {
        console.error('Error fetching work order:', error);
        toast({
          title: 'Error',
          description: 'Could not load work order details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrderDetails();
  }, [id]);

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

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <p>Loading work order details...</p>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="p-6">
        <p>Work order not found or you do not have permission to view it.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Work Order Details</h1>
          <p className="text-gray-600">#{id?.substring(0, 8)}</p>
        </div>
        <div>
          <Badge className={`px-3 py-1 text-sm font-medium border ${getStatusColor(workOrder.status)}`}>
            {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Work Order Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span>{workOrder.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created On:</span>
                  <span>{new Date(workOrder.created_at || '').toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span>{workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Completion:</span>
                  <span>{estimatedCompletionDate || 'Not available'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Progress</h2>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-sm text-gray-600 text-center">{progress}% Complete</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
              <div className="space-y-4">
                {activities && activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="border-l-2 border-blue-500 pl-4 pb-4">
                      <p className="text-sm text-gray-600">{new Date(activity.timestamp).toLocaleString()}</p>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500">By: {activity.userName}</p>
                    </div>
                  ))
                ) : (
                  <p>No activity logged yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Chat Component */}
          {workOrder && customerInfo.id && (
            <WorkOrderChat 
              workOrderId={workOrder.id} 
              customerName={customerInfo.name}
              customerId={customerInfo.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}
