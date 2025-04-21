
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow, format } from 'date-fns';
import { Car, Calendar, FileText, MessageSquare, Settings, User } from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CustomerPortal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [chatRooms, setChatRooms] = useState<any[]>([]);

  useEffect(() => {
    const fetchCustomerPortalData = async () => {
      setLoading(true);
      try {
        // Get the current authenticated user
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) {
          toast({
            title: "Not Authenticated",
            description: "Please log in to access the customer portal.",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }

        // Get customer data associated with this user
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('auth_user_id', authData.user.id)
          .single();

        if (customerError || !customerData) {
          console.error("Error fetching customer data:", customerError);
          toast({
            title: "Error",
            description: "Could not find your customer record.",
            variant: "destructive",
          });
          return;
        }

        setCustomer(customerData);

        // Fetch customer's work orders
        const { data: workOrdersData, error: workOrdersError } = await supabase
          .from('work_orders')
          .select('*')
          .eq('customer_id', customerData.id)
          .order('created_at', { ascending: false });

        if (workOrdersError) {
          console.error("Error fetching work orders:", workOrdersError);
        } else {
          setWorkOrders(workOrdersData || []);
        }

        // Fetch customer's chat rooms
        const chatRoomsQuery = await supabase
          .from('chat_participants')
          .select('room_id')
          .eq('participant_id', customerData.id)
          .eq('participant_type', 'customer');

        if (chatRoomsQuery.error) {
          console.error("Error fetching chat rooms:", chatRoomsQuery.error);
        } else if (chatRoomsQuery.data && chatRoomsQuery.data.length > 0) {
          const roomIds = chatRoomsQuery.data.map(room => room.room_id);
          
          const { data: roomsData, error: roomsError } = await supabase
            .from('chat_rooms')
            .select('*')
            .in('id', roomIds);

          if (roomsError) {
            console.error("Error fetching room details:", roomsError);
          } else {
            setChatRooms(roomsData || []);
          }
        }
      } catch (error) {
        console.error("Error in customer portal data fetch:", error);
        toast({
          title: "Error",
          description: "Failed to load your customer portal data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerPortalData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p>Loading your portal...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Portal</CardTitle>
            <CardDescription>
              No customer account found. Please contact support.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const formatWorkOrderDate = (workOrder: any) => {
    if (workOrder.createdAt) {
      return format(new Date(workOrder.createdAt), 'MMM d, yyyy');
    } else if (workOrder.created_at) {
      return format(new Date(workOrder.created_at), 'MMM d, yyyy');
    }
    return 'Unknown date';
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Welcome, {customer.first_name}!</CardTitle>
          <CardDescription>
            Here's an overview of your recent activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <Car className="h-5 w-5 text-blue-600 mr-2" />
                  <CardTitle className="text-lg">Your Vehicles</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {customer.vehicles?.length || 0} vehicles registered
                </p>
                <Button variant="outline" className="mt-4 w-full" onClick={() => navigate('/customer-portal/vehicles')}>
                  View Vehicles
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-600 mr-2" />
                  <CardTitle className="text-lg">Appointments</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {customer.appointments?.length || 0} upcoming appointments
                </p>
                <Button variant="outline" className="mt-4 w-full" onClick={() => navigate('/customer-portal/appointments')}>
                  View Appointments
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-purple-600 mr-2" />
                  <CardTitle className="text-lg">Invoices</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {customer.invoices?.length || 0} invoices available
                </p>
                <Button variant="outline" className="mt-4 w-full" onClick={() => navigate('/customer-portal/invoices')}>
                  View Invoices
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders Section */}
      <Card className="mb-8">
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>Recent Work Orders</CardTitle>
            <CardDescription>
              Here are your recent service requests
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/customer-portal/work-orders')}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {workOrders.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No work orders found</p>
            ) : (
              workOrders.slice(0, 3).map((workOrder) => (
                <div
                  key={workOrder.id}
                  className="py-4 cursor-pointer hover:bg-secondary"
                  onClick={() =>
                    navigate(`/customer-portal/work-orders/${workOrder.id}`)
                  }
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{workOrder.description}</p>
                      <div className="text-sm text-muted-foreground">
                        Status: {workOrder.status}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatWorkOrderDate(workOrder)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages Section */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>
              Stay in touch with our service team
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/customer-portal/messages')}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {chatRooms.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No messages found</p>
            ) : (
              chatRooms.map((room) => (
                <div
                  key={room.id}
                  className="py-4 cursor-pointer hover:bg-secondary"
                  onClick={() =>
                    navigate(`/customer-portal/messages/${room.id}`)
                  }
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{room.name || 'Chat'}</p>
                      <div className="text-sm text-muted-foreground">
                        <MessageSquare className="h-3 w-3 inline-block mr-1" />
                        {room.last_message || 'No messages yet'}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {room.updated_at
                        ? formatDistanceToNow(new Date(room.updated_at), {
                            addSuffix: true,
                          })
                        : ''}
                    </div>
                  </div>
                </div>
              ))
            )}
            {chatRooms.length === 0 && (
              <Button 
                className="w-full mt-2" 
                variant="outline"
                onClick={() => navigate('/customer-portal/messages/new')}
              >
                Start New Conversation
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
