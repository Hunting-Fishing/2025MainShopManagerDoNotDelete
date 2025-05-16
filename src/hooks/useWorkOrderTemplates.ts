import { useState, useEffect } from 'react';
import { WorkOrderTemplate } from '@/types/workOrder';
import { v4 as uuidv4 } from 'uuid';
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
      // Fetch templates from the database
      const { data, error: fetchError } = await supabase
        .from('work_order_templates')
        .select(`
          *,
          inventory_items:work_order_template_items(*)
        `);
      
      if (fetchError) throw fetchError;
      
      if (data && data.length > 0) {
        const formattedTemplates = data.map(template => {
          return {
            id: template.id,
            name: template.name,
            description: template.description,
            createdAt: template.created_at,
            lastUsed: template.last_used || null,
            usageCount: template.usage_count || 0,
            status: template.status,
            priority: template.priority,
            technician: template.technician,
            notes: template.notes,
            location: template.location,
            inventoryItems: Array.isArray(template.inventory_items) 
              ? template.inventory_items.map(item => ({
                  id: item.id,
                  name: item.name,
                  sku: item.sku,
                  category: item.category,
                  quantity: item.quantity,
                  unitPrice: item.unit_price
                }))
              : []
          };
        });
        
        setTemplates(formattedTemplates);
      } else {
        // If no templates in database, set empty array
        setTemplates([]);
      }
    } catch (err) {
      console.error('Error fetching work order templates:', err);
      setError('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTemplateUsage = async (templateId: string) => {
    try {
      // Update the last_used timestamp and increment the usage count in database
      const { error: updateError } = await supabase
        .from('work_order_templates')
        .update({ 
          last_used: new Date().toISOString(),
          usage_count: supabase.rpc('increment_usage_count', { template_id: templateId })
        })
        .eq('id', templateId);

      if (updateError) throw updateError;
      
      // Update local state as well
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
      const newTemplateId = uuidv4();
      
      // Insert the new template into the database
      const { error: templateError } = await supabase
        .from('work_order_templates')
        .insert({
          id: newTemplateId,
          name: template.name,
          description: template.description,
          status: template.status,
          priority: template.priority,
          technician: template.technician,
          notes: template.notes,
          location: template.location,
          created_at: new Date().toISOString(),
          usage_count: 0
        });
      
      if (templateError) throw templateError;
      
      // Insert inventory items for this template if they exist
      if (template.inventoryItems && template.inventoryItems.length > 0) {
        const inventoryItems = template.inventoryItems.map(item => ({
          template_id: newTemplateId,
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
      
      // Create a new template object for state
      const newTemplate: WorkOrderTemplate = {
        ...template,
        id: newTemplateId,
        createdAt: new Date().toISOString(),
        usageCount: 0,
      };
      
      // Add to local state
      setTemplates(prev => [...prev, newTemplate]);
      
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
