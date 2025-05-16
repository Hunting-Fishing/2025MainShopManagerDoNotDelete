import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { 
  Invoice, 
  InvoiceTemplate,
  InvoiceItem
} from "@/types/invoice";

// Mock API calls for demo
const mockFetchTemplates = (): Promise<InvoiceTemplate[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "template-1",
          name: "Standard Invoice",
          description: "Basic invoice template with standard terms",
          default_tax_rate: 8,
          default_due_date_days: 30,
          default_notes: "Thank you for your business!",
          created_at: new Date().toISOString(),
          usage_count: 15
        },
        {
          id: "template-2",
          name: "Quick Service",
          description: "Template for small service jobs",
          default_tax_rate: 6.5,
          default_due_date_days: 15,
          default_notes: "Payment due upon receipt. Thank you!",
          created_at: new Date().toISOString(),
          usage_count: 8
        }
      ]);
    }, 500);
  });
};

const mockSaveTemplate = (template: Omit<InvoiceTemplate, "id" | "created_at" | "usage_count">): Promise<InvoiceTemplate> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...template,
        id: `template-${Date.now()}`,
        created_at: new Date().toISOString(),
        usage_count: 0
      });
    }, 500);
  });
};

export function useInvoiceTemplates() {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all invoice templates
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await mockFetchTemplates();
      setTemplates(data);
      return data;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to fetch templates";
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply a template to an invoice
  const applyTemplate = useCallback((template: InvoiceTemplate, currentInvoice: Invoice): Invoice => {
    // Generate an updated invoice based on the template
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + template.default_due_date_days);
    
    return {
      ...currentInvoice,
      // Apply template defaults
      notes: template.default_notes || currentInvoice.notes,
      due_date: dueDate.toISOString().split('T')[0],
      // Keep other fields from current invoice
    };
  }, []);

  // Save a new template based on current invoice
  const saveTemplate = useCallback(async (templateData: Omit<InvoiceTemplate, "id" | "created_at" | "usage_count">): Promise<InvoiceTemplate> => {
    try {
      const newTemplate = await mockSaveTemplate({
        name: templateData.name,
        description: templateData.description,
        default_tax_rate: templateData.default_tax_rate,
        default_due_date_days: templateData.default_due_date_days,
        default_notes: templateData.default_notes
      });
      
      // Update local templates state
      setTemplates(prev => [...prev, newTemplate]);
      
      toast({
        title: "Template Saved",
        description: `Invoice template "${newTemplate.name}" has been created.`,
      });
      
      return newTemplate;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to save template";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw new Error(errorMessage);
    }
  }, []);

  // Create a template from an existing invoice
  const createTemplateFromInvoice = useCallback((invoice: Invoice, name: string, description: string): Omit<InvoiceTemplate, "id" | "created_at" | "usage_count"> => {
    // Calculate due date days from invoice due date
    const invoiceDate = new Date(invoice.date);
    const dueDate = new Date(invoice.due_date);
    const daysDifference = Math.round((dueDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      name,
      description,
      default_tax_rate: 8, // Default tax rate
      default_due_date_days: daysDifference > 0 ? daysDifference : 30,
      default_notes: invoice.notes || "",
    };
  }, []);

  // Update the example templates to include required total field
  const exampleTemplate1: InvoiceTemplate = {
    id: "template-1",
    name: "Basic Service",
    description: "Standard service template with common items",
    default_tax_rate: 0.08,
    default_due_date_days: 30,
    default_notes: "Thank you for your business!",
    default_items: [
      { 
        id: "item-1", 
        name: "Oil Change", 
        description: "Standard oil change service", 
        quantity: 1, 
        price: 39.99, 
        total: 39.99 
      },
      { 
        id: "item-2", 
        name: "Filter Replacement", 
        description: "Engine filter replacement", 
        quantity: 1, 
        price: 25.00, 
        total: 25.00 
      }
    ],
    created_at: new Date().toISOString(),
    usage_count: 0,
    last_used: null,
  };

  const exampleTemplate2: InvoiceTemplate = {
    id: "template-2",
    name: "Full Service",
    description: "Complete vehicle service template",
    default_tax_rate: 0.08,
    default_due_date_days: 30,
    default_notes: "Thank you for choosing our full service option!",
    default_items: [
      { 
        id: "item-3", 
        name: "Oil Change", 
        description: "Premium oil change service", 
        quantity: 1, 
        price: 59.99, 
        total: 59.99 
      },
      { 
        id: "item-4", 
        name: "Filter Replacement", 
        description: "Engine and air filter replacement", 
        quantity: 1, 
        price: 45.00, 
        total: 45.00 
      },
      { 
        id: "item-5", 
        name: "Tire Rotation", 
        description: "Standard tire rotation", 
        quantity: 1, 
        price: 35.00, 
        total: 35.00 
      }
    ],
    created_at: new Date().toISOString(),
    usage_count: 0,
    last_used: null,
  };

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    applyTemplate,
    saveTemplate,
    createTemplateFromInvoice
  };
}
