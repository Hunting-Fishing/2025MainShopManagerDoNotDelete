
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { Save, X } from "lucide-react";

import { WorkOrder } from "@/data/workOrdersData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateWorkOrder } from "@/utils/workOrderUtils";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { WorkOrderFormFields, WorkOrderFormFieldValues } from "./WorkOrderFormFields";
import { WorkOrderInventorySection } from "./inventory/WorkOrderInventorySection";

interface WorkOrderEditFormProps {
  workOrder: WorkOrder;
}

// Inventory item schema
const inventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  category: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number()
});

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
  inventoryItems: z.array(inventoryItemSchema).optional(),
});

// Define the form values type from the schema
type FormValues = z.infer<typeof formSchema>;

// Mock data for technicians
const technicians = [
  "Michael Brown",
  "Sarah Johnson",
  "David Lee",
  "Emily Chen",
  "Unassigned",
];

export default function WorkOrderEditForm({ workOrder }: WorkOrderEditFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse the date strings into Date objects
  const dueDateAsDate = parse(workOrder.dueDate, "yyyy-MM-dd", new Date());

  // Make sure workOrder.inventoryItems is properly typed or provide a default empty array
  const inventoryItemsWithDefaults: WorkOrderInventoryItem[] = workOrder.inventoryItems || [];

  // Initialize the form with existing work order data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer: workOrder.customer,
      description: workOrder.description,
      status: workOrder.status as "pending" | "in-progress" | "completed" | "cancelled",
      priority: workOrder.priority as "low" | "medium" | "high",
      technician: workOrder.technician,
      location: workOrder.location,
      dueDate: dueDateAsDate,
      notes: workOrder.notes || "",
      inventoryItems: inventoryItemsWithDefaults,
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Format the date back to YYYY-MM-DD string format
      const formattedDueDate = format(values.dueDate, "yyyy-MM-dd");
      
      // Ensure inventoryItems is properly typed
      const inventoryItems: WorkOrderInventoryItem[] = values.inventoryItems?.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })) || [];
      
      // Create the updated work order object
      const updatedWorkOrder: WorkOrder = {
        ...workOrder,
        customer: values.customer,
        description: values.description,
        status: values.status,
        priority: values.priority,
        technician: values.technician,
        location: values.location,
        dueDate: formattedDueDate,
        notes: values.notes,
        inventoryItems: inventoryItems,
      };
      
      // Update the work order
      await updateWorkOrder(updatedWorkOrder);
      
      // Show success message
      toast({
        title: "Work Order Updated",
        description: `Work order ${workOrder.id} has been updated successfully.`,
      });
      
      // Navigate back to the details view
      navigate(`/work-orders/${workOrder.id}`);
    } catch (error) {
      console.error("Error updating work order:", error);
      
      // Show error message
      toast({
        title: "Error",
        description: "Failed to update work order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Work Order: {workOrder.id}</h1>
          <p className="text-muted-foreground">Make changes to the work order details below</p>
        </div>
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate(`/work-orders/${workOrder.id}`)}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">Work Order Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Form Fields */}
              <WorkOrderFormFields form={form as any} technicians={technicians} />
              
              {/* Inventory Items Section */}
              <WorkOrderInventorySection form={form as any} />

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/work-orders/${workOrder.id}`)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-esm-blue-600 hover:bg-esm-blue-700 flex gap-2 items-center"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
