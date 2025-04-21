
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { FileText, AlertTriangle, Clock, CheckCircle2, ArrowRight, MessageSquare } from 'lucide-react';
import { WorkOrderStatusBadge } from '@/components/workOrders/WorkOrderStatusBadge';
import { WorkOrder } from '@/types/workOrder';
import { ChatMessage } from '@/types/chat';
import { format } from 'date-fns';

export default function CustomerPortal() {
  const [loading, setLoading] = useState(true);
  const [recentWorkOrders, setRecentWorkOrders] = useState<WorkOrder[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      setLoading(true);
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;
        
        // Get profile details
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          setUserName(`${profile.first_name} ${profile.last_name}`);
        }

        // Fetch recent work orders
        const { data: workOrdersData } = await supabase
          .from('work_orders')
          .select('*, vehicles(make, model, year)')
          .eq('customer_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentWorkOrders(workOrdersData || []);
        
        // Fetch chat rooms
        const { data: chatRooms } = await supabase
          .from('chat_rooms')
          .select('id')
          .eq('type', 'work_order')
          .in('id', 
            supabase
              .from('chat_participants')
              .select('room_id')
              .eq('user_id', session.user.id)
          )
          .limit(5);
          
        if (chatRooms && chatRooms.length > 0) {
          // Get recent messages for these rooms
          const roomIds = chatRooms.map(room => room.id);
          
          const { data: messagesData } = await supabase
            .from('chat_messages')
            .select('*, chat_rooms(name, work_order_id)')
            .in('room_id', roomIds)
            .order('created_at', { ascending: false })
            .limit(10);
            
          setRecentMessages(messagesData || []);
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Customer Portal</h1>
          <p className="text-slate-500">
            Welcome back, {userName || 'valued customer'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/customer-portal/work-orders">View All Work Orders</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Recent Work Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-12 bg-slate-100 rounded"></div>
                <div className="h-12 bg-slate-100 rounded"></div>
                <div className="h-12 bg-slate-100 rounded"></div>
              </div>
            ) : recentWorkOrders.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No work orders found</AlertTitle>
                <AlertDescription>
                  You don't have any work orders in our system yet.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {recentWorkOrders.map((workOrder) => (
                  <div 
                    key={workOrder.id}
                    className="p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Link 
                          to={`/customer-portal/work-orders/${workOrder.id}`}
                          className="font-medium hover:text-blue-600 transition-colors"
                        >
                          {workOrder.service_type || 'General Service'}
                        </Link>
                        <p className="text-sm text-slate-500 mt-1">
                          {workOrder.vehicles ? (
                            `${workOrder.vehicles.year} ${workOrder.vehicles.make} ${workOrder.vehicles.model}`
                          ) : (
                            'No vehicle details'
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <WorkOrderStatusBadge status={workOrder.status} size="sm" />
                        <span className="text-xs text-slate-500">{formatDate(workOrder.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-2 flex justify-end">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/customer-portal/work-orders" className="flex items-center">
                      View all work orders 
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-12 bg-slate-100 rounded"></div>
                <div className="h-12 bg-slate-100 rounded"></div>
                <div className="h-12 bg-slate-100 rounded"></div>
              </div>
            ) : recentMessages.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No messages found</AlertTitle>
                <AlertDescription>
                  You don't have any recent messages.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((message) => (
                  <div 
                    key={message.id}
                    className="p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Link 
                          to={`/customer-portal/work-orders/${message.chat_rooms?.work_order_id}`}
                          className="font-medium hover:text-blue-600 transition-colors line-clamp-1"
                        >
                          {message.chat_rooms?.name || 'Message Thread'}
                        </Link>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                          <span className="font-medium">{message.sender_name}: </span>
                          {message.file_url ? "Shared a file" : message.content}
                        </p>
                      </div>
                      <div className="ml-3">
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Upcoming Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No scheduled maintenance</AlertTitle>
              <AlertDescription>
                You don't have any upcoming maintenance scheduled.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex flex-col h-auto py-4" asChild>
                <Link to="/customer-portal/work-orders">
                  <FileText className="h-5 w-5 mb-1" />
                  <span>View Work Orders</span>
                </Link>
              </Button>
              <Button variant="outline" className="flex flex-col h-auto py-4" disabled>
                <MessageSquare className="h-5 w-5 mb-1" />
                <span>Request Service</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
