
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { 
  Invoice, 
  InvoiceTemplate,
  InvoiceItem
} from "@/types/invoice";
import { supabase } from "@/integrations/supabase/client";

export function useInvoiceTemplates() {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all invoice templates
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      setTemplates(data || []);
      return data || [];
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
    dueDate.setDate(dueDate.getDate() + (template.default_due_date_days || 30));
    
    // Use template default items if available
    const items = template.default_items || currentInvoice.items || [];
    
    return {
      ...currentInvoice,
      notes: template.default_notes || currentInvoice.notes,
      due_date: dueDate.toISOString().split('T')[0],
      tax_rate: template.default_tax_rate || currentInvoice.tax_rate,
      items: items
    };
  }, []);

  // Save a new template based on current invoice
  const saveTemplate = useCallback(async (templateData: Omit<InvoiceTemplate, "id" | "created_at" | "usage_count">): Promise<InvoiceTemplate> => {
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .insert({
          name: templateData.name,
          description: templateData.description,
          default_tax_rate: templateData.default_tax_rate,
          default_due_date_days: templateData.default_due_date_days,
          default_notes: templateData.default_notes,
          default_items: templateData.default_items,
          usage_count: 0
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local templates state
      setTemplates(prev => [...prev, data]);
      
      toast("Template Saved", {
        description: `Invoice template "${data.name}" has been created.`
      });
      
      return data;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to save template";
      
      toast("Error", {
        description: errorMessage
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
      default_tax_rate: invoice.tax_rate || 0,
      default_due_date_days: daysDifference > 0 ? daysDifference : 30,
      default_notes: invoice.notes || "",
      default_items: invoice.items || []
    };
  }, []);

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
