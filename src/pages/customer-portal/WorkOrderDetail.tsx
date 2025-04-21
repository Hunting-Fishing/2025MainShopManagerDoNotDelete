import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { WorkOrder } from '@/types/workOrder';
import { Vehicle } from '@/types/vehicle';
import { toast } from '@/hooks/use-toast';

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
        if (data.vehicleId) {
          const { data: vehicleData, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', data.vehicleId)
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!workOrder) {
    return <div>Work order not found</div>;
  }

  return (
    <div>
      <h1>Work Order Details</h1>
      <p>Title: {workOrder.title}</p>
      <p>Description: {workOrder.description}</p>
      <p>Created At: {new Date(workOrder.createdAt).toLocaleString()}</p>
      {vehicle && (
        <div>
          <h2>Vehicle Details</h2>
          <p>Vehicle ID: {vehicle.id}</p>
          <p>Make: {vehicle.make}</p>
          <p>Model: {vehicle.model}</p>
        </div>
      )}
    </div>
  );
};

export default WorkOrderDetail;
