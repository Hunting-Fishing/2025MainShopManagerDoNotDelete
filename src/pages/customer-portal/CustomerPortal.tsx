import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthUser } from '@/hooks/useAuthUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, Calendar, MessageSquare, Car, FileText, CreditCard, Bell } from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderNotifications } from '@/components/customer-portal/WorkOrderNotifications';

const CustomerPortal: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useAuthUser();
  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerId = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('customers')
          .select('id')
          .eq('auth_user_id', userId)
          .single();

        if (error) {
          console.error('Error fetching customer ID:', error);
          return;
        }

        if (data?.id) {
          setCustomerId(data.id);
        }
      } catch (error) {
        console.error('Error in fetchCustomerId:', error);
      }
    };

    fetchCustomerId();
  }, [userId]);

  useEffect(() => {
    if (!customerId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch customer info
        const { data: customerData } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .single();

        if (customerData) {
          setCustomerInfo(customerData);
        }

        // Fetch work orders
        const { data: workOrdersData } = await supabase
          .from('work_orders')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (workOrdersData) {
          setWorkOrders(workOrdersData);
        }

        // Fetch vehicles
        const { data: vehiclesData } = await supabase
          .from('vehicles')
          .select('*')
          .eq('customer_id', customerId);

        if (vehiclesData) {
          setVehicles(vehiclesData);
        }

        // Fetch appointments
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select('*')
          .eq('customer_id', customerId)
          .order('date', { ascending: true })
          .limit(3);

        if (appointmentsData) {
          setAppointments(appointmentsData);
        }

        // Fetch notifications
        const { data: notificationsData } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient', customerId)
          .order('timestamp', { ascending: false })
          .limit(5);

        if (notificationsData) {
          setNotifications(notificationsData);
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {customerInfo?.first_name || 'Customer'}
        </h1>
        <p className="text-slate-600">
          View and manage your service information
        </p>
      </div>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
          <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-800 border border-indigo-200">
            Overview
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 border border-blue-200">
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="appointments" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 border border-emerald-200">
            Appointments
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800 border border-purple-200">
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Work Orders and Notifications Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Work Orders Summary - Takes 2/3 width on large screens */}
            <Card className="lg:col-span-2">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-indigo-600" />
                      Recent Work Orders
                    </CardTitle>
                    <CardDescription>Your recent service history</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/customer-portal/work-orders')}
                    className="border-indigo-300 hover:bg-indigo-50"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {workOrders.length === 0 ? (
                  <p className="text-slate-500 italic">No recent work orders found</p>
                ) : (
                  <div className="space-y-4">
                    {workOrders.map((order) => (
                      <div 
                        key={order.id} 
                        className="p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 cursor-pointer"
                        onClick={() => navigate(`/customer-portal/work-orders/${order.id}`)}
                      >
                        <div className="flex justify-between">
                          <p className="font-semibold">{order.description}</p>
                          <Badge 
                            className={`
                              ${order.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                                order.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                'bg-red-100 text-red-800 border-red-300'}
                              border
                            `}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {order.created_at ? format(new Date(order.created_at), 'MMM d, yyyy') : 'Unknown date'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications - Takes 1/3 width on large screens */}
            <div className="lg:col-span-1">
              {customerId && <WorkOrderNotifications customerId={customerId} />}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-500">Your Vehicles</div>
                    <div className="text-2xl font-bold">{vehicles.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <Calendar className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-500">Upcoming Appointments</div>
                    <div className="text-2xl font-bold">{appointments.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Bell className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-500">New Notifications</div>
                    <div className="text-2xl font-bold">
                      {notifications.filter(n => !n.read).length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50">
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                Your Vehicles
              </CardTitle>
              <CardDescription>Manage your registered vehicles</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {vehicles.length === 0 ? (
                <p className="text-slate-500 italic">No vehicles found</p>
              ) : (
                <div className="space-y-4">
                  {vehicles.map((vehicle) => (
                    <div 
                      key={vehicle.id} 
                      className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-slate-500 mt-1">
                            {vehicle.license_plate && `License Plate: ${vehicle.license_plate}`}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('/customer-portal/vehicles/' + vehicle.id)}
                          className="border-blue-300 hover:bg-blue-50 text-blue-700"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    Your Appointments
                  </CardTitle>
                  <CardDescription>Upcoming scheduled services</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/customer-portal/appointments')}
                  className="border-emerald-300 hover:bg-emerald-50"
                >
                  Schedule New
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {appointments.length === 0 ? (
                <p className="text-slate-500 italic">No upcoming appointments</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div 
                      key={appointment.id} 
                      className="p-4 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">
                            {appointment.date && format(new Date(appointment.date), 'EEEE, MMM d, yyyy')}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            {appointment.date && format(new Date(appointment.date), 'h:mm a')} • {appointment.status}
                          </p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {customerId && <WorkOrderNotifications customerId={customerId} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerPortal;
