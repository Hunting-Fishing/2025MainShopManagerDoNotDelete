
import { z } from "zod";

export const workOrderFormSchema = z.object({
  // Customer information
  customerId: z.string().optional(),
  customer: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  
  // Vehicle information
  vehicleId: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
  odometer: z.string().optional(),
  
  // Work order details
  description: z.string().min(1, "Description is required"),
  status: z.enum(["pending", "in-progress", "on-hold", "completed", "cancelled"]).default("pending"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  
  // Assignment
  technician: z.string().optional(),
  technicianId: z.string().optional(),
  location: z.string().optional(),
  dueDate: z.string().optional(),
  
  // Additional information
  notes: z.string().optional(),
  
  // Inventory items
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
