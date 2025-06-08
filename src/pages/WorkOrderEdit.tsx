
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { workOrderFormSchema, type WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';
import { WorkOrderEditFormContent } from '@/components/work-orders/edit/WorkOrderEditFormContent';
import { getWorkOrderById, updateWorkOrder } from '@/services/workOrder';
import { WorkOrder, WorkOrderStatusType } from '@/types/workOrder';
import { supabase } from '@/integrations/supabase/client';

interface Technician {
  id: string;
  name: string;
  jobTitle?: string;
}

const WorkOrderEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      technician: '',
      location: '',
      dueDate: '',
      notes: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      odometer: '',
      licensePlate: '',
      vin: '',
      inventoryItems: []
    }
  });

  // Fetch technicians
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, job_title')
          .not('job_title', 'is', null);

        if (error) throw error;

        const technicianList = data?.map((profile) => ({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          jobTitle: profile.job_title || undefined
        })) || [];

        setTechnicians(technicianList);
      } catch (err) {
        console.error('Error fetching technicians:', err);
      }
    };

    fetchTechnicians();
  }, []);

  // Fetch work order data
  useEffect(() => {
    const fetchWorkOrder = async () => {
      if (!id) {
        setError('Work order ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getWorkOrderById(id);
        setWorkOrder(data);

        // Get customer name if customer_id exists
        let customerName = '';
        if (data.customer_id) {
          try {
            const { data: customerData } = await supabase
              .from('customers')
              .select('first_name, last_name')
              .eq('id', data.customer_id)
              .single();
            
            if (customerData) {
              customerName = `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim();
            }
          } catch (err) {
            console.error('Error fetching customer:', err);
          }
        }

        // Get technician name if technician_id exists
        let technicianName = '';
        if (data.technician_id) {
          const technician = technicians.find(t => t.id === data.technician_id);
          if (technician) {
            technicianName = technician.name;
          }
        }

        // Map the work order data to form values with proper defaults
        const formValues: WorkOrderFormSchemaValues = {
          customer: customerName || data.customer || '',
          description: data.description || '',
          status: (data.status as WorkOrderStatusType) || 'pending',
          priority: (data.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
          technician: technicianName || data.technician || '',
          location: data.location || '',
          dueDate: data.due_date || data.dueDate || data.end_time || '',
          notes: data.notes || '',
          vehicleMake: data.vehicle_make || data.vehicleMake || '',
          vehicleModel: data.vehicle_model || data.vehicleModel || '',
          vehicleYear: data.vehicle_year?.toString() || data.vehicleYear || '',
          odometer: data.vehicle_odometer || data.odometer || '',
          licensePlate: data.vehicle_license_plate || data.licensePlate || '',
          vin: data.vehicle_vin || data.vin || '',
          inventoryItems: data.inventoryItems || data.inventory_items || []
        };

        form.reset(formValues);
      } catch (err) {
        console.error('Error fetching work order:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch work order';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrder();
  }, [id, form, technicians]);

  const onSubmit = async (data: WorkOrderFormSchemaValues) => {
    if (!workOrder) return;

    setIsSubmitting(true);
    try {
      // Map form data back to work order format
      const updatedWorkOrder: Partial<WorkOrder> = {
        id: workOrder.id,
        customer: data.customer,
        description: data.description,
        status: data.status,
        priority: data.priority,
        technician: data.technician,
        location: data.location,
        dueDate: data.dueDate,
        notes: data.notes,
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        vehicleYear: data.vehicleYear,
        odometer: data.odometer,
        licensePlate: data.licensePlate,
        vin: data.vin,
        inventoryItems: data.inventoryItems
      };

      await updateWorkOrder(updatedWorkOrder);
      toast.success('Work order updated successfully');
      navigate('/work-orders');
    } catch (err) {
      console.error('Error updating work order:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update work order';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading work order...</span>
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error || 'Work order not found'}</p>
            <Button onClick={() => navigate('/work-orders')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Work Orders
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          onClick={() => navigate('/work-orders')}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Work Orders
        </Button>
        <h1 className="text-3xl font-bold">Edit Work Order</h1>
        <p className="text-gray-600 mt-2">
          Work Order #{workOrder.work_order_number || workOrder.id}
        </p>
      </div>

      <WorkOrderEditFormContent
        workOrderId={workOrder.id}
        technicians={technicians}
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
};

export default WorkOrderEdit;
