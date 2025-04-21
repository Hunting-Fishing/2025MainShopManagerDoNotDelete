
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Calendar, Wrench, Phone, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { WorkOrderChat } from '@/components/customer-portal/WorkOrderChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

interface WorkOrder {
  id: string;
  status: string;
  description: string;
  created_at: string;
  start_time?: string;
  end_time?: string;
  technician_id?: string;
  total_cost?: number;
  customer_id?: string;
  advisor_id?: string;
  service_type?: string;
  estimated_hours?: number;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface Technician {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
}

interface ShopSettings {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

const statusColorMap: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  'in-progress': 'bg-blue-100 text-blue-800 border border-blue-300',
  'completed': 'bg-green-100 text-green-800 border border-green-300',
  'cancelled': 'bg-red-100 text-red-800 border border-red-300'
};

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkOrderDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch work order
        const { data: workOrderData, error: workOrderError } = await supabase
          .from('work_orders')
          .select('*')
          .eq('id', id)
          .single();
        
        if (workOrderError) throw workOrderError;
        if (!workOrderData) throw new Error('Work order not found');
        
        setWorkOrder(workOrderData);
        
        // Fetch customer
        if (workOrderData.customer_id) {
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .eq('id', workOrderData.customer_id)
            .single();
          
          if (!customerError && customerData) {
            setCustomer(customerData);
          }
        }
        
        // Fetch technician
        if (workOrderData.technician_id) {
          const { data: technicianData, error: technicianError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, phone, email')
            .eq('id', workOrderData.technician_id)
            .single();
          
          if (!technicianError && technicianData) {
            setTechnician(technicianData);
          }
        }
        
        // Fetch shop settings
        const { data: shopData, error: shopError } = await supabase
          .from('shop_settings')
          .select('*')
          .single();
        
        if (!shopError && shopData) {
          setShopSettings(shopData);
        }
      } catch (err) {
        console.error('Error fetching work order details:', err);
        setError('Failed to load work order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <p className="text-gray-500">Loading work order details...</p>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-red-700 font-medium">Error</h2>
          <p className="text-red-600">{error || 'Work order not found'}</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => navigate('/customer-portal/work-orders')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Work Orders
          </Button>
        </div>
      </div>
    );
  }

  const getFullName = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'Not Assigned';
    return `${firstName || ''} ${lastName || ''}`.trim();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/customer-portal/work-orders')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Work Order #{id.substring(0, 8)}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Work Order Details</h2>
                  <div className="text-sm text-gray-500">
                    Created on {formatDate(workOrder.created_at)}
                  </div>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColorMap[workOrder.status] || 'bg-gray-100'}`}>
                    {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Service Type</h3>
                  <p>{workOrder.service_type || 'General Service'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estimated Hours</h3>
                  <p>{workOrder.estimated_hours || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Start Time</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(workOrder.start_time)}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estimated Completion</h3>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(workOrder.end_time)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{workOrder.description || 'No description provided'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Assigned Technician</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Wrench className="h-4 w-4 text-gray-400" />
                    <span>{technician ? getFullName(technician.first_name, technician.last_name) : 'Not assigned'}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Service Center</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{shopSettings?.name || 'Auto Shop'}</span>
                    {shopSettings?.phone && <span>• {shopSettings.phone}</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="chat">
                <TabsList className="w-full rounded-none border-b bg-transparent">
                  <TabsTrigger className="flex-1 data-[state=active]:bg-transparent" value="chat">
                    Chat
                  </TabsTrigger>
                  <TabsTrigger className="flex-1 data-[state=active]:bg-transparent" value="documents">
                    Documents
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="chat" className="p-4">
                  <WorkOrderChat 
                    workOrderId={workOrder.id}
                    customerName={customer ? `${customer.first_name} ${customer.last_name}` : 'Customer'}
                    customerId={customer?.id || 'customer'}
                    shopName={shopSettings?.name || 'Auto Shop'}
                  />
                </TabsContent>
                <TabsContent value="documents" className="p-6">
                  <div className="flex flex-col items-center justify-center py-10">
                    <FileText className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">No Documents Available</h3>
                    <p className="text-gray-500 text-center">
                      Documents related to this work order will appear here when uploaded by the service center.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Work Order Progress</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${workOrder.status === 'pending' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">Received</div>
                    <div className="text-sm text-gray-500">{formatDate(workOrder.created_at)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${workOrder.status === 'in-progress' ? 'bg-blue-600 text-white' : workOrder.status === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {workOrder.status === 'in-progress' || workOrder.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span>2</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">In Progress</div>
                    <div className="text-sm text-gray-500">
                      {workOrder.status === 'in-progress' || workOrder.status === 'completed' 
                        ? formatDate(workOrder.start_time) 
                        : 'Pending'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${workOrder.status === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {workOrder.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span>3</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">Completed</div>
                    <div className="text-sm text-gray-500">
                      {workOrder.status === 'completed' 
                        ? formatDate(workOrder.end_time) 
                        : 'Pending'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                {technician && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Technician</h3>
                    <p className="font-medium">{getFullName(technician.first_name, technician.last_name)}</p>
                    {technician.email && <p className="text-sm">{technician.email}</p>}
                    {technician.phone && <p className="text-sm">{technician.phone}</p>}
                  </div>
                )}
                
                {shopSettings && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Service Center</h3>
                    <p className="font-medium">{shopSettings.name}</p>
                    {shopSettings.email && <p className="text-sm">{shopSettings.email}</p>}
                    {shopSettings.phone && <p className="text-sm">{shopSettings.phone}</p>}
                  </div>
                )}
                
                <Button className="w-full mt-2" variant="outline">
                  <Phone className="h-4 w-4 mr-2" /> Contact Service Center
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
