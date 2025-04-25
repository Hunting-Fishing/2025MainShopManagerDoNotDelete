
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { InvoiceTemplate as AppInvoiceTemplate, Invoice } from '@/types/invoice';
import { toast } from '@/hooks/use-toast';

// Database model for invoice template
export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  default_tax_rate?: number;
  default_due_date_days?: number;
  default_notes?: string;
  usage_count: number;
  last_used?: string;
  created_at: string;
}

// Database model for invoice template item
export interface InvoiceTemplateItem {
  id: string;
  template_id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total?: number;
  hours: boolean;
  sku?: string;
  category?: string;
  created_at: string;
}

// Map database template to application model
const mapToAppTemplate = (dbTemplate: InvoiceTemplate): AppInvoiceTemplate => {
  return {
    id: dbTemplate.id,
    name: dbTemplate.name,
    description: dbTemplate.description || '',
    defaultTaxRate: dbTemplate.default_tax_rate || 0,
    defaultDueDateDays: dbTemplate.default_due_date_days || 30,
    defaultNotes: dbTemplate.default_notes || '',
    createdAt: dbTemplate.created_at,
    usageCount: dbTemplate.usage_count || 0,
    lastUsed: dbTemplate.last_used || null,
  };
};

export const useInvoiceTemplates = (setInvoice?: React.Dispatch<React.SetStateAction<Invoice>>) => {
  const [templates, setTemplates] = useState<AppInvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setTemplates(data ? data.map(mapToAppTemplate) : []);
    } catch (err) {
      console.error('Error fetching invoice templates:', err);
      setError('Failed to load invoice templates');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTemplateItems = useCallback(async (templateId: string): Promise<InvoiceTemplateItem[]> => {
    try {
      const { data, error } = await supabase
        .from('invoice_template_items')
        .select('*')
        .eq('template_id', templateId)
        .order('name');
      
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Error fetching template items:', err);
      toast({
        title: 'Error',
        description: 'Failed to load template items',
        variant: 'destructive',
      });
      return [];
    }
  }, []);

  const createTemplate = useCallback(async (template: Omit<AppInvoiceTemplate, 'id' | 'usageCount' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .insert([{
          name: template.name,
          description: template.description,
          default_tax_rate: template.defaultTaxRate,
          default_due_date_days: template.defaultDueDateDays,
          default_notes: template.defaultNotes,
          usage_count: 0
        }])
        .select();
      
      if (error) throw error;
      
      const newTemplate = data?.[0];
      if (newTemplate) {
        setTemplates(prev => [...prev, mapToAppTemplate(newTemplate)]);
        
        toast({
          title: 'Success',
          description: 'Invoice template created successfully',
        });
      }
      
      return mapToAppTemplate(newTemplate);
    } catch (err) {
      console.error('Error creating invoice template:', err);
      toast({
        title: 'Error',
        description: 'Failed to create invoice template',
        variant: 'destructive',
      });
      return null;
    }
  }, []);

  const updateTemplate = useCallback(async (id: string, updates: Partial<AppInvoiceTemplate>) => {
    try {
      const dbUpdates: Partial<InvoiceTemplate> = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.defaultTaxRate !== undefined) dbUpdates.default_tax_rate = updates.defaultTaxRate;
      if (updates.defaultDueDateDays !== undefined) dbUpdates.default_due_date_days = updates.defaultDueDateDays;
      if (updates.defaultNotes !== undefined) dbUpdates.default_notes = updates.defaultNotes;

      const { data, error } = await supabase
        .from('invoice_templates')
        .update(dbUpdates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      const updatedTemplate = data?.[0];
      if (updatedTemplate) {
        setTemplates(prev => 
          prev.map(template => template.id === id ? mapToAppTemplate(updatedTemplate) : template)
        );
        
        toast({
          title: 'Success',
          description: 'Invoice template updated successfully',
        });
      }
      
      return updatedTemplate ? mapToAppTemplate(updatedTemplate) : null;
    } catch (err) {
      console.error('Error updating invoice template:', err);
      toast({
        title: 'Error',
        description: 'Failed to update invoice template',
        variant: 'destructive',
      });
      return null;
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      // First check usage count
      const { data } = await supabase
        .from('invoice_templates')
        .select('usage_count')
        .eq('id', id)
        .single();
      
      const usageCount = data?.usage_count || 0;
      
      // Get confirmation for templates that have been used
      if (usageCount > 0) {
        const confirm = window.confirm(`This template has been used ${usageCount} times. Are you sure you want to delete it?`);
        if (!confirm) return false;
      }
      
      // Delete template items first
      const { error: itemsError } = await supabase
        .from('invoice_template_items')
        .delete()
        .eq('template_id', id);
      
      if (itemsError) throw itemsError;
      
      // Then delete the template
      const { error } = await supabase
        .from('invoice_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTemplates(prev => prev.filter(template => template.id !== id));
      
      toast({
        title: 'Success',
        description: 'Invoice template deleted successfully',
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting invoice template:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete invoice template',
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  const incrementUsageCount = useCallback(async (templateId: string) => {
    try {
      // Call the RPC function
      const { error } = await supabase.rpc('increment_template_usage', {
        template_id: templateId
      });
      
      if (error) throw error;
      
      // Update local state
      setTemplates(prev => prev.map(template => {
        if (template.id === templateId) {
          return {
            ...template,
            usageCount: (template.usageCount || 0) + 1,
            lastUsed: new Date().toISOString(),
          };
        }
        return template;
      }));
      
      return true;
    } catch (err) {
      console.error('Error incrementing usage count:', err);
      return false;
    }
  }, []);

  // Apply template to an invoice
  const handleApplyTemplate = useCallback((template: AppInvoiceTemplate) => {
    if (setInvoice) {
      setInvoice((prev) => ({
        ...prev,
        taxRate: template.defaultTaxRate || prev.taxRate,
        dueDate: (() => {
          const date = new Date();
          date.setDate(date.getDate() + (template.defaultDueDateDays || 30));
          return date.toISOString().split('T')[0];
        })(),
        notes: template.defaultNotes || prev.notes,
      }));

      // Update template usage count
      incrementUsageCount(template.id);
    }
  }, [setInvoice, incrementUsageCount]);

  // Save current invoice as template
  const handleSaveTemplate = useCallback((template: Omit<AppInvoiceTemplate, 'id' | 'createdAt' | 'usageCount'>) => {
    return createTemplate(template);
  }, [createTemplate]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    fetchTemplateItems,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsageCount,
    handleApplyTemplate,
    handleSaveTemplate
  };
};
