
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardList, 
  Car, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Settings, 
  Activity, 
  MessageCircle, 
  Bell,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

type CustomerVehicle = {
  id: string;
  year: number;
  make: string;
  model: string;
  last_service_date: string | null;
};

type WorkOrder = {
  id: string;
  description: string;
  status: string;
  created_at: string;
  unread_messages?: number;
};

type ServiceReminder = {
  id: string;
  title: string;
  due_date: string;
  priority: string;
  vehicle_id: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
  };
};

export default function CustomerPortal() {
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        // Get the current user
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          throw new Error('Not authenticated');
        }
        
        // Get the customer record
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('id, first_name, last_name')
          .eq('email', userData.user.email)
          .single();
        
        if (customerError || !customerData) {
          throw new Error('Customer record not found');
        }
        
        setCustomerName(`${customerData.first_name} ${customerData.last_name}`);
        
        // Fetch customer's vehicles
        const { data: vehiclesData } = await supabase
          .from('vehicles')
          .select('*')
          .eq('customer_id', customerData.id)
          .order('created_at', { ascending: false });
        
        setVehicles(vehiclesData || []);
        
        // Fetch customer's work orders
        const { data: ordersData } = await supabase
          .from('work_orders')
          .select('*')
          .eq('customer_id', customerData.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        // Fetch unread message counts
        let totalUnread = 0;
        const ordersWithMessages = await Promise.all((ordersData || []).map(async (order) => {
          // Find the chat room for this work order
          const { data: roomData } = await supabase
            .from('chat_rooms')
            .select('id')
            .eq('work_order_id', order.id)
            .limit(1);
            
          let unreadCount = 0;
          if (roomData && roomData.length > 0) {
            // Count unread messages
            const { count } = await supabase
              .from('chat_messages')
              .select('id', { count: 'exact', head: true })
              .eq('room_id', roomData[0].id)
              .eq('is_read', false)
              .neq('sender_id', customerData.id);
              
            unreadCount = count || 0;
            totalUnread += unreadCount;
          }
          
          return {
            ...order,
            unread_messages: unreadCount
          };
        }));
        
        setWorkOrders(ordersWithMessages || []);
        setTotalUnreadMessages(totalUnread);
        
        // Fetch service reminders
        const { data: remindersData } = await supabase
          .from('service_reminders')
          .select('*, vehicle:vehicle_id(make, model, year)')
          .eq('customer_id', customerData.id)
          .gte('due_date', new Date().toISOString().split('T')[0])
          .order('due_date', { ascending: true })
          .limit(5);
          
        setReminders(remindersData || []);
      } catch (error) {
        console.error('Error loading customer data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomerData();
  }, []);
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'in-progress':
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getReminderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome, {customerName}</h1>
        <p className="text-gray-500">Here's an overview of your vehicles and services</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Car className="h-5 w-5 mr-2" />
                My Vehicles
              </div>
              <Badge variant="outline">{vehicles.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-gray-500">{vehicles.length} vehicles registered to your account</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link to="/customer-portal/vehicles">
                <span>View All Vehicles</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <ClipboardList className="h-5 w-5 mr-2" />
                Work Orders
              </div>
              <Badge variant="outline">{workOrders.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-gray-500">
              {workOrders.filter(wo => wo.status === 'in-progress' || wo.status === 'in_progress').length} active,&nbsp;
              {workOrders.filter(wo => wo.status === 'pending').length} pending
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link to="/customer-portal/work-orders">
                <span>View Work Orders</span>
                {totalUnreadMessages > 0 && (
                  <Badge variant="destructive" className="ml-2">{totalUnreadMessages}</Badge>
                )}
                <ChevronRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Reminders
              </div>
              <Badge variant="outline">{reminders.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            {reminders.length > 0 ? (
              <p className="text-sm text-gray-500">
                Next service reminder: {formatDate(reminders[0].due_date)}
              </p>
            ) : (
              <p className="text-sm text-gray-500">No upcoming service reminders</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link to="/customer-portal/reminders">
                <span>View All Reminders</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs defaultValue="workorders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workorders" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span>Recent Work Orders</span>
            {totalUnreadMessages > 0 && (
              <Badge variant="destructive">{totalUnreadMessages}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            <span>My Vehicles</span>
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Upcoming Reminders</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="workorders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Work Orders</CardTitle>
              <CardDescription>
                Your recent service history and work orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workOrders.length === 0 ? (
                <div className="text-center py-10">
                  <ClipboardList className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No Work Orders</h3>
                  <p className="mt-2 text-gray-500">You don't have any work orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workOrders.slice(0, 4).map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">#{order.id.substring(0, 8)}</h4>
                          {getStatusBadge(order.status)}
                          {(order.unread_messages || 0) > 0 && (
                            <Badge className="bg-red-500 text-white">{order.unread_messages}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{order.description}</p>
                        <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/customer-portal/work-orders/${order.id}`}>
                          <span>View</span>
                          {(order.unread_messages || 0) > 0 && (
                            <MessageCircle className="ml-1 h-3 w-3 text-red-500" />
                          )}
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {workOrders.length > 0 && (
              <CardFooter>
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/customer-portal/work-orders">View All Work Orders</Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>My Vehicles</CardTitle>
              <CardDescription>
                Vehicles registered to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vehicles.length === 0 ? (
                <div className="text-center py-10">
                  <Car className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No Vehicles</h3>
                  <p className="mt-2 text-gray-500">You don't have any vehicles registered yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vehicles.slice(0, 4).map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-1">
                        <h4 className="font-medium">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Last serviced: {formatDate(vehicle.last_service_date)}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/customer-portal/vehicles/${vehicle.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {vehicles.length > 0 && (
              <CardFooter>
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/customer-portal/vehicles">View All Vehicles</Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="reminders">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Service Reminders</CardTitle>
              <CardDescription>
                Scheduled maintenance and service reminders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reminders.length === 0 ? (
                <div className="text-center py-10">
                  <Bell className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No Reminders</h3>
                  <p className="mt-2 text-gray-500">You don't have any upcoming service reminders.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reminders.slice(0, 4).map((reminder) => (
                    <div key={reminder.id} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{reminder.title}</h4>
                          {getReminderPriorityBadge(reminder.priority)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {reminder.vehicle && (
                            `${reminder.vehicle.year} ${reminder.vehicle.make} ${reminder.vehicle.model}`
                          )}
                        </p>
                        <p className="text-xs text-gray-400">Due: {formatDate(reminder.due_date)}</p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/customer-portal/reminders/${reminder.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {reminders.length > 0 && (
              <CardFooter>
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/customer-portal/reminders">View All Reminders</Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
