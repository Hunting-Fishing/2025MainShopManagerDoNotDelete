
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { WorkOrder } from '@/types/workOrder';
import { Vehicle } from '@/types/vehicle';
import { toast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Badge 
} from '@/components/ui/badge';
import { CalendarIcon, Clock, Wrench } from 'lucide-react';
import { format } from 'date-fns';

const WorkOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkOrder = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('work_orders')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        setWorkOrder(data);
        if (data.vehicle_id) {
          const { data: vehicleData, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', data.vehicle_id)
            .single();

          if (vehicleError) throw vehicleError;

          setVehicle(vehicleData);
        }
      } catch (error) {
        console.error('Error fetching work order:', error);
        toast({
          title: 'Error',
          description: 'Failed to load work order details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrder();
  }, [id]);

  // Helper function to format dates
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p>Loading work order details...</p>
      </div>
    );
  }

  if (!workOrder) {
    return <div>Work order not found</div>;
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{workOrder.description}</CardTitle>
            <CardDescription>
              <div className="flex items-center mt-2 text-sm text-slate-500">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {formatDate(workOrder.createdAt)}
              </div>
            </CardDescription>
          </div>
          <Badge 
            className={`
              ${workOrder.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                workOrder.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                workOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                'bg-red-100 text-red-800 border-red-300'}
              border px-3 py-1
            `}
          >
            {workOrder.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h3 className="font-semibold text-lg mb-2">Work Order Details</h3>
          <div className="bg-slate-50 p-4 rounded-lg grid gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col">
                <span className="text-sm text-slate-500">Due Date</span>
                <span>{formatDate(workOrder.dueDate)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-slate-500">Priority</span>
                <span className="capitalize">{workOrder.priority || 'Standard'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-slate-500">Technician</span>
                <span>{workOrder.technician || 'Unassigned'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-slate-500">Location</span>
                <span>{workOrder.location || 'N/A'}</span>
              </div>
            </div>

            {workOrder.notes && (
              <div className="mt-3">
                <span className="text-sm text-slate-500 block">Notes</span>
                <p className="mt-1">{workOrder.notes}</p>
              </div>
            )}
          </div>
        </div>

        {vehicle && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Vehicle Details</h3>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <span className="text-sm text-slate-500">Make</span>
                  <span>{vehicle.make}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-slate-500">Model</span>
                  <span>{vehicle.model}</span>
                </div>
                {vehicle.year && (
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-500">Year</span>
                    <span>{vehicle.year}</span>
                  </div>
                )}
                {vehicle.license_plate && (
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-500">License Plate</span>
                    <span>{vehicle.license_plate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-end mt-6 text-sm text-slate-500 border-t pt-4">
          <Clock className="w-4 h-4 mr-1" />
          <span>Last updated: {formatDate(workOrder.lastUpdatedAt || workOrder.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrderDetail;
