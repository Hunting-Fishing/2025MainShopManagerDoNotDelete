
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Customer } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { createWorkOrder } from "@/utils/workOrders/crud";

// Define the validation schema for work orders
const workOrderSchema = z.object({
  customer: z.string().min(1, { message: "Customer is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  technician: z.string().optional(),
  location: z.string().optional(),
  dueDate: z.string().min(1, { message: "Due date is required" }),
  notes: z.string().optional(),
  status: z.string().min(1, { message: "Status is required" }),
  priority: z.string().min(1, { message: "Priority is required" }),
});

type WorkOrderFormValues = z.infer<typeof workOrderSchema>;

interface WorkOrderFormProps {
  technicians: string[];
  isLoadingTechnicians: boolean;
  setIsSubmitting: (value: boolean) => void;
  setError: (error: string | null) => void;
  id?: string;
  selectedCustomer: Customer | null;
}

export const WorkOrderForm: React.FC<WorkOrderFormProps> = ({
  technicians,
  isLoadingTechnicians,
  setIsSubmitting,
  setError,
  id = "work-order-form",
  selectedCustomer,
}) => {
  const navigate = useNavigate();
  const [defaultDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Init form with defaults
  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      customer: "",
      description: "",
      technician: "_unassigned",
      location: "",
      dueDate: defaultDate,
      notes: "",
      status: "pending",
      priority: "medium",
    }
  });

  // Update form when customer selection changes
  useEffect(() => {
    if (selectedCustomer) {
      form.setValue("customer", selectedCustomer.fullName || `${selectedCustomer.firstName} ${selectedCustomer.lastName}`);
      
      // If customer has an address, use it as the location
      if (selectedCustomer.address) {
        form.setValue("location", selectedCustomer.address);
      }
    }
  }, [selectedCustomer, form]);

  const onSubmit = async (data: WorkOrderFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare the data to be sent to the database
      const workOrderData = {
        customer: data.customer,
        customer_id: selectedCustomer?.id,
        description: data.description,
        technician: data.technician !== "_unassigned" ? data.technician : null,
        location: data.location,
        dueDate: data.dueDate,
        notes: data.notes,
        status: data.status,
        priority: data.priority,
      };
      
      // Save the work order
      const savedWorkOrder = await createWorkOrder(workOrderData);
      
      // Navigate to the work order details page
      navigate(`/work-orders/${savedWorkOrder.id}`);
    } catch (error) {
      console.error("Error creating work order:", error);
      setError("Failed to create work order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 border-t" id={id}>
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoadingTechnicians || form.formState.isSubmitting}
            className="rounded-full px-6 bg-blue-600 hover:bg-blue-700"
          >
            {form.formState.isSubmitting ? "Creating..." : "Create Work Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
