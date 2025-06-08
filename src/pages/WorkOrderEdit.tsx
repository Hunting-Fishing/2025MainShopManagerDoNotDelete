
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { workOrderFormSchema, WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { WorkOrderEditFormContent } from "@/components/work-orders/edit/WorkOrderEditFormContent";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, WorkOrderInventoryItem, WorkOrderStatusType } from "@/types/workOrder";
import { toast } from "sonner";

interface Technician {
  id: string;
  name: string;
  jobTitle?: string;
}

const WorkOrderEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            *,
            customers (
              id,
              first_name,
              last_name,
              email,
              phone
            ),
            vehicles (
              id,
              year,
              make,
              model,
              vin,
              license_plate
            ),
            work_order_inventory_items (
              id,
              name,
              sku,
              category,
              quantity,
              unit_price,
              notes
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        const workOrderData = data as any;
        setWorkOrder(workOrderData);

        // Map the work order data to form values
        const customer = workOrderData.customers 
          ? `${workOrderData.customers.first_name} ${workOrderData.customers.last_name}`.trim()
          : "";

        const vehicle = workOrderData.vehicles || {};
        
        // Map inventory items with proper typing
        const inventoryItems: WorkOrderInventoryItem[] = (workOrderData.work_order_inventory_items || []).map((item: any) => ({
          id: item.id || "",
          workOrderId: id,
          name: item.name || "",
          sku: item.sku || "",
          category: item.category || "",
          quantity: item.quantity || 0,
          unit_price: item.unit_price || 0,
          total: (item.quantity || 0) * (item.unit_price || 0),
          notes: item.notes
        }));

        form.reset({
          customer,
          description: workOrderData.description || "",
          status: workOrderData.status as WorkOrderStatusType,
          priority: workOrderData.priority || "medium",
          technician: workOrderData.technician_id || "",
          location: workOrderData.location || "",
          dueDate: workOrderData.due_date || "",
          notes: workOrderData.notes || "",
          vehicleMake: vehicle.make || "",
          vehicleModel: vehicle.model || "",
          vehicleYear: vehicle.year?.toString() || "",
          odometer: "", // Not available in current schema
          licensePlate: vehicle.license_plate || "",
          vin: vehicle.vin || "",
          inventoryItems
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

  // Fetch technicians
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, job_title')
          .not('first_name', 'is', null);

        if (error) throw error;

        const techniciansList: Technician[] = (data || []).map((profile: any) => ({
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name}`.trim(),
          jobTitle: profile.job_title
        }));

        setTechnicians(techniciansList);
      } catch (err) {
        console.error("Error fetching technicians:", err);
      }
    };

    fetchTechnicians();
  }, []);

  const handleSubmit = async (data: WorkOrderFormSchemaValues) => {
    if (!id) return;

    setSaving(true);
    setError(null);

    try {
      // Update work order
      const { error: updateError } = await supabase
        .from('work_orders')
        .update({
          description: data.description,
          status: data.status,
          technician_id: data.technician || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update inventory items if needed
      if (data.inventoryItems && data.inventoryItems.length > 0) {
        // Delete existing items
        await supabase
          .from('work_order_inventory_items')
          .delete()
          .eq('work_order_id', id);

        // Insert new items
        const inventoryItemsToInsert = data.inventoryItems.map(item => ({
          work_order_id: id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          quantity: item.quantity,
          unit_price: item.unit_price
        }));

        const { error: inventoryError } = await supabase
          .from('work_order_inventory_items')
          .insert(inventoryItemsToInsert);

        if (inventoryError) throw inventoryError;
      }

      toast.success("Work order updated successfully");
      navigate("/work-orders");

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
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error && !workOrder) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/work-orders")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Work Orders
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Work Order</h1>
          {workOrder && (
            <p className="text-muted-foreground">
              Work Order #{workOrder.work_order_number || workOrder.id.substring(0, 8)}
            </p>
          )}
        </div>
      </div>

      {/* Form */}
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
