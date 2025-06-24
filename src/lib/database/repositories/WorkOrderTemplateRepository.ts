
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

// Updated interface to match actual database schema
export interface WorkOrderTemplate {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority?: string;
  technician?: string;
  notes?: string;
  usage_count: number;
  last_used?: string;
  created_at: string;
  inventory_items?: WorkOrderInventoryItem[];
  location?: string;
}

export interface WorkOrderInventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit_price?: number;
}

export interface CreateWorkOrderTemplateInput {
  name: string;
  description?: string;
  status: string;
  priority?: string;
  technician?: string;
  notes?: string;
  location?: string;
  inventory_items?: WorkOrderInventoryItem[];
}

export interface UpdateWorkOrderTemplateInput {
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  technician?: string;
  notes?: string;
  location?: string;
  inventory_items?: WorkOrderInventoryItem[];
}

export class WorkOrderTemplateRepository {
  async findActive(): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw this.handleError(error);
    return data || [];
  }

  async findById(id: string): Promise<WorkOrderTemplate | null> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw this.handleError(error);
    return data || null;
  }

  async findByCategory(categoryId: string): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .eq('category_id', categoryId)
      .order('usage_count', { ascending: false });
    
    if (error) throw this.handleError(error);
    return data || [];
  }

  async getMostUsed(limit: number = 10): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit);
    
    if (error) throw this.handleError(error);
    return data || [];
  }

  async create(templateData: CreateWorkOrderTemplateInput): Promise<WorkOrderTemplate> {
    // Prepare data for database insertion
    const insertData = {
      name: templateData.name,
      description: templateData.description || null,
      status: templateData.status,
      priority: templateData.priority || null,
      technician: templateData.technician || null,
      notes: templateData.notes || null,
      usage_count: 0
    };

    const { data, error } = await supabase
      .from('work_order_templates')
      .insert(insertData)
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    return data;
  }

  async update(id: string, updates: UpdateWorkOrderTemplateInput): Promise<WorkOrderTemplate> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('work_order_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw this.handleError(error);
  }

  async incrementUsage(id: string): Promise<WorkOrderTemplate> {
    // First get the current template
    const { data: currentTemplate, error: fetchError } = await supabase
      .from('work_order_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw this.handleError(fetchError);

    // Update the usage count and last_used timestamp
    const { data, error } = await supabase
      .from('work_order_templates')
      .update({ 
        usage_count: (currentTemplate.usage_count || 0) + 1,
        last_used: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    return data;
  }

  private handleError(error: PostgrestError): Error {
    console.error('Database error in work order templates:', error);
    return new Error(`Work order template operation failed: ${error.message}`);
  }
}
