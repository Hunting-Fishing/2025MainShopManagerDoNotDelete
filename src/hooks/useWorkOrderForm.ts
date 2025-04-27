
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { WorkOrder, TimeEntry } from "@/types/workOrder";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

// Define schema using zod for form validation
const workOrderFormSchema = z.object({
  id: z.string().optional(),
  customer: z.string().min(1, "Customer is required"),
  customer_id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  status: z.string().min(1, "Status is required"),
  priority: z.string().min(1, "Priority is required"),
  technician: z.string().optional(),
  technician_id: z.string().optional(),
  date: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  location: z.string().optional(),
  notes: z.string().optional(),
  vehicle_id: z.string().optional(),
  inventoryItems: z.array(z.any()).optional(),
  timeEntries: z.array(z.any()).optional(),
  serviceCategory: z.string().optional(),
  estimatedHours: z.number().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  odometer: z.string().optional(),
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
  // Additional vehicle fields from VIN decoding
  driveType: z.string().optional(),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
  engine: z.string().optional(),
  bodyStyle: z.string().optional(),
  country: z.string().optional(),
});

export type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>;

export function useWorkOrderForm(workOrder?: Partial<WorkOrder>) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(workOrder?.timeEntries || []);

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      id: workOrder?.id || "",
      customer: workOrder?.customer || "",
      customer_id: workOrder?.customer_id || "",
      description: workOrder?.description || "",
      status: workOrder?.status || "pending",
      priority: workOrder?.priority || "medium",
      technician: workOrder?.technician || "",
      technician_id: workOrder?.technician_id || "",
      date: workOrder?.date || new Date().toISOString(),
      dueDate: workOrder?.dueDate || new Date().toISOString().split('T')[0],
      location: workOrder?.location || "",
      notes: workOrder?.notes || "",
      vehicle_id: workOrder?.vehicle_id || "",
      serviceCategory: workOrder?.serviceCategory || workOrder?.service_category || "",
      estimatedHours: workOrder?.estimated_hours || undefined,
      // Fixed: Use optional chaining to safely access the vehicleYear, vehicleMake and vehicleModel properties
      vehicleMake: workOrder?.vehicleMake || workOrder?.vehicle_make || "",
      vehicleModel: workOrder?.vehicleModel || workOrder?.vehicle_model || "",
      vehicleYear: workOrder?.vehicleYear || (workOrder?.vehicleDetails?.year || ""),
    },
  });

  const setFormValues = (values: Partial<WorkOrderFormValues>) => {
    Object.entries(values).forEach(([key, value]) => {
      if (key in form.getValues()) {
        form.setValue(key as any, value);
      }
    });
  };

  const onSubmit = async (data: WorkOrderFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Convert data format for Supabase
      const dbData = {
        ...data,
        // Make sure status is always provided
        status: data.status || 'pending',
        updated_at: new Date().toISOString(),
        // Convert to snake_case for database
        vehicle_make: data.vehicleMake,
        vehicle_model: data.vehicleModel,
        vehicle_year: data.vehicleYear,
        estimated_hours: data.estimatedHours,
        service_category: data.serviceCategory,
        // Make sure technician_id is saved to database
        technician_id: data.technician_id || null,
        // Add any inventory items and time entries
        inventory_items: data.inventoryItems || [],
        time_entries: timeEntries.length > 0 ? timeEntries : [],
      };
      
      // Logic for submitting work order to database
      const { data: result, error: submitError } = await supabase
        .from('work_orders')
        .upsert([dbData])
        .select();
      
      if (submitError) throw submitError;
      
      toast({
        title: "Success",
        description: data.id ? "Work order updated." : "Work order created.",
      });
      
      navigate(data.id ? `/work-orders/${data.id}` : '/work-orders');
    } catch (err) {
      console.error('Error saving work order:', err);
      setError('Failed to save work order. Please try again.');
      
      toast({
        title: "Error",
        description: "Failed to save work order. Please check your inputs and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    form, 
    onSubmit, 
    isSubmitting, 
    error, 
    setTimeEntries,
    setFormValues
  };
}
