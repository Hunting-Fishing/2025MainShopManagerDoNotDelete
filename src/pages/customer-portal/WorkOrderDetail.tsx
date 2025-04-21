
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  ClipboardList, 
  User, 
  Car, 
  Wrench, 
  MessageCircle, 
  CircleCheck 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { WorkOrderChat } from '@/components/customer-portal/WorkOrderChat';
import { format } from 'date-fns';

// Define type for work order from database
interface WorkOrderDetails {
  id: string;
  description: string;
  status: string;
  created_at: string;
  service_type: string;
  total_cost: number | null;
  technician_id: string | null;
  technician_name?: string;
  customer_id: string;
  vehicle_id: string | null;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  estimated_hours: number | null;
  start_time: string | null;
  end_time: string | null;
}

export default function CustomerWorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<{ id: string; first_name: string; last_name: string } | null>(null);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const fetchWorkOrderDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch work order details
        const { data: orderData, error: orderError } = await supabase
          .from('work_orders')
          .select(`
            *,
            technicians:technician_id(first_name, last_name),
            vehicles:vehicle_id(make, model, year)
          `)
          .eq('id', id)
          .single();
        
        if (orderError) throw orderError;
        if (!orderData) throw new Error('Work order not found');
        
        // Fetch customer details
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: customerData } = await supabase
            .from('customers')
            .select('id, first_name, last_name')
            .eq('id', orderData.customer_id)
            .single();
          
          setCustomer(customerData);
          
          // Calculate progress based on status
          switch (orderData.status) {
            case 'pending':
              setProgress(10);
              break;
            case 'in-progress':
            case 'in_progress':
              setProgress(50);
              break;
            case 'completed':
              setProgress(100);
              break;
            default:
              setProgress(0);
          }
          
          // Format work order data
          setWorkOrder({
            ...orderData,
            technician_name: orderData.technicians ? 
              `${orderData.technicians.first_name} ${orderData.technicians.last_name}` : 
              'Unassigned',
            vehicle_make: orderData.vehicles?.make,
            vehicle_model: orderData.vehicles?.model,
            vehicle_year: orderData.vehicles?.year
          });
        }
      } catch (error: any) {
        console.error('Error loading work order:', error);
        toast({
          title: 'Error',
          description: 'Could not load work order details',
          variant: 'destructive',
        });
        navigate('/customer-portal/work-orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkOrderDetails();
  }, [id, navigate]);
  
  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
    } catch {
      return 'Invalid date';
    }
  };
  
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'TBD';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'in-progress':
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Work Order Not Found</CardTitle>
            <CardDescription>
              The requested work order could not be found or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/customer-portal/work-orders')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Work Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/customer-portal/work-orders')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Work Orders
        </Button>
        
        {workOrder.status === 'completed' && (
          <Badge className="px-4 py-1 bg-green-600 text-white">
            <CircleCheck className="mr-1 h-4 w-4" />
            Completed
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl mb-2">Work Order #{id?.substring(0, 8)}</CardTitle>
                  <CardDescription className="text-base">{workOrder.description}</CardDescription>
                </div>
                <div>
                  {getStatusBadge(workOrder.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {workOrder.status !== 'completed' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{formatDateTime(workOrder.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Service Type</p>
                    <p className="font-medium">{workOrder.service_type || 'General Service'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Technician</p>
                    <p className="font-medium">{workOrder.technician_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Vehicle</p>
                    <p className="font-medium">
                      {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Estimated Hours</p>
                    <p className="font-medium">{workOrder.estimated_hours || 'TBD'}</p>
                  </div>
                </div>
                
                {workOrder.total_cost !== null && (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center h-5 w-5 text-gray-500">$</span>
                    <div>
                      <p className="text-sm text-gray-500">Total Cost</p>
                      <p className="font-medium">{formatCurrency(workOrder.total_cost)}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              {workOrder.status === 'completed' ? (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-800">
                    <CircleCheck className="h-5 w-5" />
                    <p className="font-medium">This work order has been completed.</p>
                  </div>
                  <p className="mt-2 text-green-700">
                    Thank you for choosing our services. If you have any questions or need additional assistance, please contact us or use the message feature below.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Clock className="h-5 w-5" />
                    <p className="font-medium">Work Order {workOrder.status === 'pending' ? 'Pending' : 'In Progress'}</p>
                  </div>
                  <p className="mt-2 text-blue-700">
                    {workOrder.status === 'pending'
                      ? 'Your work order has been received and is awaiting scheduling. We will notify you when work begins.'
                      : 'Your vehicle is currently being serviced. You can get updates and communicate with our team using the message feature below.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {customer && (
            <WorkOrderChat 
              workOrderId={workOrder.id} 
              customerName={`${customer.first_name} ${customer.last_name}`}
              customerId={customer.id}
            />
          )}
        </div>
        
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Important Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Created Date</p>
                <p className="font-medium">{formatDateTime(workOrder.created_at)}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Start Time</p>
                <p className="font-medium">{formatDateTime(workOrder.start_time)}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Completion Date</p>
                <p className="font-medium">
                  {workOrder.end_time ? formatDateTime(workOrder.end_time) : 'To be determined'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                Need help with this work order? Contact our customer support team.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm">(555) 123-4567</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm">support@autorepair.com</p>
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => {
                  const messagesArea = document.querySelector('.WorkOrderChat');
                  if (messagesArea) {
                    messagesArea.scrollIntoView({ behavior: 'smooth' });
                  }
                }}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
