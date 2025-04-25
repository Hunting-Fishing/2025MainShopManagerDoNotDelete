
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

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

export const useInvoiceTemplates = () => {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
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
      
      setTemplates(data || []);
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

  const createTemplate = useCallback(async (template: Omit<InvoiceTemplate, 'id' | 'usage_count' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .insert([{
          name: template.name,
          description: template.description,
          default_tax_rate: template.default_tax_rate,
          default_due_date_days: template.default_due_date_days,
          default_notes: template.default_notes,
          usage_count: 0
        }])
        .select();
      
      if (error) throw error;
      
      const newTemplate = data?.[0];
      if (newTemplate) {
        setTemplates(prev => [...prev, newTemplate]);
        
        toast({
          title: 'Success',
          description: 'Invoice template created successfully',
        });
      }
      
      return newTemplate;
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

  const updateTemplate = useCallback(async (id: string, updates: Partial<InvoiceTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      const updatedTemplate = data?.[0];
      if (updatedTemplate) {
        setTemplates(prev => 
          prev.map(template => template.id === id ? updatedTemplate : template)
        );
        
        toast({
          title: 'Success',
          description: 'Invoice template updated successfully',
        });
      }
      
      return updatedTemplate;
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
      const { data: templateData } = await supabase
        .from('invoice_templates')
        .select('usage_count')
        .eq('id', id)
        .single();
      
      const usageCount = templateData?.usage_count || 0;
      
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

  // Fix the type error by removing the incorrect assignment to usageCount
  const incrementUsageCount = useCallback(async (templateId: string) => {
    try {
      // Use RPC function to increment usage count
      const { error } = await supabase.rpc('increment_template_usage', {
        template_id: templateId
      });
      
      if (error) throw error;
      
      // Update local state
      setTemplates(prev => prev.map(template => {
        if (template.id === templateId) {
          return {
            ...template,
            usage_count: template.usage_count + 1,
            last_used: new Date().toISOString(),
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
  };
};
