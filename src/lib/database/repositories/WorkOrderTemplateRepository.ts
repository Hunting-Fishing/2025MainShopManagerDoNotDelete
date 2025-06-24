
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

export interface WorkOrderTemplate {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  estimated_hours?: number;
  labor_rate?: number;
  parts_list: any[];
  instructions?: string;
  is_active: boolean;
  usage_count: number;
  last_used?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkOrderTemplateInput {
  name: string;
  description?: string;
  category_id?: string;
  estimated_hours?: number;
  labor_rate?: number;
  parts_list?: any[];
  instructions?: string;
  is_active?: boolean;
  created_by?: string;
}

export interface UpdateWorkOrderTemplateInput {
  name?: string;
  description?: string;
  category_id?: string;
  estimated_hours?: number;
  labor_rate?: number;
  parts_list?: any[];
  instructions?: string;
  is_active?: boolean;
}

export class WorkOrderTemplateRepository {
  async findAll(): Promise<WorkOrderTemplate[]> {
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

  async findActive(): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false });
    
    if (error) throw this.handleError(error);
    return data || [];
  }

  async findByCategory(categoryId: string): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw this.handleError(error);
    return data || [];
  }

  async create(entity: CreateWorkOrderTemplateInput): Promise<WorkOrderTemplate> {
    const createData = {
      ...entity,
      parts_list: entity.parts_list || [],
      is_active: entity.is_active ?? true,
      usage_count: 0
    };

    const { data, error } = await supabase
      .from('work_order_templates')
      .insert(createData)
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
    const { data, error } = await supabase
      .rpc('increment_usage_count', { template_id: id });
    
    if (error) throw this.handleError(error);
    
    // Return updated template
    const template = await this.findById(id);
    if (!template) throw new Error('Template not found after increment');
    return template;
  }

  async getMostUsed(limit: number = 10): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false })
      .limit(limit);
    
    if (error) throw this.handleError(error);
    return data || [];
  }

  private handleError(error: PostgrestError): Error {
    console.error('Database error in work_order_templates:', error);
    return new Error(`Work order template operation failed: ${error.message}`);
  }
}
