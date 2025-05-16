
import { useState, useCallback, Dispatch, SetStateAction, useEffect } from "react";
import { Invoice, InvoiceTemplate } from "@/types/invoice";
import { supabase } from "@/lib/supabase";

export function useInvoiceTemplates(setInvoice?: Dispatch<SetStateAction<Invoice>>) {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoice_templates')
        .select('*');

      if (error) throw error;
      
      if (data) {
        // Map the database fields to our InvoiceTemplate interface
        const mappedTemplates: InvoiceTemplate[] = data.map(template => ({
          id: template.id,
          name: template.name,
          description: template.description || undefined,
          default_tax_rate: template.default_tax_rate || 0.0,
          default_due_date_days: template.default_due_date_days || 30,
          default_notes: template.default_notes || undefined,
          default_items: template.default_items || [],
          created_at: template.created_at,
          last_used: template.last_used || null,
          usage_count: template.usage_count || 0
        }));
        
        setTemplates(mappedTemplates);
      }
    } catch (error) {
      console.error("Error fetching invoice templates:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Apply a template to the current invoice
  const handleApplyTemplate = useCallback((template: InvoiceTemplate) => {
    if (!setInvoice) return;

    setInvoice(prev => {
      // Calculate new due date based on template settings
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (template.default_due_date_days || 30));
      
      return {
        ...prev,
        notes: template.default_notes || prev.notes,
        items: [...(template.default_items || [])],
        due_date: dueDate.toISOString().split('T')[0]
      };
    });

    // Update template usage
    updateTemplateUsage(template.id);
  }, [setInvoice]);

  // Save a new template
  const handleSaveTemplate = useCallback(async (template: Omit<InvoiceTemplate, "id" | "created_at" | "usageCount">) => {
    try {
      setLoading(true);
      
      // Map the template to match database field names
      const dbTemplate = {
        name: template.name,
        description: template.description,
        default_tax_rate: template.default_tax_rate,
        default_due_date_days: template.default_due_date_days,
        default_notes: template.default_notes,
        default_items: template.default_items,
      };
      
      const { data, error } = await supabase
        .from('invoice_templates')
        .insert(dbTemplate)
        .select();

      if (error) throw error;
      
      if (data) {
        fetchTemplates(); // Refresh templates
      }
    } catch (error) {
      console.error("Error saving invoice template:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update template usage count and last used
  const updateTemplateUsage = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('invoice_templates')
        .update({
          usage_count: supabase.rpc('increment', { row_id: templateId, table_name: 'invoice_templates', column_name: 'usage_count' }),
          last_used: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error) throw error;
      
      // Update local template data
      setTemplates(prev => 
        prev.map(t => 
          t.id === templateId 
            ? { ...t, usage_count: (t.usage_count || 0) + 1, last_used: new Date().toISOString() } 
            : t
        )
      );
    } catch (error) {
      console.error("Error updating template usage:", error);
    }
  };

  return {
    templates,
    loading,
    handleApplyTemplate,
    handleSaveTemplate
  };
}
