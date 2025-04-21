
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { CalendarIcon, ClipboardList, Car, MessageSquare, Bell } from 'lucide-react';
import { WorkOrderNotifications } from '@/components/customer-portal/WorkOrderNotifications';

const CustomerPortal = () => {
  const [customer, setCustomer] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      setLoading(true);
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .eq('auth_user_id', authData.user.id)
            .single();

          if (customerError) {
            throw customerError;
          }

          if (customerData) {
            setCustomer(customerData);
          } else {
            setError("No customer profile found for this user.");
          }

          // Fetch work orders for the customer
          const { data: workOrdersData, error: workOrdersError } = await supabase
            .from('work_orders')
            .select('*')
            .eq('customer_id', customerData?.id)
            .order('created_at', { ascending: false });

          if (workOrdersError) {
            throw workOrdersError;
          }

          if (workOrdersData) {
            setWorkOrders(workOrdersData);
          }
          
          // Fetch vehicles for the customer
          const { data: vehiclesData, error: vehiclesError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('customer_id', customerData?.id);
            
          if (vehiclesError) {
            throw vehiclesError;
          }
          
          if (vehiclesData) {
            setVehicles(vehiclesData);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  if (loading) {
    return <div className="p-4">Loading customer portal...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!customer) {
    return <div className="p-4">No customer data found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardTitle>Welcome, {customer.first_name}!</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-6">Here's a summary of your account and recent activity.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Link to="/customer-portal/work-orders" className="block">
                  <div className="border rounded-lg p-4 hover:border-indigo-500 hover:shadow-sm transition-all">
                    <div className="flex items-center mb-2 text-indigo-600">
                      <ClipboardList className="h-5 w-5 mr-2" />
                      <h3 className="font-medium">Work Orders</h3>
                    </div>
                    <p className="text-2xl font-bold">{workOrders.length}</p>
                    <p className="text-sm text-slate-500">Active orders</p>
                  </div>
                </Link>
                
                <Link to="/customer-portal/vehicles" className="block">
                  <div className="border rounded-lg p-4 hover:border-indigo-500 hover:shadow-sm transition-all">
                    <div className="flex items-center mb-2 text-indigo-600">
                      <Car className="h-5 w-5 mr-2" />
                      <h3 className="font-medium">Vehicles</h3>
                    </div>
                    <p className="text-2xl font-bold">{vehicles.length}</p>
                    <p className="text-sm text-slate-500">Registered</p>
                  </div>
                </Link>
                
                <Link to="/customer-portal/messages" className="block">
                  <div className="border rounded-lg p-4 hover:border-indigo-500 hover:shadow-sm transition-all">
                    <div className="flex items-center mb-2 text-indigo-600">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      <h3 className="font-medium">Messages</h3>
                    </div>
                    <p className="text-2xl font-bold">
                      <Bell className="h-5 w-5" />
                    </p>
                    <p className="text-sm text-slate-500">Contact us</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Work Orders */}
          {workOrders.length > 0 && (
            <Card>
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Work Orders</CardTitle>
                  <Button asChild size="sm">
                    <Link to="/customer-portal/work-orders">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.slice(0, 3).map((workOrder) => (
                      <TableRow key={workOrder.id}>
                        <TableCell className="font-medium">
                          <Link to={`/customer-portal/work-orders/${workOrder.id}`} className="hover:text-indigo-600 hover:underline">
                            <div className="flex items-center">
                              <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                              {workOrder.id.slice(0, 8)}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>{workOrder.description}</TableCell>
                        <TableCell>
                          {workOrder.created_at
                            ? format(new Date(workOrder.created_at), "MMM d, yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            workOrder.status === 'completed' && "bg-green-100 text-green-800 border border-green-300",
                            workOrder.status === 'in-progress' && "bg-blue-100 text-blue-800 border border-blue-300",
                            workOrder.status === 'pending' && "bg-yellow-100 text-yellow-800 border border-yellow-300",
                            workOrder.status === 'cancelled' && "bg-red-100 text-red-800 border border-red-300",
                          )}>
                            {workOrder.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Notifications */}
          <WorkOrderNotifications customerId={customer.id} />
          
          {/* Vehicles */}
          {vehicles.length > 0 && (
            <Card>
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
                <div className="flex justify-between items-center">
                  <CardTitle>Your Vehicles</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {vehicles.slice(0, 3).map(vehicle => (
                    <Link 
                      key={vehicle.id} 
                      to={`/customer-portal/vehicles/${vehicle.id}`}
                      className="block"
                    >
                      <div className="border rounded-lg p-4 hover:border-indigo-500 hover:shadow-sm transition-all">
                        <div className="flex items-start">
                          <Car className="h-5 w-5 mr-3 mt-0.5 text-indigo-600" />
                          <div>
                            <h3 className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                            <div className="text-sm text-slate-500 mt-1">
                              {vehicle.vin && <p>VIN: {vehicle.vin}</p>}
                              {vehicle.license_plate && <p>License: {vehicle.license_plate}</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                {vehicles.length > 3 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" asChild>
                      <Link to="/customer-portal/vehicles">View All Vehicles</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;
