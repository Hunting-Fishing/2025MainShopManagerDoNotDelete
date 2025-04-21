import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  Clock, 
  ChevronRight, 
  MessageSquare, 
  Bell, 
  CarIcon, 
  CalendarIcon
} from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const CustomerPortal = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user:", userError);
          return;
        }

        if (!userData?.user) {
          console.log("No user found, redirecting to signin");
          navigate('/sign-in');
          return;
        }

        const userId = userData.user.id;

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }

        setProfile(profileData);

        const { data: workOrderData, error: workOrderError } = await supabase
          .from('work_orders')
          .select(`
            *,
            vehicles (
              make,
              model,
              year
            )
          `)
          .eq('customer_id', userId)
          .order('created_at', { ascending: false });

        if (workOrderError) {
          console.error("Error fetching work orders:", workOrderError);
          return;
        }

        // Map the work order data to include vehicle details
        const workOrdersWithVehicleDetails = workOrderData.map(workOrder => ({
          ...workOrder,
          vehicleDetails: workOrder.vehicles ? {
            make: workOrder.vehicles.make,
            model: workOrder.vehicles.model,
            year: workOrder.vehicles.year
          } : null,
        }));

        setWorkOrders(workOrdersWithVehicleDetails);
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!profile) {
    return <div className="flex justify-center items-center h-screen">Profile not found.</div>;
  }

  // Fix the icon usage from Car to CarIcon
  const renderWorkOrderRow = (workOrder: WorkOrder) => {
    return (
      <div 
        key={workOrder.id} 
        className="border-b py-4 last:border-0 hover:bg-gray-50 cursor-pointer"
        onClick={() => navigate(`/customer-portal/work-orders/${workOrder.id}`)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-50 rounded-full">
              <Wrench className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium">{workOrder.description}</p>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <CarIcon className="h-3.5 w-3.5 mr-1" />
                <span>
                  {workOrder.vehicleDetails ? 
                    `${workOrder.vehicleDetails.year || ''} ${workOrder.vehicleDetails.make || ''} ${workOrder.vehicleDetails.model || ''}` : 
                    workOrder.vehicle_make && workOrder.vehicle_model ? 
                      `${workOrder.vehicle_make} ${workOrder.vehicle_model}` : 
                      'No vehicle'
                  }
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <Badge 
              className={
                workOrder.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                workOrder.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                'bg-yellow-100 text-yellow-800 border-yellow-300'
              }
            >
              {workOrder.status === 'in-progress' ? 'In Progress' : 
                workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {workOrder.createdAt ? 
                format(new Date(workOrder.createdAt), 'MMM d, yyyy') : 
                workOrder.created_at ? 
                  format(new Date(workOrder.created_at), 'MMM d, yyyy') : 
                  'Unknown date'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome, {profile.first_name}!</CardTitle>
          <CardDescription>Here's a summary of your account.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Tabs defaultValue="work-orders" className="w-full">
            <TabsList>
              <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            <TabsContent value="work-orders" className="space-y-4">
              <div className="grid gap-4">
                {workOrders.length > 0 ? (
                  workOrders.map(renderWorkOrderRow)
                ) : (
                  <div className="text-center py-6">
                    <p className="text-lg text-muted-foreground">No work orders found.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="account">
              <div className="space-y-2">
                <p className="text-lg font-semibold">Account Details</p>
                <p><strong>First Name:</strong> {profile.first_name}</p>
                <p><strong>Last Name:</strong> {profile.last_name}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <Button onClick={() => navigate('/customer-portal/profile')}>
                  Update Profile <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Last updated: {formatDistanceToNow(new Date(), { addSuffix: true })}
          </p>
          <Link to="/contact" className="text-sm text-blue-500 hover:underline">
            <MessageSquare className="inline-block h-4 w-4 mr-1 align-middle" /> Contact Support
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CustomerPortal;
