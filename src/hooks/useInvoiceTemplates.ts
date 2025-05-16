
import { useState, useEffect } from 'react';
import { InvoiceTemplate } from '@/types/invoice';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

export function useInvoiceTemplates() {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch templates when the hook is initialized
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Fetch templates from the database
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Get template items for each template
      const templatesWithItems = await Promise.all(
        (data || []).map(async (template) => {
          const { data: itemsData } = await supabase
            .from('invoice_template_items')
            .select('*')
            .eq('template_id', template.id);
            
          return {
            ...template,
            default_items: itemsData || []
          } as InvoiceTemplate;
        })
      );
      
      setTemplates(templatesWithItems);
    } catch (error) {
      console.error('Error fetching invoice templates:', error);
      // Provide sample templates if database fetching fails
      setTemplates([
        {
          id: '1',
          name: 'Standard Service',
          description: 'Regular maintenance service',
          default_tax_rate: 0.08,
          default_items: [
            { id: '1', name: 'Oil Change', description: 'Standard oil change service', quantity: 1, price: 45.00 },
            { id: '2', name: 'Filter Replacement', description: 'Air filter replacement', quantity: 1, price: 15.00 }
          ],
          default_notes: 'Thank you for your business.',
          default_due_date_days: 30,
          created_at: new Date().toISOString(),
          usage_count: 0
        },
        {
          id: '2',
          name: 'Brake Service',
          description: 'Complete brake inspection and service',
          default_tax_rate: 0.08,
          default_items: [
            { id: '1', name: 'Brake Inspection', description: 'Thorough brake system inspection', quantity: 1, price: 75.00 },
            { id: '2', name: 'Brake Pad Replacement', description: 'Front and rear brake pad replacement', quantity: 1, price: 245.00 }
          ],
          default_notes: 'All brake work comes with a 12-month warranty.',
          default_due_date_days: 15,
          created_at: new Date().toISOString(),
          usage_count: 0
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply a template to an invoice
  const handleApplyTemplate = (template: InvoiceTemplate) => {
    // Update template usage count
    updateTemplateUsage(template.id);
    return template;
  };

  // Save a new template
  const handleSaveTemplate = async (newTemplate: Omit<InvoiceTemplate, 'id' | 'created_at' | 'usage_count'>) => {
    try {
      const templateId = uuidv4();
      const { error } = await supabase.from('invoice_templates').insert({
        id: templateId,
        name: newTemplate.name,
        description: newTemplate.description,
        default_tax_rate: newTemplate.default_tax_rate,
        default_notes: newTemplate.default_notes,
        default_due_date_days: newTemplate.default_due_date_days,
        created_at: new Date().toISOString(),
        usage_count: 0
      });

      if (error) throw error;

      // Save template items
      if (newTemplate.default_items && newTemplate.default_items.length > 0) {
        const templateItems = newTemplate.default_items.map(item => ({
          template_id: templateId,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          // Include other necessary fields
        }));

        const { error: itemsError } = await supabase
          .from('invoice_template_items')
          .insert(templateItems);

        if (itemsError) throw itemsError;
      }

      // Refresh templates list
      await fetchTemplates();
      
      return templateId;
    } catch (error) {
      console.error('Error saving invoice template:', error);
      throw error;
    }
  };

  // Update template usage count
  const updateTemplateUsage = async (templateId: string) => {
    try {
      // Get current usage count
      const { data, error } = await supabase
        .from('invoice_templates')
        .select('usage_count')
        .eq('id', templateId)
        .single();

      if (error) throw error;

      // Increment usage count
      const newCount = (data?.usage_count || 0) + 1;
      
      const { error: updateError } = await supabase
        .from('invoice_templates')
        .update({ 
          usage_count: newCount, 
          last_used: new Date().toISOString() 
        })
        .eq('id', templateId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating template usage:', error);
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
