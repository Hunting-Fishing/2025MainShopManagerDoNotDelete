
import { z } from "zod";

export const workOrderFormSchema = z.object({
  customer: z.string().min(1, "Customer is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["pending", "in-progress", "on-hold", "completed", "cancelled"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  technician: z.string().optional(),
  location: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  odometer: z.string().optional(),
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
  inventoryItems: z.array(z.object({
    id: z.string(),
    name: z.string(),
    sku: z.string(),
    category: z.string(),
    quantity: z.number(),
    unit_price: z.number(),
    total: z.number(),
    notes: z.string().optional(),
  })).default([]),
});

export type WorkOrderFormSchemaValues = z.infer<typeof workOrderFormSchema>;
