
import { z } from "zod";

// Define inventory item schema for work orders
export const workOrderInventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  category: z.string(),
  quantity: z.number().min(1),
  unit_price: z.number().min(0),
  total: z.number().min(0),
  notes: z.string().optional(),
  itemStatus: z.enum(["special-order", "ordered", "in-stock"]).optional(),
  estimatedArrivalDate: z.string().optional(),
  supplierName: z.string().optional(),
  supplierOrderRef: z.string().optional()
});

// Main work order form schema
export const workOrderFormSchema = z.object({
  customer: z.string().min(2, {
    message: "Customer name must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  service_type: z.string().optional(),
  status: z.enum(["pending", "in-progress", "completed", "cancelled", "on-hold"], {
    required_error: "Please select a status.",
  }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Please select a priority.",
  }),
  technician: z.string().min(1, {
    message: "Please select a technician.",
  }),
  technician_id: z.string().optional(),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  dueDate: z.string().min(1, {
    message: "Due date is required.",
  }),
  estimated_hours: z.number().min(0.1).default(1),
  notes: z.string().optional(),
  inventoryItems: z.array(workOrderInventoryItemSchema).optional().default([]),
  // Vehicle fields
  vehicle_id: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  odometer: z.string().optional(),
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
});

// Export the inferred type
export type WorkOrderFormSchemaValues = z.infer<typeof workOrderFormSchema>;
