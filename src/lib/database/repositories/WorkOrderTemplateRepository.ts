
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

export interface WorkOrderTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  estimated_hours?: number;
  labor_rate?: number;
  total_amount?: number;
  status: string;
  notes?: string;
  usage_count: number;
  last_used?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  created_by_name?: string;
}

export interface CreateWorkOrderTemplateInput {
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  estimated_hours?: number;
  labor_rate?: number;
  total_amount?: number;
  status?: string;
  notes?: string;
  created_by?: string;
  created_by_name?: string;
}

export interface UpdateWorkOrderTemplateInput {
  name?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  estimated_hours?: number;
  labor_rate?: number;
  total_amount?: number;
  status?: string;
  notes?: string;
}

export class WorkOrderTemplateRepository {
  async findActive(): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .eq('is_active', true)
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
      .eq('category', categoryId)
      .eq('is_active', true)
      .order('usage_count', { ascending: false });
    
    if (error) throw this.handleError(error);
    return data || [];
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

  async create(templateData: CreateWorkOrderTemplateInput): Promise<WorkOrderTemplate> {
    const insertData = {
      name: templateData.name,
      description: templateData.description || null,
      category: templateData.category || null,
      subcategory: templateData.subcategory || null,
      estimated_hours: templateData.estimated_hours || 0,
      labor_rate: templateData.labor_rate || 0,
      total_amount: templateData.total_amount || 0,
      status: templateData.status || 'active',
      notes: templateData.notes || null,
      usage_count: 0,
      is_active: true,
      created_by: templateData.created_by || null,
      created_by_name: templateData.created_by_name || null,
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
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw this.handleError(error);
  }

  async incrementUsage(id: string): Promise<WorkOrderTemplate> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .rpc('increment_usage_count', { template_id: id })
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
