
import { InvoiceTemplate } from "@/types/invoice";

// Dummy invoice templates for testing
export const invoiceTemplateData: InvoiceTemplate[] = [
  {
    id: "template-1",
    name: "Standard Service",
    description: "Regular service template with common parts and labor",
    usage_count: 24,
    default_tax_rate: 0.08,
    default_due_date_days: 30,
    default_notes: "Thank you for your business!",
    defaultItems: []
  },
  {
    id: "template-2",
    name: "Oil Change",
    description: "Basic oil change service",
    usage_count: 86,
    default_tax_rate: 0.08,
    default_due_date_days: 15,
    default_notes: "Next service recommended in 3 months or 3,000 miles",
    defaultItems: []
  },
  {
    id: "template-3",
    name: "Brake Service",
    description: "Complete brake service including pads and rotors",
    usage_count: 18,
    default_tax_rate: 0.08,
    default_due_date_days: 30,
    default_notes: "All parts come with a 2-year warranty",
    defaultItems: []
  }
];
