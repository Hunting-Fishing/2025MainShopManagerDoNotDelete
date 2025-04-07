
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { List, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WorkOrder {
  id: string;
  created_at: string;
  description: string;
  status: string;
  technician_id: string;
  total_cost: number | null;
}

export const VehicleWorkOrders: React.FC<{ vehicleId: string }> = ({ vehicleId }) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

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

    fetchWorkOrders();
  }, [vehicleId]);

  if (loading) {
    return <div className="p-4 text-center">Loading work orders...</div>;
  }

  if (workOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <List className="w-16 h-16 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No Work Orders Found</h3>
        <p className="text-muted-foreground">
          There are no work orders recorded for this vehicle.
        </p>
      </div>
    );
  }

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

  return (
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
  );
};
