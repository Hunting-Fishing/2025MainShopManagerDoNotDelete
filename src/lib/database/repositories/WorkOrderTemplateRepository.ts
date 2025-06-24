
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

export interface WorkOrderTemplate {
  id: string;
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  technician?: string;
  notes?: string;
  parts_list: any[];
  is_active: boolean;
  usage_count: number;
  last_used?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkOrderTemplateInput {
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  technician?: string;
  notes?: string;
}

export interface UpdateWorkOrderTemplateInput {
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  technician?: string;
  notes?: string;
}

// Database row type (what actually comes from Supabase)
interface WorkOrderTemplateRow {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  technician: string | null;
  notes: string | null;
  usage_count: number;
  last_used: string | null;
  created_at: string;
}

export class WorkOrderTemplateRepository {
  private transformRow(row: WorkOrderTemplateRow): WorkOrderTemplate {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      status: row.status || undefined,
      priority: row.priority || undefined,
      technician: row.technician || undefined,
      notes: row.notes || undefined,
      parts_list: [],
      is_active: true,
      usage_count: row.usage_count,
      last_used: row.last_used || undefined,
      created_at: row.created_at,
      updated_at: row.created_at, // Use created_at as fallback for updated_at
    };
  }

  async findActive(): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw this.handleError(error);
    return (data || []).map(row => this.transformRow(row));
  }

  async findById(id: string): Promise<WorkOrderTemplate | null> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw this.handleError(error);
    return data ? this.transformRow(data) : null;
  }

  async getMostUsed(limit: number): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit);
    
    if (error) throw this.handleError(error);
    return (data || []).map(row => this.transformRow(row));
  }

  async findByCategory(categoryId: string): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });
    
    if (error) throw this.handleError(error);
    return (data || []).map(row => this.transformRow(row));
  }

  async create(entity: CreateWorkOrderTemplateInput): Promise<WorkOrderTemplate> {
    const insertData = {
      name: entity.name,
      description: entity.description || null,
      status: entity.status || null,
      priority: entity.priority || null,
      technician: entity.technician || null,
      notes: entity.notes || null,
      usage_count: 0,
    };

    const { data, error } = await supabase
      .from('work_order_templates')
      .insert(insertData)
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    return this.transformRow(data);
  }

  async update(id: string, updates: UpdateWorkOrderTemplateInput): Promise<WorkOrderTemplate> {
    const updateData: Record<string, any> = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.technician !== undefined) updateData.technician = updates.technician;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { data, error } = await supabase
      .from('work_order_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    return this.transformRow(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('work_order_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw this.handleError(error);
  }

  async incrementUsage(id: string): Promise<WorkOrderTemplate> {
    // First get current usage count
    const { data: currentData, error: fetchError } = await supabase
      .from('work_order_templates')
      .select('usage_count')
      .eq('id', id)
      .single();
    
    if (fetchError) throw this.handleError(fetchError);
    
    const newUsageCount = (currentData?.usage_count || 0) + 1;
    
    // Then update it
    const { data, error } = await supabase
      .from('work_order_templates')
      .update({ 
        usage_count: newUsageCount,
        last_used: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    return this.transformRow(data);
  }

  private handleError(error: PostgrestError): Error {
    console.error('Database error in work order templates:', error);
    return new Error(`Work order template operation failed: ${error.message}`);
  }
}
