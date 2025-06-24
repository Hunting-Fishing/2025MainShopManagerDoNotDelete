
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
    
    // Transform data to ensure all required fields are present
    return (data || []).map(item => ({
      ...item,
      parts_list: item.parts_list || [],
      is_active: item.is_active ?? true,
      usage_count: item.usage_count || 0
    }));
  }

  async findById(id: string): Promise<WorkOrderTemplate | null> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw this.handleError(error);
    
    if (!data) return null;
    
    // Transform data to ensure all required fields are present
    return {
      ...data,
      parts_list: data.parts_list || [],
      is_active: data.is_active ?? true,
      usage_count: data.usage_count || 0
    };
  }

  async findActive(): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false });
    
    if (error) throw this.handleError(error);
    
    // Transform data to ensure all required fields are present
    return (data || []).map(item => ({
      ...item,
      parts_list: item.parts_list || [],
      is_active: item.is_active ?? true,
      usage_count: item.usage_count || 0
    }));
  }

  async findByCategory(categoryId: string): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw this.handleError(error);
    
    // Transform data to ensure all required fields are present
    return (data || []).map(item => ({
      ...item,
      parts_list: item.parts_list || [],
      is_active: item.is_active ?? true,
      usage_count: item.usage_count || 0
    }));
  }

  async create(entity: CreateWorkOrderTemplateInput): Promise<WorkOrderTemplate> {
    const createData = {
      name: entity.name,
      description: entity.description || null,
      category_id: entity.category_id || null,
      estimated_hours: entity.estimated_hours || null,
      labor_rate: entity.labor_rate || null,
      parts_list: entity.parts_list || [],
      instructions: entity.instructions || null,
      is_active: entity.is_active ?? true,
      usage_count: 0,
      created_by: entity.created_by || null
    };

    const { data, error } = await supabase
      .from('work_order_templates')
      .insert(createData)
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    
    // Transform data to ensure all required fields are present
    return {
      ...data,
      parts_list: data.parts_list || [],
      is_active: data.is_active ?? true,
      usage_count: data.usage_count || 0
    };
  }

  async update(id: string, updates: UpdateWorkOrderTemplateInput): Promise<WorkOrderTemplate> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    
    // Transform data to ensure all required fields are present
    return {
      ...data,
      parts_list: data.parts_list || [],
      is_active: data.is_active ?? true,
      usage_count: data.usage_count || 0
    };
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
    
    // Transform data to ensure all required fields are present
    return (data || []).map(item => ({
      ...item,
      parts_list: item.parts_list || [],
      is_active: item.is_active ?? true,
      usage_count: item.usage_count || 0
    }));
  }

  private handleError(error: PostgrestError): Error {
    console.error('Database error in work_order_templates:', error);
    return new Error(`Work order template operation failed: ${error.message}`);
  }
}
