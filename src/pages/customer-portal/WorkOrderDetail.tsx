
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { WorkOrder } from '@/types/workOrder';
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
  Calendar,
  Clock, 
  ClipboardList,
  FileText,
  MapPin,
  User,
  Wrench
} from 'lucide-react';
import { format } from 'date-fns';

const WorkOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicleDetails, setVehicleDetails] = useState<any | null>(null);

  useEffect(() => {
    const fetchWorkOrderDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch work order data
        const { data: orderData, error: orderError } = await supabase
          .from('work_orders')
          .select(`
            *,
            customers (
              id,
              first_name,
              last_name,
              email,
              phone
            )
          `)
          .eq('id', id)
          .single();

        if (orderError) {
          throw orderError;
        }
        
        if (!orderData) {
          throw new Error('Work order not found');
        }
        
        // Format the work order data to match our type
        const formattedWorkOrder: WorkOrder = {
          id: orderData.id,
          customer: orderData.customers ? `${orderData.customers.first_name} ${orderData.customers.last_name}` : 'Unknown Customer',
          customer_id: orderData.customer_id,
          description: orderData.description || '',
          status: orderData.status || 'pending',
          priority: orderData.priority || 'medium',
          technician: orderData.technician || 'Not Assigned',
          technician_id: orderData.technician_id,
          date: orderData.created_at,
          dueDate: orderData.due_date || '',
          location: orderData.location || '',
          notes: orderData.notes || '',
          vehicleId: orderData.vehicle_id,
          createdAt: orderData.created_at,
          inventoryItems: [],
          timeEntries: []
        };
        
        setWorkOrder(formattedWorkOrder);
        
        // If there's a vehicle associated with this work order, fetch its details
        if (orderData.vehicle_id) {
          const { data: vehicleData, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', orderData.vehicle_id)
            .single();
            
          if (!vehicleError && vehicleData) {
            setVehicleDetails(vehicleData);
          }
        }
      } catch (err: any) {
        console.error("Error fetching work order details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-40">
              <p>Loading work order details...</p>
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
              <p className="text-red-500 mb-4">Error loading work order: {error}</p>
              <Button asChild>
                <Link to="/customer-portal">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col justify-center items-center h-40">
              <p className="mb-4">Work order not found</p>
              <Button asChild>
                <Link to="/customer-portal">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return "No date provided";
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link to="/customer-portal/work-orders">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Work Orders
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              Work Order #{workOrder.id.substring(0, 8)}
            </CardTitle>
            <Badge 
              className={
                workOrder.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-300' :
                workOrder.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                workOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                'bg-red-100 text-red-800 border border-red-300'
              }
            >
              {workOrder.status}
            </Badge>
          </div>
          <p className="text-slate-500 mt-2">{workOrder.description}</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-medium mb-3">Work Order Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-indigo-500 mr-3" />
                  <div>
                    <p className="text-sm text-slate-500">Date Created</p>
                    <p>{workOrder.createdAt ? formatDate(workOrder.createdAt) : "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-indigo-500 mr-3" />
                  <div>
                    <p className="text-sm text-slate-500">Due Date</p>
                    <p>{workOrder.dueDate ? formatDate(workOrder.dueDate) : "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <User className="h-5 w-5 text-indigo-500 mr-3" />
                  <div>
                    <p className="text-sm text-slate-500">Technician</p>
                    <p>{workOrder.technician}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-indigo-500 mr-3" />
                  <div>
                    <p className="text-sm text-slate-500">Location</p>
                    <p>{workOrder.location || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {vehicleDetails && (
              <div>
                <h3 className="text-lg font-medium mb-3">Vehicle Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Wrench className="h-5 w-5 text-indigo-500 mr-3" />
                    <div>
                      <p className="text-sm text-slate-500">Vehicle</p>
                      <p>
                        {vehicleDetails.year} {vehicleDetails.make} {vehicleDetails.model} {vehicleDetails.trim || ''}
                      </p>
                    </div>
                  </div>
                  {vehicleDetails.vin && (
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-indigo-500 mr-3" />
                      <div>
                        <p className="text-sm text-slate-500">VIN</p>
                        <p>{vehicleDetails.vin}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">
                <ClipboardList className="mr-2 h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="history">
                <Clock className="mr-2 h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-3">Work Order Notes</h3>
                  {workOrder.notes ? (
                    <p className="whitespace-pre-line">{workOrder.notes}</p>
                  ) : (
                    <p className="text-slate-500 italic">No notes available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-4 text-slate-500">
                    <p>Work order status history will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkOrderDetail;
