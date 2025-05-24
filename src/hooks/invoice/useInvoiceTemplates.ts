
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { InvoiceTemplate } from '@/types/invoice';

export function useInvoiceTemplates() {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to include required properties
      const transformedData = (data || []).map(template => ({
        ...template,
        last_used: template.last_used || null,
        default_items: template.default_items || []
      }));
      
      setTemplates(transformedData);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<InvoiceTemplate, 'id' | 'created_at' | 'usage_count'>) => {
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .insert([{
          ...templateData,
          usage_count: 0,
          last_used: templateData.last_used || null,
          default_items: templateData.default_items || []
        }])
        .select()
        .single();

      if (error) throw error;

      const newTemplate = {
        ...data,
        last_used: data.last_used || null,
        default_items: data.default_items || []
      };

      setTemplates(prev => [newTemplate, ...prev]);
      
      toast({
        title: "Success",
        description: "Template created successfully"
      });
      
      return newTemplate;
    } catch (err: any) {
      toast({
        title: "Error", 
        description: "Failed to create template",
        variant: "destructive"
      });
      throw err;
    }
  };

  const saveTemplate = async (templateData: Omit<InvoiceTemplate, 'id' | 'created_at' | 'usage_count'>) => {
    return createTemplate({
      ...templateData,
      last_used: templateData.last_used || null,
      default_items: templateData.default_items || []
    });
  };

  const updateTemplate = async (id: string, updates: Partial<InvoiceTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedTemplate = {
        ...data,
        last_used: data.last_used || null,
        default_items: data.default_items || []
      };

      setTemplates(prev => 
        prev.map(template => 
          template.id === id ? updatedTemplate : template
        )
      );

      return updatedTemplate;
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive"
      });
      throw err;
    }
  };

  return {
    templates,
    loading,
    createTemplate,
    saveTemplate,
    updateTemplate,
    refetch: fetchTemplates
  };
}
