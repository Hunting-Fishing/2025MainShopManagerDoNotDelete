
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, SearchIcon, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface WorkOrder {
  id: string;
  description: string;
  status: string;
  created_at: string;
  service_type: string;
  total_cost: number | null;
  vehicle_id: string | null;
  vehicle_make?: string;
  vehicle_model?: string;
  technician_name?: string;
  unread_messages?: number;
}

export default function WorkOrdersList() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        
        // Get the current user
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          throw new Error('Not authenticated');
        }
        
        // Get the customer record for this user
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('id')
          .eq('email', userData.user.email)
          .single();
        
        if (customerError || !customerData) {
          throw new Error('Customer record not found');
        }
        
        // Fetch work orders for this customer with related data
        const { data: ordersData, error: ordersError } = await supabase
          .from('work_orders')
          .select(`
            *,
            technicians:technician_id(first_name, last_name),
            vehicles:vehicle_id(make, model)
          `)
          .eq('customer_id', customerData.id)
          .order('created_at', { ascending: false });
        
        if (ordersError) throw ordersError;
        
        // For each work order, check if there are unread messages
        const ordersWithMessageCounts = await Promise.all(ordersData.map(async (order) => {
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
          }
          
          return {
            ...order,
            technician_name: order.technicians ? 
              `${order.technicians.first_name} ${order.technicians.last_name}` : 
              'Unassigned',
            vehicle_make: order.vehicles?.make,
            vehicle_model: order.vehicles?.model,
            unread_messages: unreadCount
          };
        }));
        
        setWorkOrders(ordersWithMessageCounts);
      } catch (error) {
        console.error('Error loading work orders:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your work orders',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkOrders();
  }, []);
  
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
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
  
  const filteredWorkOrders = workOrders.filter(order => {
    const searchValue = searchTerm.toLowerCase();
    return (
      order.description?.toLowerCase().includes(searchValue) ||
      order.service_type?.toLowerCase().includes(searchValue) ||
      order.technician_name?.toLowerCase().includes(searchValue) ||
      `${order.vehicle_make} ${order.vehicle_model}`.toLowerCase().includes(searchValue) ||
      order.id.toLowerCase().includes(searchValue)
    );
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Work Orders</CardTitle>
              <CardDescription>View and manage your service history</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search work orders..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ) : workOrders.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No Work Orders Found</h3>
              <p className="mt-2 text-gray-500">You don't have any work orders yet.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>{order.service_type || 'General Service'}</TableCell>
                      <TableCell>
                        {order.vehicle_make && order.vehicle_model
                          ? `${order.vehicle_make} ${order.vehicle_model}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusBadge(order.status)}
                          {(order.unread_messages || 0) > 0 && (
                            <Badge className="ml-2 bg-red-500 text-white">{order.unread_messages}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/customer-portal/work-orders/${order.id}`} className="flex items-center">
                            <span>View Details</span>
                            {(order.unread_messages || 0) > 0 && (
                              <MessageCircle className="ml-2 h-4 w-4 text-red-500" />
                            )}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
