import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { List, AlertTriangle, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link, useParams } from 'react-router-dom';

interface WorkOrder {
  id: string;
  created_at: string;
  description: string;
  status: string;
  technician_id: string;
  total_cost: number | null;
}

export const VehicleWorkOrders: React.FC<{ vehicleId: string }> = ({ vehicleId }) => {
  const { customerId } = useParams<{ customerId: string }>();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState<string>("");
  const [vehicleInfo, setVehicleInfo] = useState<string>("");

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select('*')
          .eq('vehicle_id', vehicleId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setWorkOrders(data || []);
      } catch (error) {
        console.error("Error fetching work orders:", error);
        setWorkOrders([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCustomerAndVehicleInfo = async () => {
      if (!customerId) return;
      
      try {
        // Fetch customer name
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('first_name, last_name')
          .eq('id', customerId)
          .single();

        if (customerError) {
          console.error("Error fetching customer:", customerError);
        } else if (customerData) {
          setCustomerName(`${customerData.first_name} ${customerData.last_name}`);
        }
        
        // Fetch vehicle info
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('year, make, model')
          .eq('id', vehicleId)
          .single();

        if (vehicleError) {
          console.error("Error fetching vehicle:", vehicleError);
        } else if (vehicleData) {
          setVehicleInfo(`${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`);
        }
      } catch (error) {
        console.error("Error fetching info:", error);
      }
    };

    fetchWorkOrders();
    fetchCustomerAndVehicleInfo();
  }, [vehicleId, customerId]);

  if (loading) {
    return <div className="p-4 text-center">Loading work orders...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Vehicle Work Orders</h3>
        {customerId && (
          <Button 
            variant="default"
            size="sm"
            asChild
          >
            <Link to={`/work-orders/new?customerId=${customerId}&vehicleId=${vehicleId}&customerName=${encodeURIComponent(customerName)}&vehicleInfo=${encodeURIComponent(vehicleInfo)}`}>
              <ClipboardList className="mr-2 h-4 w-4" /> Create Work Order
            </Link>
          </Button>
        )}
      </div>

      {workOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <List className="w-16 h-16 mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Work Orders Found</h3>
          <p className="text-muted-foreground">
            There are no work orders recorded for this vehicle.
          </p>
          {customerId && (
            <Button 
              variant="outline" 
              className="mt-4"
              asChild
            >
              <Link to={`/work-orders/new?customerId=${customerId}&vehicleId=${vehicleId}&customerName=${encodeURIComponent(customerName)}&vehicleInfo=${encodeURIComponent(vehicleInfo)}`}>
                <ClipboardList className="mr-2 h-4 w-4" /> Create First Work Order
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrders.map((workOrder) => (
                <TableRow key={workOrder.id} className="cursor-pointer hover:bg-slate-50">
                  <TableCell>{new Date(workOrder.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{workOrder.description || 'No description'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(workOrder.status)}>
                      {workOrder.status || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {workOrder.total_cost ? `$${workOrder.total_cost.toFixed(2)}` : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in-progress':
    case 'in progress':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
