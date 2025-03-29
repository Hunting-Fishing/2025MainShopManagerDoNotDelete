
import { WorkOrderTemplate } from "@/types/workOrder";
import { v4 as uuidv4 } from "uuid";

// Mock data for work order templates
export const workOrderTemplates: WorkOrderTemplate[] = [
  {
    id: "template-1",
    name: "HVAC Maintenance",
    description: "Standard HVAC system maintenance check and service",
    createdAt: "2023-08-10T10:30:00",
    lastUsed: "2023-09-15T14:45:00",
    usageCount: 24,
    status: "pending",
    priority: "medium",
    technician: "Michael Brown",
    notes: "Check filters, coils, refrigerant levels, and electrical components. Perform standard cleaning.",
    inventoryItems: [
      {
        id: "inv-1",
        name: "Air Filter (MERV 13)",
        sku: "FILT-M13",
        category: "HVAC Parts",
        quantity: 1,
        unitPrice: 29.99
      },
      {
        id: "inv-2",
        name: "Refrigerant (R-410A)",
        sku: "REF-410A",
        category: "HVAC Chemicals",
        quantity: 1,
        unitPrice: 85.50
      }
    ]
  },
  {
    id: "template-2",
    name: "Electrical Panel Inspection",
    description: "Complete electrical panel safety inspection",
    createdAt: "2023-07-22T09:15:00",
    lastUsed: "2023-09-10T11:20:00",
    usageCount: 18,
    status: "pending",
    priority: "high",
    technician: "Sarah Johnson",
    notes: "Check all circuit breakers, inspect wiring condition, test GFCI outlets, verify proper grounding.",
    inventoryItems: []
  },
  {
    id: "template-3",
    name: "Plumbing Service Call",
    description: "General plumbing inspection and service",
    createdAt: "2023-08-05T16:20:00",
    lastUsed: "2023-09-18T10:30:00",
    usageCount: 15,
    status: "pending",
    priority: "medium",
    technician: "David Lee",
    notes: "Check for leaks, inspect water pressure, examine drain functionality.",
    inventoryItems: [
      {
        id: "inv-5",
        name: "Plumbing Tape",
        sku: "TAPE-P1",
        category: "Plumbing Supplies",
        quantity: 1,
        unitPrice: 3.99
      }
    ]
  }
];

// Function to create a new template
export const createTemplate = (template: Omit<WorkOrderTemplate, 'id' | 'createdAt' | 'usageCount'>): WorkOrderTemplate => {
  return {
    id: `template-${Date.now()}`,
    createdAt: new Date().toISOString(),
    usageCount: 0,
    ...template
  };
};

// Function to update a template's usage
export const updateTemplateUsage = (templateId: string): void => {
  const template = workOrderTemplates.find(t => t.id === templateId);
  if (template) {
    template.lastUsed = new Date().toISOString();
    template.usageCount += 1;
  }
};
