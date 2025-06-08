
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { workOrderFormSchema, WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { WorkOrderEditFormContent } from "@/components/work-orders/edit/WorkOrderEditFormContent";
import { EditFormHeader } from "@/components/work-orders/edit/EditFormHeader";

interface Technician {
  id: string;
  name: string;
  jobTitle?: string;
}

export function WorkOrderEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

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
        const { data: workOrder, error: workOrderError } = await supabase
          .from('work_orders')
          .select(`
            *,
            customer:customers(first_name, last_name, email, phone),
            vehicle:vehicles(year, make, model, vin, license_plate),
            technician:profiles!work_orders_technician_id_fkey(first_name, last_name)
          `)
          .eq('id', id)
          .single();

        if (workOrderError) throw workOrderError;

        if (workOrder) {
          // Format the work order data for the form
          const customerName = workOrder.customer 
            ? `${workOrder.customer.first_name || ''} ${workOrder.customer.last_name || ''}`.trim()
            : '';

          const technicianName = workOrder.technician
            ? `${workOrder.technician.first_name || ''} ${workOrder.technician.last_name || ''}`.trim()
            : '';

          form.reset({
            customer: customerName,
            description: workOrder.description || "",
            status: workOrder.status as any,
            priority: "medium", // Default since not in work_orders table
            technician: technicianName,
            location: "", // Not in work_orders table
            dueDate: workOrder.end_time ? new Date(workOrder.end_time).toISOString().split('T')[0] : "",
            notes: "", // Not in work_orders table
            vehicleMake: workOrder.vehicle?.make || "",
            vehicleModel: workOrder.vehicle?.model || "",
            vehicleYear: workOrder.vehicle?.year?.toString() || "",
            odometer: "", // Not in vehicles table
            licensePlate: workOrder.vehicle?.license_plate || "",
            vin: workOrder.vehicle?.vin || "",
            inventoryItems: []
          });
        }
      } catch (err) {
        console.error("Error fetching work order:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch work order");
        toast.error("Failed to load work order");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrder();
  }, [id, form]);

  // Fetch technicians data
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, job_title')
          .not('job_title', 'is', null);

        if (error) throw error;

        const technicianData = (data || []).map((profile) => ({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          jobTitle: profile.job_title || undefined
        }));
        
        setTechnicians(technicianData);
      } catch (err) {
        console.error('Error fetching technicians:', err);
        // Continue with empty technicians array
        setTechnicians([]);
      }
    };

    fetchTechnicians();
  }, []);

  const onSubmit = async (data: WorkOrderFormSchemaValues) => {
    if (!id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Update the work order
      const { error: updateError } = await supabase
        .from('work_orders')
        .update({
          description: data.description,
          status: data.status,
          end_time: data.dueDate ? new Date(data.dueDate).toISOString() : null,
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
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading work order...</div>
        </div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Work Order</h1>
          <p>No work order ID provided.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <EditFormHeader workOrderId={id} />
      
      <WorkOrderEditFormContent
        workOrderId={id}
        technicians={technicians}
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
}
