
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { WorkOrder, TimeEntry } from "@/types/workOrder";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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
      dueDate: workOrder?.dueDate || "",
      location: workOrder?.location || "",
      notes: workOrder?.notes || "",
      vehicle_id: workOrder?.vehicle_id || "",
      serviceCategory: workOrder?.serviceCategory || "",
    },
  });

  const setFormValues = (values: Partial<WorkOrderFormValues>) => {
    Object.entries(values).forEach(([key, value]) => {
      form.setValue(key as any, value);
    });
  };

  const onSubmit = async (data: WorkOrderFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Logic for submitting work order to database
      const { data: result, error: submitError } = await supabase
        .from('work_orders')
        .upsert([
          {
            ...data,
            updated_at: new Date().toISOString()
          }
        ])
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
