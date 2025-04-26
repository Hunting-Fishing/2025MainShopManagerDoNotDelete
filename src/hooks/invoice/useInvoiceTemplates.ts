
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { 
  Invoice, 
  InvoiceTemplate as InvoiceTemplateType, 
  InvoiceTemplateItem 
} from "@/types/invoice";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { adaptInvoiceItemsToTemplateItems } from "@/components/invoices/templates/helpers";

// Fixed InvoiceTemplate interface to match our usage
interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  defaultNotes?: string;
  defaultDueDateDays?: number;
  defaultTaxRate?: number;
  createdAt: string;
  usageCount: number;
  lastUsed: string | null;
  defaultItems: InvoiceTemplateItem[];
}

export function useInvoiceTemplates(
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>
) {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Load templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        // In a real application, this would fetch from your backend
        const mockTemplates: InvoiceTemplate[] = [
          {
            id: "template-1",
            name: "Basic Service",
            description: "Standard service template",
            defaultTaxRate: 0.08,
            defaultDueDateDays: 30,
            defaultNotes: "Thank you for your business!",
            createdAt: new Date().toISOString(),
            usageCount: 5,
            lastUsed: new Date().toISOString(),
            defaultItems: [
              {
                id: "item-1",
                name: "Oil Change",
                description: "Full synthetic oil change",
                price: 49.99,
                quantity: 1,
                total: 49.99,
                templateId: "template-1",
                createdAt: new Date().toISOString()
              },
              {
                id: "item-2",
                name: "Oil Filter",
                description: "Premium oil filter",
                price: 12.99,
                quantity: 1,
                total: 12.99,
                templateId: "template-1",
                createdAt: new Date().toISOString()
              }
            ]
          }
        ];
        
        setTemplates(mockTemplates);
      } catch (error) {
        console.error("Error loading templates:", error);
        toast({
          title: "Error",
          description: "Failed to load invoice templates",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [toast]);

  // Function to apply a template to the current invoice
  const handleApplyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    
    if (!template) {
      toast({
        title: "Template not found",
        description: "The selected template could not be found",
        variant: "destructive",
      });
      return;
    }

    // Update template usage stats
    const updatedTemplate = {
      ...template,
      usageCount: (template.usageCount || 0) + 1,
      lastUsed: new Date().toISOString()
    };

    // Update templates list
    setTemplates(prev => 
      prev.map(t => t.id === templateId ? updatedTemplate : t)
    );

    // Convert template items to invoice items (removing template-specific fields)
    const invoiceItems = template.defaultItems.map(item => ({
      id: uuidv4(),
      name: item.name,
      description: item.description || "",
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      hours: item.hours,
      sku: item.sku,
      category: item.category
    }));

    // Get current date and due date based on template settings
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + (template.defaultDueDateDays || 30));

    // Update invoice with template data
    setInvoice(prev => ({
      ...prev,
      items: invoiceItems,
      notes: template.defaultNotes || prev.notes || "",
      date: today.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0]
    }));

    toast({
      title: "Template Applied",
      description: `Applied "${template.name}" template to invoice`,
    });
  };

  // Function to save current invoice as a new template
  const handleSaveTemplate = async (templateData: Omit<InvoiceTemplate, "id" | "createdAt" | "usageCount">) => {
    try {
      // Generate a new template ID
      const templateId = uuidv4();
      
      // Create the new template object
      const newTemplate: InvoiceTemplate = {
        id: templateId,
        name: templateData.name,
        description: templateData.description,
        defaultNotes: templateData.defaultNotes,
        defaultDueDateDays: templateData.defaultDueDateDays,
        defaultTaxRate: templateData.defaultTaxRate,
        createdAt: new Date().toISOString(),
        usageCount: 0,
        lastUsed: null,
        defaultItems: templateData.defaultItems.map(item => ({
          ...item,
          templateId
        }))
      };

      // Update templates state
      setTemplates(prev => [...prev, newTemplate]);

      toast({
        title: "Template Saved",
        description: `Template "${templateData.name}" has been saved`,
      });

      return newTemplate;
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    templates,
    loading,
    handleApplyTemplate,
    handleSaveTemplate,
  };
}
