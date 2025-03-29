
import { InvoiceTemplate } from "@/types/invoice";
import { v4 as uuidv4 } from "uuid";

// Mock data for invoice templates
export const invoiceTemplates: InvoiceTemplate[] = [
  {
    id: "template-1",
    name: "HVAC Service",
    description: "Standard template for HVAC maintenance services",
    createdAt: "2023-08-10T10:30:00",
    lastUsed: "2023-09-15T14:45:00",
    usageCount: 24,
    defaultTaxRate: 0.08,
    defaultDueDateDays: 30,
    defaultNotes: "All HVAC services include a 90-day warranty on parts and labor.",
    defaultItems: [
      { 
        id: uuidv4(), 
        name: "HVAC System Inspection", 
        description: "Complete diagnostic and inspection of HVAC system", 
        quantity: 1, 
        price: 89.99, 
        total: 89.99 
      },
      { 
        id: uuidv4(), 
        name: "Filter Replacement", 
        description: "Replace air filters", 
        quantity: 1, 
        price: 35.50, 
        total: 35.50 
      },
      { 
        id: uuidv4(), 
        name: "Labor", 
        description: "Standard service labor", 
        quantity: 1, 
        price: 65.00, 
        hours: true, 
        total: 65.00 
      }
    ]
  },
  {
    id: "template-2",
    name: "Electrical Work",
    description: "Template for standard electrical services",
    createdAt: "2023-07-22T09:15:00",
    lastUsed: "2023-09-10T11:20:00",
    usageCount: 18,
    defaultTaxRate: 0.07,
    defaultDueDateDays: 21,
    defaultNotes: "All electrical work complies with local building codes and includes necessary permits.",
    defaultItems: [
      { 
        id: uuidv4(), 
        name: "Electrical Inspection", 
        description: "Safety inspection of electrical systems", 
        quantity: 1, 
        price: 75.00, 
        total: 75.00 
      },
      { 
        id: uuidv4(), 
        name: "Labor", 
        description: "Electrician labor", 
        quantity: 2, 
        price: 85.00, 
        hours: true, 
        total: 170.00 
      }
    ]
  },
  {
    id: "template-3",
    name: "Plumbing Repairs",
    description: "Template for common plumbing repairs",
    createdAt: "2023-08-05T16:20:00",
    lastUsed: "2023-09-18T10:30:00",
    usageCount: 15,
    defaultTaxRate: 0.065,
    defaultDueDateDays: 15,
    defaultNotes: "Emergency plumbing services available 24/7 at standard rates.",
    defaultItems: [
      { 
        id: uuidv4(), 
        name: "Pipe Inspection", 
        description: "Visual and camera inspection of pipes", 
        quantity: 1, 
        price: 95.00, 
        total: 95.00 
      },
      { 
        id: uuidv4(), 
        name: "Labor", 
        description: "Plumber labor", 
        quantity: 1.5, 
        price: 75.00, 
        hours: true, 
        total: 112.50 
      }
    ]
  }
];

// Function to create a new template
export const createTemplate = (template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount'>): InvoiceTemplate => {
  return {
    id: `template-${Date.now()}`,
    createdAt: new Date().toISOString(),
    usageCount: 0,
    ...template
  };
};

// Function to update a template's usage
export const updateTemplateUsage = (templateId: string): void => {
  const template = invoiceTemplates.find(t => t.id === templateId);
  if (template) {
    template.lastUsed = new Date().toISOString();
    template.usageCount += 1;
  }
};
