
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Car, 
  Calendar, 
  ClipboardList, 
  FileText, 
  Clock,
  Wrench
} from 'lucide-react';

const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<any | null>(null);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch vehicle data
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
          const { data: workOrdersData, error: workOrdersError } = await supabase
            .from('work_orders')
            .select('*')
            .eq('vehicle_id', vehicleData.id)
            .order('created_at', { ascending: false });
            
          if (workOrdersError) {
            throw workOrdersError;
          }
          
          if (workOrdersData) {
            setWorkOrders(workOrdersData);
          }
        }
      } catch (err: any) {
        console.error("Error fetching vehicle details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicleDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-40">
              <p>Loading vehicle details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col justify-center items-center h-40">
              <p className="text-red-500 mb-4">Error loading vehicle: {error}</p>
              <Button asChild>
                <Link to="/customer-portal">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col justify-center items-center h-40">
              <p className="mb-4">Vehicle not found</p>
              <Button asChild>
                <Link to="/customer-portal">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link to="/customer-portal">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </CardTitle>
            <Badge>
              {vehicle.vin ? 'VIN Registered' : 'No VIN'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-medium mb-3">Vehicle Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Car className="h-5 w-5 text-indigo-500 mr-3" />
                  <div>
                    <p className="text-sm text-slate-500">Make & Model</p>
                    <p>{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim || ''}</p>
                  </div>
                </div>
                {vehicle.vin && (
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-indigo-500 mr-3" />
                    <div>
                      <p className="text-sm text-slate-500">VIN</p>
                      <p>{vehicle.vin}</p>
                    </div>
                  </div>
                )}
                {vehicle.license_plate && (
                  <div className="flex items-center">
                    <Badge className="h-5 mr-3 bg-blue-100 text-blue-800 border border-blue-300">{vehicle.license_plate}</Badge>
                    <div>
                      <p className="text-sm text-slate-500">License Plate</p>
                    </div>
                  </div>
                )}
                {vehicle.color && (
                  <div className="flex items-center">
                    <div 
                      className="h-5 w-5 rounded-full border mr-3"
                      style={{ backgroundColor: vehicle.color }}
                    ></div>
                    <div>
                      <p className="text-sm text-slate-500">Color</p>
                      <p>{vehicle.color}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Service History</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-indigo-500 mr-3" />
                  <div>
                    <p className="text-sm text-slate-500">Last Service</p>
                    <p>
                      {vehicle.last_service_date 
                        ? new Date(vehicle.last_service_date).toLocaleDateString() 
                        : "No service records"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Wrench className="h-5 w-5 text-indigo-500 mr-3" />
                  <div>
                    <p className="text-sm text-slate-500">Work Orders</p>
                    <p>{workOrders.length} order{workOrders.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                {vehicle.engine && (
                  <div className="flex items-center">
                    <div className="h-5 w-5 text-indigo-500 mr-3">
                      <span className="font-bold text-sm">E</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Engine</p>
                      <p>{vehicle.engine}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="workOrders">
            <TabsList>
              <TabsTrigger value="workOrders">
                <ClipboardList className="mr-2 h-4 w-4" />
                Work Orders
              </TabsTrigger>
              <TabsTrigger value="serviceHistory">
                <Calendar className="mr-2 h-4 w-4" />
                Service History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="workOrders">
              {workOrders.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <p>No work orders found for this vehicle</p>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {workOrders.map(order => (
                    <Link 
                      key={order.id} 
                      to={`/customer-portal/work-orders/${order.id}`}
                      className="block"
                    >
                      <div className="border rounded-lg p-4 hover:border-indigo-500 hover:shadow-sm transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <ClipboardList className="h-5 w-5 mr-3 mt-0.5 text-indigo-600" />
                            <div>
                              <h3 className="font-medium">
                                {order.description || `Work Order #${order.id.slice(0, 8)}`}
                              </h3>
                              <p className="text-sm text-slate-500 mt-1">
                                {order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            className={
                              order.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-300' :
                              order.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                              'bg-red-100 text-red-800 border border-red-300'
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="serviceHistory">
              <div className="text-center py-10 text-slate-500">
                <p>Service history records will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleDetail;
