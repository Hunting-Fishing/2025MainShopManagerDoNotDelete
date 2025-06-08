
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, WorkOrderStatusType } from "@/types/workOrder";
import { Customer, adaptCustomerForUI } from "@/types/customer";
import { workOrderFormSchema, WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { WorkOrderEditFormContent } from "@/components/work-orders/edit/WorkOrderEditFormContent";

interface Technician {
  id: string;
  name: string;
  jobTitle?: string;
}

interface Vehicle {
  id: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  license_plate?: string;
}

const WorkOrderEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: "",
      description: "",
      status: "pending",
      priority: "medium",
      technician: "",
      location: "",
      dueDate: "",
      notes: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      odometer: "",
      licensePlate: "",
      vin: "",
      inventoryItems: []
    }
  });

  // Fetch work order data
  useEffect(() => {
    const fetchWorkOrder = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch work order separately
        const { data: workOrderData, error: workOrderError } = await supabase
          .from('work_orders')
          .select('*')
          .eq('id', id)
          .single();

        if (workOrderError) throw workOrderError;

        // Fetch customer separately if customer_id exists
        let customerData = null;
        if (workOrderData.customer_id) {
          const { data: custData, error: custError } = await supabase
            .from('customers')
            .select('first_name, last_name')
            .eq('id', workOrderData.customer_id)
            .single();

          if (!custError && custData) {
            customerData = custData;
          }
        }

        // Fetch technicians separately
        const { data: techData, error: techError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .not('first_name', 'is', null);

        let technicianData: Technician[] = [];
        if (!techError && techData) {
          technicianData = techData.map(tech => ({
            id: tech.id,
            name: `${tech.first_name || ''} ${tech.last_name || ''}`.trim()
          }));
        }

        // Fetch vehicle separately if vehicle_id exists
        let vehicleData = null;
        if (workOrderData.vehicle_id) {
          const { data: vehData, error: vehError } = await supabase
            .from('vehicles')
            .select('make, model, year, vin, license_plate')
            .eq('id', workOrderData.vehicle_id)
            .single();

          if (!vehError && vehData) {
            vehicleData = vehData;
          }
        }

        setWorkOrder(workOrderData);
        setTechnicians(technicianData);

        // Set form values
        form.reset({
          customer: customerData ? `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() : '',
          description: workOrderData.description || '',
          status: workOrderData.status as WorkOrderFormSchemaValues['status'] || 'pending',
          priority: (workOrderData.priority as WorkOrderFormSchemaValues['priority']) || 'medium',
          technician: workOrderData.technician_id || '',
          location: workOrderData.location || '',
          dueDate: workOrderData.due_date || '',
          notes: workOrderData.notes || '',
          vehicleMake: vehicleData?.make || '',
          vehicleModel: vehicleData?.model || '',
          vehicleYear: vehicleData?.year?.toString() || '',
          odometer: '',
          licensePlate: vehicleData?.license_plate || '',
          vin: vehicleData?.vin || '',
          inventoryItems: []
        });

      } catch (err) {
        console.error("Error fetching work order:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch work order";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrder();
  }, [id, form]);

  const handleSubmit = async (data: WorkOrderFormSchemaValues) => {
    if (!id || !workOrder) return;

    try {
      setSubmitting(true);
      setError(null);

      // Ensure status is properly typed
      const validStatus = data.status as WorkOrderStatusType;

      const { error: updateError } = await supabase
        .from('work_orders')
        .update({
          description: data.description,
          status: validStatus,
          priority: data.priority,
          technician_id: data.technician || null,
          location: data.location || null,
          notes: data.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success("Work order updated successfully");
      navigate(`/work-orders/${id}`);
    } catch (err) {
      console.error("Error updating work order:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update work order";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Work order not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Work Order</h1>
        <p className="text-gray-600">Update work order details and assignments</p>
      </div>

      <WorkOrderEditFormContent
        workOrderId={id!}
        technicians={technicians}
        form={form}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        error={error}
      />
    </div>
  );
};

export default WorkOrderEdit;
