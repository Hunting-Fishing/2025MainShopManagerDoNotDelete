
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Car, FileText, Calendar, ClipboardList, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<any | null>(null);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicleData = async () => {
      setLoading(true);
      try {
        // Fetch vehicle details
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', id)
          .single();

        if (vehicleError) {
          throw vehicleError;
        }

        if (vehicleData) {
          setVehicle(vehicleData);

          // Fetch related work orders
          const { data: workOrderData, error: workOrderError } = await supabase
            .from('work_orders')
            .select('*')
            .eq('vehicle_id', id)
            .order('created_at', { ascending: false });

          if (workOrderError) {
            throw workOrderError;
          }

          if (workOrderData) {
            setWorkOrders(workOrderData);
          }
        } else {
          toast({
            title: "Vehicle Not Found",
            description: "Could not retrieve vehicle details.",
            variant: "destructive",
          });
          navigate('/customer-portal');
        }
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
        toast({
          title: "Error",
          description: "Failed to load vehicle details.",
          variant: "destructive",
        });
        navigate('/customer-portal');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p>Loading vehicle details...</p>
      </div>
    );
  }

  if (!vehicle) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <Button onClick={() => navigate('/customer-portal')} className="mb-4" variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Car className="h-6 w-6 text-blue-600" />
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h1>
        {vehicle.license_plate && (
          <p className="text-slate-600 mt-1">License Plate: {vehicle.license_plate}</p>
        )}
      </div>
      
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Vehicle Details</TabsTrigger>
          <TabsTrigger value="history">Service History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Make</p>
                <p>{vehicle.make || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-500">Model</p>
                <p>{vehicle.model || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-500">Year</p>
                <p>{vehicle.year || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-500">VIN</p>
                <p>{vehicle.vin || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-500">Color</p>
                <p>{vehicle.color || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-500">License Plate</p>
                <p>{vehicle.license_plate || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
          
          {vehicle.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{vehicle.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service History</CardTitle>
            </CardHeader>
            <CardContent>
              {workOrders.length === 0 ? (
                <p className="text-slate-500 italic">No service history found for this vehicle.</p>
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
                      
                      <div className="flex items-center text-sm text-slate-500 mt-2">
                        <Clock className="h-3 w-3 mr-1" />
                        {order.created_at ? format(new Date(order.created_at), 'MMM d, yyyy') : 'Unknown date'}
                      </div>
                      
                      {order.notes && (
                        <p className="text-sm text-slate-500 mt-1 truncate">{order.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
