
import { useState, useEffect } from 'react';
import { WorkOrderTemplate } from '@/types/workOrder';
import { supabase } from '@/lib/supabase';

export function useWorkOrderTemplates() {
  const [templates, setTemplates] = useState<WorkOrderTemplate[]>([]);
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
        .from('work_order_templates')
        .select('*')
        .order('name');
        
      if (templateError) throw templateError;
      
      // For each template, fetch its inventory items
      const templatesWithItems = await Promise.all(templateData.map(async (template) => {
        const { data: itemsData, error: itemsError } = await supabase
          .from('work_order_template_items')
          .select('*')
          .eq('template_id', template.id);
          
        if (itemsError) throw itemsError;
        
        // Format to match WorkOrderTemplate type
        return {
          id: template.id,
          name: template.name,
          description: template.description || '',
          createdAt: template.created_at,
          lastUsed: template.last_used || null,
          usageCount: template.usage_count || 0,
          status: template.status || 'pending',
          priority: template.priority || 'medium',
          technician: template.technician || '',
          notes: template.notes || '',
          inventoryItems: itemsData.map(item => ({
            id: item.id,
            name: item.name,
            sku: item.sku || '',
            category: item.category || '',
            quantity: item.quantity,
            unitPrice: item.unit_price
          }))
        };
      }));
      
      setTemplates(templatesWithItems);
    } catch (err) {
      console.error('Error fetching work order templates:', err);
      setError('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTemplateUsage = async (templateId: string) => {
    try {
      // Update the last_used timestamp and increment the usage count
      const { error } = await supabase
        .from('work_order_templates')
        .update({
          last_used: new Date().toISOString(),
          usage_count: supabase.rpc('increment', { row_id: templateId })
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

  const createTemplate = async (template: Omit<WorkOrderTemplate, 'id' | 'createdAt' | 'usageCount'>) => {
    setIsLoading(true);
    try {
      // Insert the template
      const { data: newTemplate, error: templateError } = await supabase
        .from('work_order_templates')
        .insert({
          name: template.name,
          description: template.description,
          status: template.status,
          priority: template.priority,
          technician: template.technician,
          notes: template.notes
        })
        .select()
        .single();
        
      if (templateError) throw templateError;
      
      // Insert the inventory items
      if (template.inventoryItems && template.inventoryItems.length > 0) {
        const inventoryItems = template.inventoryItems.map(item => ({
          template_id: newTemplate.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          quantity: item.quantity,
          unit_price: item.unitPrice
        }));
        
        const { error: itemsError } = await supabase
          .from('work_order_template_items')
          .insert(inventoryItems);
          
        if (itemsError) throw itemsError;
      }
      
      // Refetch templates to get the complete data
      fetchTemplates();
      
      return {
        success: true,
        message: 'Template created successfully'
      };
    } catch (err) {
      console.error('Error creating template:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to create template'
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { templates, isLoading, error, updateTemplateUsage, createTemplate, fetchTemplates };
}

// Create a database function to increment count fields
async function createIncrementFunction() {
  const { error } = await supabase.rpc('create_increment_function', {
    sql_command: `
      CREATE OR REPLACE FUNCTION increment(row_id uuid)
      RETURNS integer AS $$
      DECLARE
        current_count integer;
      BEGIN
        SELECT usage_count INTO current_count FROM work_order_templates WHERE id = row_id;
        RETURN current_count + 1;
      END;
      $$ LANGUAGE plpgsql;
    `
  });
  
  if (error) {
    console.error('Error creating increment function:', error);
  }
}

// Ensure the increment function exists
createIncrementFunction().catch(console.error);
