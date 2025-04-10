
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Invoice, InvoiceTemplate, InvoiceUpdater } from "@/types/invoice";
import { v4 as uuidv4 } from "uuid";

// For now, we'll use mock data until we connect to the real database
const mockTemplates: InvoiceTemplate[] = [
  {
    id: "template-1",
    name: "Standard Service",
    description: "Standard vehicle service template",
    createdAt: "2023-01-15T08:00:00Z",
    lastUsed: "2023-05-20T14:30:00Z",
    usageCount: 42,
    defaultTaxRate: 0.08,
    defaultDueDateDays: 30,
    defaultNotes: "Thank you for your business!",
    defaultItems: [
      {
        id: "item-1",
        name: "Oil Change",
        description: "Full synthetic oil change",
        quantity: 1,
        price: 79.99,
        total: 79.99
      },
      {
        id: "item-2",
        name: "Oil Filter",
        description: "Premium oil filter",
        quantity: 1,
        price: 15.99,
        total: 15.99
      },
      {
        id: "item-3",
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
    name: "Brake Service",
    description: "Complete brake service package",
    createdAt: "2023-02-10T10:15:00Z",
    lastUsed: "2023-06-12T09:45:00Z",
    usageCount: 28,
    defaultTaxRate: 0.08,
    defaultDueDateDays: 15,
    defaultNotes: "All brake services include a 12-month warranty.",
    defaultItems: [
      {
        id: "item-4",
        name: "Front Brake Pads",
        description: "Premium ceramic brake pads",
        quantity: 1,
        price: 89.99,
        total: 89.99
      },
      {
        id: "item-5",
        name: "Brake Fluid",
        description: "DOT 4 brake fluid",
        quantity: 1,
        price: 24.99,
        total: 24.99
      },
      {
        id: "item-6",
        name: "Labor",
        description: "Brake service labor",
        quantity: 1.5,
        price: 95.00,
        hours: true,
        total: 142.50
      }
    ]
  }
];

export function useInvoiceTemplates(updateInvoice?: (updater: InvoiceUpdater) => void) {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>(mockTemplates);

  // Handle applying a template
  const handleApplyTemplate = (template: InvoiceTemplate) => {
    if (!updateInvoice) return;
    
    const currentDate = new Date();
    const dueDate = new Date(currentDate);
    dueDate.setDate(dueDate.getDate() + template.defaultDueDateDays);
    
    // Generate new IDs for each item to ensure uniqueness
    const itemsWithNewIds = template.defaultItems.map(item => ({
      ...item,
      id: uuidv4()
    }));
    
    updateInvoice((prev) => ({
      ...prev,
      notes: template.defaultNotes || prev.notes,
      dueDate: dueDate.toISOString().split('T')[0],
      items: itemsWithNewIds
    }));
    
    // Update the template usage stats in our state
    const updatedTemplates = templates.map(t => 
      t.id === template.id 
        ? { ...t, lastUsed: new Date().toISOString(), usageCount: t.usageCount + 1 }
        : t
    );
    setTemplates(updatedTemplates);
    
    toast({
      title: "Template Applied",
      description: `Applied "${template.name}" template to your invoice.`
    });
  };

  // Handle saving a new template
  const handleSaveTemplate = (newTemplate: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount'>) => {
    const template: InvoiceTemplate = {
      ...newTemplate,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      usageCount: 0,
      lastUsed: null
    };
    
    // Add to templates list
    setTemplates([...templates, template]);
    
    toast({
      title: "Template Saved",
      description: `"${template.name}" template has been saved for future use.`
    });
    
    return template;
  };

  return {
    templates,
    handleApplyTemplate,
    handleSaveTemplate
  };
}
