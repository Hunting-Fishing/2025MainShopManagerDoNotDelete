
import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { Invoice, InvoiceTemplate, InvoiceUpdater } from "@/types/invoice";
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from "uuid";

export function useInvoiceTemplates(updateInvoice?: (updater: InvoiceUpdater) => void) {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch templates
      const { data: templateData, error: templateError } = await supabase
        .from('invoice_templates')
        .select('*')
        .order('name');
        
      if (templateError) throw templateError;
      
      // For each template, fetch its items
      const templatesWithItems = await Promise.all(templateData.map(async (template) => {
        const { data: itemsData, error: itemsError } = await supabase
          .from('invoice_template_items')
          .select('*')
          .eq('template_id', template.id);
          
        if (itemsError) throw itemsError;
        
        // Format to match InvoiceTemplate type
        return {
          id: template.id,
          name: template.name,
          description: template.description || '',
          createdAt: template.created_at,
          lastUsed: template.last_used || null,
          usageCount: template.usage_count || 0,
          defaultTaxRate: template.default_tax_rate || 0,
          defaultDueDateDays: template.default_due_date_days || 30,
          defaultNotes: template.default_notes || '',
          defaultItems: itemsData.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
            hours: item.hours || false,
            total: Number(item.price) * Number(item.quantity) || 0
          }))
        };
      }));
      
      setTemplates(templatesWithItems);
    } catch (err) {
      console.error('Error fetching invoice templates:', err);
      setError('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTemplateUsage = async (templateId: string) => {
    try {
      // Update the last_used timestamp and increment the usage count
      const { error } = await supabase
        .from('invoice_templates')
        .update({
          last_used: new Date().toISOString(),
          usage_count: supabase.rpc('increment_invoice_usage', { row_id: templateId })
        })
        .eq('id', templateId);
        
      if (error) throw error;
      
      // Update local state
      setTemplates(prev => 
        prev.map(t => 
          t.id === templateId 
            ? { ...t, lastUsed: new Date().toISOString(), usageCount: t.usageCount + 1 }
            : t
        )
      );
    } catch (err) {
      console.error('Error updating template usage:', err);
    }
  };

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
    
    // Update the template usage stats
    updateTemplateUsage(template.id);
    
    toast({
      title: "Template Applied",
      description: `Applied "${template.name}" template to your invoice.`
    });
  };

  // Handle saving a new template
  const handleSaveTemplate = async (newTemplate: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount'>) => {
    setIsLoading(true);
    try {
      // Insert the template
      const { data: templateData, error: templateError } = await supabase
        .from('invoice_templates')
        .insert({
          name: newTemplate.name,
          description: newTemplate.description,
          default_tax_rate: newTemplate.defaultTaxRate,
          default_due_date_days: newTemplate.defaultDueDateDays,
          default_notes: newTemplate.defaultNotes
        })
        .select()
        .single();
        
      if (templateError) throw templateError;
      
      // Insert the template items
      if (newTemplate.defaultItems && newTemplate.defaultItems.length > 0) {
        const templateItems = newTemplate.defaultItems.map(item => ({
          template_id: templateData.id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          hours: item.hours || false
        }));
        
        const { error: itemsError } = await supabase
          .from('invoice_template_items')
          .insert(templateItems);
          
        if (itemsError) throw itemsError;
      }
      
      // Refetch templates to get the complete data
      fetchTemplates();
      
      toast({
        title: "Template Saved",
        description: `"${newTemplate.name}" template has been saved for future use.`
      });
    } catch (err) {
      console.error('Error saving template:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to save template',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    templates,
    isLoading,
    error,
    handleApplyTemplate,
    handleSaveTemplate,
    fetchTemplates
  };
}

// Create a function to increment invoice template usage count
async function createInvoiceIncrementFunction() {
  const { error } = await supabase.rpc('create_invoice_increment_function', {
    sql_command: `
      CREATE OR REPLACE FUNCTION increment_invoice_usage(row_id uuid)
      RETURNS integer AS $$
      DECLARE
        current_count integer;
      BEGIN
        SELECT usage_count INTO current_count FROM invoice_templates WHERE id = row_id;
        RETURN current_count + 1;
      END;
      $$ LANGUAGE plpgsql;
    `
  });
  
  if (error) {
    console.error('Error creating invoice increment function:', error);
  }
}

// Ensure the increment function exists
createInvoiceIncrementFunction().catch(console.error);
