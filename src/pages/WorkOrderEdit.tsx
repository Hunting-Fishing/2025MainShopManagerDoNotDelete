
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderEditFormContent } from '@/components/work-orders/edit/WorkOrderEditFormContent';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workOrderFormSchema, WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Technician {
  id: string;
  name: string;
  jobTitle?: string;
}

const WorkOrderEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<any>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    if (id) {
      fetchWorkOrder();
      fetchTechnicians();
    }
  }, [id]);

  const fetchWorkOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch work order with related data using separate queries to avoid ambiguous relationships
      const { data: workOrderData, error: workOrderError } = await supabase
        .from('work_orders')
        .select('*')
        .eq('id', id)
        .single();

      if (workOrderError) throw workOrderError;

      let customerData = null;
      let vehicleData = null;

      // Fetch customer data if customer_id exists
      if (workOrderData.customer_id) {
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('first_name, last_name')
          .eq('id', workOrderData.customer_id)
          .single();

        if (!customerError && customer) {
          customerData = customer;
        }
      }

      // Fetch vehicle data if vehicle_id exists
      if (workOrderData.vehicle_id) {
        const { data: vehicle, error: vehicleError } = await supabase
          .from('vehicles')
          .select('make, model, year, license_plate, vin')
          .eq('id', workOrderData.vehicle_id)
          .single();

        if (!vehicleError && vehicle) {
          vehicleData = vehicle;
        }
      }

      // Populate form with work order data
      form.setValue('customer', customerData ? `${customerData.first_name} ${customerData.last_name}` : '');
      form.setValue('description', workOrderData.description || '');
      form.setValue('status', workOrderData.status || 'pending');
      form.setValue('notes', workOrderData.description || '');
      
      if (vehicleData) {
        form.setValue('vehicleMake', vehicleData.make || '');
        form.setValue('vehicleModel', vehicleData.model || '');
        form.setValue('vehicleYear', vehicleData.year ? vehicleData.year.toString() : '');
        form.setValue('licensePlate', vehicleData.license_plate || '');
        form.setValue('vin', vehicleData.vin || '');
      }

      setWorkOrder(workOrderData);
    } catch (err) {
      console.error('Error fetching work order:', err);
      setError('Failed to load work order');
      toast.error('Failed to load work order');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, job_title')
        .not('job_title', 'is', null);

      if (error) throw error;

      const technicianData = (data || []).map((profile: any) => ({
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        jobTitle: profile.job_title
      }));
      
      setTechnicians(technicianData);
    } catch (err) {
      console.error('Error fetching technicians:', err);
    }
  };

  const onSubmit = async (data: WorkOrderFormSchemaValues) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({
          description: data.description,
          status: data.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Work order updated successfully');
      navigate(`/work-orders/${id}`);
    } catch (err) {
      console.error('Error updating work order:', err);
      toast.error('Failed to update work order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(`/work-orders/${id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading work order...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={handleBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Work Order
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={handleBack} variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Work Order</h1>
      </div>

      <WorkOrderEditFormContent
        workOrderId={id!}
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
