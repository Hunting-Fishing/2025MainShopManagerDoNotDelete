
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { createWorkOrder } from "@/utils/workOrderUtils";
import { format } from "date-fns";

// Form schema validation
const formSchema = z.object({
  customer: z.string().min(2, {
    message: "Customer name must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  status: z.enum(["pending", "in-progress", "completed", "cancelled"], {
    required_error: "Please select a status.",
  }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Please select a priority.",
  }),
  technician: z.string().min(1, {
    message: "Please select a technician.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  dueDate: z.date({
    required_error: "Due date is required.",
  }),
  notes: z.string().optional(),
});

export type WorkOrderFormValues = z.infer<typeof formSchema>;

export const useWorkOrderForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form
  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "pending",
      priority: "medium",
      technician: "Unassigned",
      notes: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: WorkOrderFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Format the date to YYYY-MM-DD string
      const formattedDueDate = format(values.dueDate, "yyyy-MM-dd");
      
      // Create the work order
      const newWorkOrder = await createWorkOrder({
        ...values,
        dueDate: formattedDueDate,
        customer: values.customer,
        description: values.description,
        status: values.status,
        priority: values.priority,
        technician: values.technician,
        location: values.location,
      });
      
      // Show success message
      toast({
        title: "Work Order Created",
        description: `Work order ${newWorkOrder.id} has been created successfully.`,
      });
      
      // Navigate to work orders list
      navigate("/work-orders");
    } catch (error) {
      console.error("Error creating work order:", error);
      
      // Show error message
      toast({
        title: "Error",
        description: "Failed to create work order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting,
  };
};
