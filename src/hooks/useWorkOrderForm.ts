
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { WorkOrder } from "@/types/workOrder";

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

  return form;
}
