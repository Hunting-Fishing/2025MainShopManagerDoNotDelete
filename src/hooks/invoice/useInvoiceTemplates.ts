
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Invoice, InvoiceTemplate, InvoiceTemplateItem } from '@/types/invoice';

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
      
      // Map database response to expected InvoiceTemplate type
      const templateData: InvoiceTemplate[] = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        description: template.description || '',
        defaultTaxRate: template.default_tax_rate || 0,
        defaultDueDateDays: template.default_due_date_days || 30,
        defaultNotes: template.default_notes || '',
        createdAt: template.created_at,
        usageCount: template.usage_count || 0,
        lastUsed: template.last_used || '',
        defaultItems: [] // Will be populated later on demand
      }));
      
      setTemplates(templateData);
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
      
      // Map database response to expected InvoiceTemplateItem type
      return (data || []).map(item => ({
        id: item.id,
        templateId: item.template_id,
        name: item.name,
        description: item.description || '',
        quantity: item.quantity || 1,
        price: item.price,
        total: item.total || item.quantity * item.price,
        hours: item.hours || false,
        sku: item.sku || '',
        category: item.category || '',
        createdAt: item.created_at
      }));
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

  const createTemplate = useCallback(async (template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'usageCount' | 'lastUsed' | 'defaultItems'>) => {
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .insert([{
          name: template.name,
          description: template.description,
          default_tax_rate: template.defaultTaxRate,
          default_due_date_days: template.defaultDueDateDays,
          default_notes: template.defaultNotes
        }])
        .select();
      
      if (error) throw error;
      
      const newTemplate = data?.[0];
      if (newTemplate) {
        // Convert to our application's template format
        const mappedTemplate: InvoiceTemplate = {
          id: newTemplate.id,
          name: newTemplate.name,
          description: newTemplate.description || '',
          defaultTaxRate: newTemplate.default_tax_rate || 0,
          defaultDueDateDays: newTemplate.default_due_date_days || 30,
          defaultNotes: newTemplate.default_notes || '',
          createdAt: newTemplate.created_at,
          usageCount: 0,
          lastUsed: '',
          defaultItems: []
        };
        
        setTemplates(prev => [...prev, mappedTemplate]);
        
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
      // Convert from our app format to database format
      const dbUpdates: any = {};
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
        // Convert to our application's template format
        const mappedTemplate: InvoiceTemplate = {
          id: updatedTemplate.id,
          name: updatedTemplate.name,
          description: updatedTemplate.description || '',
          defaultTaxRate: updatedTemplate.default_tax_rate || 0,
          defaultDueDateDays: updatedTemplate.default_due_date_days || 30,
          defaultNotes: updatedTemplate.default_notes || '',
          createdAt: updatedTemplate.created_at,
          usageCount: updatedTemplate.usage_count || 0,
          lastUsed: updatedTemplate.last_used || '',
          defaultItems: [] // Maintain existing items
        };
        
        setTemplates(prev => 
          prev.map(template => template.id === id ? 
            { ...template, ...mappedTemplate } : 
            template
          )
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
            usageCount: template.usageCount + 1,
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

  // Apply a template to an invoice
  const handleApplyTemplate = useCallback(async (template: InvoiceTemplate) => {
    try {
      // Get template items
      const items = await fetchTemplateItems(template.id);
      template.defaultItems = items;
      
      // Increment usage count
      await incrementUsageCount(template.id);
      
      return template;
    } catch (error) {
      console.error('Error applying template:', error);
      return null;
    }
  }, [fetchTemplateItems, incrementUsageCount]);

  // Save an invoice as a template
  const handleSaveTemplate = useCallback(async (invoice: Invoice, taxRate: number) => {
    try {
      // Create template
      const templateData = {
        name: `Template from Invoice ${invoice.id.substring(0, 6)}`,
        description: `Created from Invoice ${invoice.id}`,
        defaultTaxRate: taxRate,
        defaultDueDateDays: 30,
        defaultNotes: invoice.notes || ''
      };
      
      const newTemplate = await createTemplate(templateData);
      
      if (!newTemplate) {
        throw new Error('Failed to create template');
      }
      
      // Save invoice items as template items
      const templateItems = invoice.items.map(item => ({
        template_id: newTemplate.id,
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        price: item.price,
        hours: item.hours || false,
        sku: item.sku || '',
        category: item.category || ''
      }));
      
      if (templateItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_template_items')
          .insert(templateItems);
        
        if (itemsError) {
          throw itemsError;
        }
      }
      
      toast({
        title: 'Success',
        description: 'Invoice saved as template successfully',
      });
      
      return true;
    } catch (err) {
      console.error('Error saving invoice as template:', err);
      toast({
        title: 'Error',
        description: 'Failed to save invoice as template',
        variant: 'destructive',
      });
      return false;
    }
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
