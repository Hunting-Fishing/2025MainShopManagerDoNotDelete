
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Invoice, InvoiceTemplate, InvoiceUpdater } from "@/types/invoice";
import { v4 as uuidv4 } from "uuid";
import { supabase } from '@/lib/supabase';

export function useInvoiceTemplates(updateInvoice?: (updater: InvoiceUpdater) => void) {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      // Fetch templates from the database
      const { data, error } = await supabase
        .from('invoice_templates')
        .select(`
          *,
          default_items:invoice_template_items(*)
        `);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedTemplates = data.map(template => {
          return {
            id: template.id,
            name: template.name,
            description: template.description || "",
            createdAt: template.created_at,
            lastUsed: template.last_used || null,
            usageCount: template.usage_count || 0,
            defaultTaxRate: template.default_tax_rate || 0.08,
            defaultDueDateDays: template.default_due_date_days || 30,
            defaultNotes: template.default_notes || "",
            defaultItems: Array.isArray(template.default_items) 
              ? template.default_items.map(item => ({
                  id: item.id,
                  name: item.name,
                  description: item.description || "",
                  quantity: item.quantity,
                  price: item.price,
                  total: item.total || item.price * item.quantity,
                  hours: item.hours || false,
                  sku: item.sku || "",
                  category: item.category || ""
                }))
              : []
          };
        });
        
        setTemplates(formattedTemplates);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      console.error('Error fetching invoice templates:', err);
      toast({
        title: "Error",
        description: "Failed to load invoice templates.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
    
    // Update the template usage in the database
    updateTemplateUsage(template.id);
    
    toast({
      title: "Template Applied",
      description: `Applied "${template.name}" template to your invoice.`
    });
  };

  // Update template usage
  const updateTemplateUsage = async (templateId: string) => {
    try {
      // Update the database
      const { error } = await supabase
        .from('invoice_templates')
        .update({
          last_used: new Date().toISOString(),
          usage_count: supabase.rpc('increment_template_usage', { template_id: templateId })
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

  // Handle saving a new template
  const handleSaveTemplate = async (newTemplate: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount'>) => {
    try {
      const templateId = uuidv4();
      
      // Insert new template into the database
      const { error: templateError } = await supabase
        .from('invoice_templates')
        .insert({
          id: templateId,
          name: newTemplate.name,
          description: newTemplate.description,
          default_tax_rate: newTemplate.defaultTaxRate,
          default_due_date_days: newTemplate.defaultDueDateDays,
          default_notes: newTemplate.defaultNotes,
          created_at: new Date().toISOString(),
          usage_count: 0
        });
      
      if (templateError) throw templateError;
      
      // Insert template items if they exist
      if (newTemplate.defaultItems && newTemplate.defaultItems.length > 0) {
        const templateItems = newTemplate.defaultItems.map(item => ({
          template_id: templateId,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          hours: item.hours || false,
          sku: item.sku || "",
          category: item.category || ""
        }));
        
        const { error: itemsError } = await supabase
          .from('invoice_template_items')
          .insert(templateItems);
        
        if (itemsError) throw itemsError;
      }
      
      // Create full template object for state
      const template: InvoiceTemplate = {
        ...newTemplate,
        id: templateId,
        createdAt: new Date().toISOString(),
        usageCount: 0,
        lastUsed: null
      };
      
      // Add to templates list in state
      setTemplates([...templates, template]);
      
      toast({
        title: "Template Saved",
        description: `"${template.name}" template has been saved for future use.`
      });
      
      return template;
    } catch (err) {
      console.error('Error saving template:', err);
      toast({
        title: "Error",
        description: "Failed to save template.",
        variant: "destructive"
      });
      throw err;
    }
  };

  return {
    templates,
    isLoading,
    handleApplyTemplate,
    handleSaveTemplate,
    fetchTemplates
  };
}
