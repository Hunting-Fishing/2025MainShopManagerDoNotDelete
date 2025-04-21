
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WorkOrderStatusBadge } from "@/components/workOrders/WorkOrderStatusBadge";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, FileText } from "lucide-react";
import { WorkOrder } from "@/types/workOrder";
import { format } from "date-fns";

export default function WorkOrdersList() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkOrders();
    
    // Set up real-time listener for work order updates
    const workOrdersChannel = supabase
      .channel('customer-work-orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'work_orders'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setWorkOrders(current => [payload.new as WorkOrder, ...current]);
        } else if (payload.eventType === 'UPDATE') {
          setWorkOrders(current => 
            current.map(wo => wo.id === payload.new.id ? 
              { ...wo, ...payload.new as Partial<WorkOrder> } : wo
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setWorkOrders(current => current.filter(wo => wo.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(workOrdersChannel);
    };
  }, []);

  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      // Get current user's customer_id
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to view work orders.",
          variant: "destructive"
        });
        navigate('/customer-portal');
        return;
      }

      // Get customer profile
      const { data: customerProfile, error: customerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (customerError || !customerProfile) {
        toast({
          title: "Profile Error",
          description: "Could not load your customer profile.",
          variant: "destructive"
        });
        return;
      }

      // Fetch work orders for this customer
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          vehicles(make, model, year)
        `)
        .eq('customer_id', customerProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkOrders(data as unknown as WorkOrder[]);
    } catch (error) {
      console.error("Error fetching work orders:", error);
      toast({
        title: "Error",
        description: "Failed to load work orders. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkOrders = workOrders.filter(wo => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      wo.id.toLowerCase().includes(query) ||
      (wo.description && wo.description.toLowerCase().includes(query)) ||
      (wo.service_type && wo.service_type.toLowerCase().includes(query)) ||
      (wo.status && wo.status.toLowerCase().includes(query))
    );
  });

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <CardTitle className="text-2xl">My Work Orders</CardTitle>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search work orders..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredWorkOrders.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No Work Orders Found</h3>
            <p className="text-slate-500 mt-1">
              {searchQuery ? "No work orders match your search criteria." : "You don't have any work orders yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkOrders.map((workOrder) => (
                  <TableRow key={workOrder.id}>
                    <TableCell className="font-medium">
                      {workOrder.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      {workOrder.service_type || 'General Service'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {workOrder.created_at ? format(new Date(workOrder.created_at), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {workOrder.vehicles ? 
                        `${workOrder.vehicles.year} ${workOrder.vehicles.make} ${workOrder.vehicles.model}` : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <WorkOrderStatusBadge status={workOrder.status} />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                      >
                        <Link to={`/customer-portal/work-orders/${workOrder.id}`}>View Details</Link>
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
  );
}
