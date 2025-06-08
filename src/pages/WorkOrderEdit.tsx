
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";
import { workOrderFormSchema, WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { WorkOrderEditFormContent } from "@/components/work-orders/edit/WorkOrderEditFormContent";
import { getWorkOrderById, updateWorkOrder } from "@/services/workOrder";

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
  const [saving, setSaving] = useState(false);
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
    if (!id) {
      setError("Work order ID is required");
      setLoading(false);
      return;
    }

    const fetchWorkOrder = async () => {
      try {
        setLoading(true);
        const data = await getWorkOrderById(id);
        
        if (data) {
          setWorkOrder(data);
          
          // Populate form with work order data
          form.reset({
            customer: data.customer || "",
            description: data.description || "",
            status: data.status as any || "pending",
            priority: data.priority as any || "medium",
            technician: data.technician_id || data.technician || "",
            location: data.location || "",
            dueDate: data.due_date || data.dueDate || "",
            notes: data.notes || "",
            vehicleMake: data.vehicle_make || "",
            vehicleModel: data.vehicle_model || "",
            vehicleYear: data.vehicle_year?.toString() || "",
            odometer: data.vehicle_odometer || "",
            licensePlate: data.vehicle_license_plate || "",
            vin: data.vehicle_vin || "",
            inventoryItems: data.inventoryItems || []
          });
        } else {
          setError("Work order not found");
        }
      } catch (err) {
        console.error("Error fetching work order:", err);
        setError("Failed to load work order");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrder();
  }, [id, form]);

  // Fetch technicians
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, name, job_title')
          .eq('status', 'active')
          .order('name');

        if (error) throw error;

        const technicianList: Technician[] = (data || []).map(member => ({
          id: member.id,
          name: member.name,
          jobTitle: member.job_title
        }));

        setTechnicians(technicianList);
      } catch (err) {
        console.error("Error fetching technicians:", err);
      }
    };

    fetchTechnicians();
  }, []);

  const handleSubmit = async (values: WorkOrderFormSchemaValues) => {
    if (!id || !workOrder) return;

    try {
      setSaving(true);
      setError(null);

      const updatedWorkOrder: Partial<WorkOrder> = {
        id,
        customer: values.customer,
        description: values.description,
        status: values.status,
        priority: values.priority,
        technician_id: values.technician,
        location: values.location,
        due_date: values.dueDate,
        notes: values.notes,
        vehicle_make: values.vehicleMake,
        vehicle_model: values.vehicleModel,
        vehicle_year: values.vehicleYear ? parseInt(values.vehicleYear) : undefined,
        vehicle_odometer: values.odometer,
        vehicle_license_plate: values.licensePlate,
        vehicle_vin: values.vin,
        inventory_items: values.inventoryItems
      };

      await updateWorkOrder(updatedWorkOrder as WorkOrder);
      toast.success("Work order updated successfully");
      navigate(`/work-orders/${id}`);
    } catch (err) {
      console.error("Error updating work order:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update work order";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading work order...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error || "Work order not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/work-orders/${id}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Details
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Work Order</h1>
          <p className="text-muted-foreground">
            Work Order #{workOrder.work_order_number || workOrder.id}
          </p>
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
