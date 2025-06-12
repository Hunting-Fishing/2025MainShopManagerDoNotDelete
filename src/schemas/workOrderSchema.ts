
import { z } from 'zod';

// Define inventory item schema
const inventoryItemSchema = z.object({
  id: z.string(),
  workOrderId: z.string().optional(),
  name: z.string(),
  sku: z.string(),
  category: z.string(),
  quantity: z.number().min(1),
  unit_price: z.number().min(0),
  total: z.number().min(0),
  notes: z.string().optional(),
  itemStatus: z.enum(['special-order', 'ordered', 'in-stock']).optional(),
  estimatedArrivalDate: z.string().optional(),
  supplierName: z.string().optional(),
  supplierOrderRef: z.string().optional(),
});

export const workOrderFormSchema = z.object({
  customer: z.string().min(1, 'Customer is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['pending', 'in-progress', 'on-hold', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
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
  customerEmail: z.string().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  // Add inventory items to the schema
  inventoryItems: z.array(inventoryItemSchema).optional().default([]),
});

export type WorkOrderFormSchemaValues = z.infer<typeof workOrderFormSchema>;
export type WorkOrderInventoryItem = z.infer<typeof inventoryItemSchema>;
