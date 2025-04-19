
import { z } from "zod";
import { WorkOrderStatusType, WorkOrderPriorityType } from "@/types/workOrder";

// Define inventory item schema using the type
export const inventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  category: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number(),
  totalPrice: z.number().optional(),
  itemStatus: z.enum(['in-stock', 'ordered', 'special-order', 'used-part', 'misc']).optional()
});

// Form schema validation
export const workOrderFormSchema = z.object({
  customer: z.string().min(2, {
    message: "Customer name must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  serviceCategory: z.string().optional(),
  status: z.enum(["pending", "in-progress", "completed", "cancelled"] as const, {
    required_error: "Please select a status.",
  }),
  priority: z.enum(["low", "medium", "high"] as const, {
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
  // New vehicle fields
  vehicleId: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  odometer: z.string().optional(),
  licensePlate: z.string().optional(),
});

export type WorkOrderFormSchemaValues = z.infer<typeof workOrderFormSchema>;
