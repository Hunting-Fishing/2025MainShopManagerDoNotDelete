
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { WorkOrder } from '@/types/workOrder';
import { getWorkOrderById, updateWorkOrder } from '@/services/workOrder';
import { useWorkOrderEditForm } from '@/hooks/useWorkOrderEditForm';
import { WorkOrderEditFormContent } from '@/components/work-orders/edit/WorkOrderEditFormContent';
import { useForm } from 'react-hook-form';
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
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      customer: '',
      description: '',
      status: 'pending' as const,
      priority: 'medium' as const,
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
      fetchWorkOrder(id);
      fetchTechnicians();
    }
  }, [id]);

  const fetchWorkOrder = async (workOrderId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWorkOrderById(workOrderId);
      if (data) {
        setWorkOrder(data);
        // Populate form with work order data
        form.reset({
          customer: data.customer || '',
          description: data.description || '',
          status: data.status as any || 'pending',
          priority: data.priority as any || 'medium',
          technician: data.technician || '',
          location: data.location || '',
          dueDate: data.dueDate || data.due_date || '',
          notes: data.notes || '',
          vehicleMake: data.vehicle_make || '',
          vehicleModel: data.vehicle_model || '',
          vehicleYear: data.vehicle_year || '',
          odometer: data.vehicle_odometer || '',
          licensePlate: data.vehicle_license_plate || '',
          vin: data.vehicle_vin || '',
          inventoryItems: data.inventoryItems || []
        });
      } else {
        setError('Work order not found');
      }
    } catch (err) {
      console.error('Error fetching work order:', err);
      setError('Failed to load work order');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, first_name, last_name, job_title')
        .eq('active', true);
      
      if (error) throw error;
      
      const formattedTechnicians = data?.map(member => ({
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        jobTitle: member.job_title
      })) || [];
      
      setTechnicians(formattedTechnicians);
    } catch (err) {
      console.error('Error fetching technicians:', err);
    }
  };

  const handleSubmit = async (formData: any) => {
    if (!id) return;

    try {
      setSaving(true);
      const updatedWorkOrder = {
        ...workOrder,
        id,
        customer: formData.customer,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        technician: formData.technician,
        location: formData.location,
        dueDate: formData.dueDate,
        due_date: formData.dueDate,
        notes: formData.notes,
        vehicle_make: formData.vehicleMake,
        vehicle_model: formData.vehicleModel,
        vehicle_year: formData.vehicleYear,
        vehicle_odometer: formData.odometer,
        vehicle_license_plate: formData.licensePlate,
        vehicle_vin: formData.vin,
        inventoryItems: formData.inventoryItems
      };

      const result = await updateWorkOrder(updatedWorkOrder);
      if (result) {
        setWorkOrder(result);
        toast({
          title: "Success",
          description: "Work order updated successfully"
        });
        navigate(`/work-orders/${id}`);
      } else {
        throw new Error('Failed to update work order');
      }
    } catch (err) {
      console.error('Error updating work order:', err);
      toast({
        title: "Error",
        description: "Failed to update work order",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading work order...</div>
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Work Order</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/work-orders')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Work Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/work-orders/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Details
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Work Order</h1>
            <p className="text-gray-600">Work Order ID: {workOrder.id?.slice(0, 8)}</p>
          </div>
        </div>
      </div>

      <WorkOrderEditFormContent
        workOrderId={id!}
        technicians={technicians}
        form={form}
        onSubmit={handleSubmit}
        isSubmitting={saving}
        error={error}
      />
    </div>
  );
};

export default WorkOrderEdit;
