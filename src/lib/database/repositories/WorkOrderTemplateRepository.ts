
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

// Database schema interface - matches actual table structure
interface WorkOrderTemplateDB {
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
  // Note: Based on the errors, these fields don't exist in the database
  // parts_list, is_active, updated_at are not in the actual schema
}

// Application interface - what the app expects
export interface WorkOrderTemplate {
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
  // These fields are expected by the app but don't exist in DB
  parts_list: any[];
  is_active: boolean;
  updated_at: string;
  // Additional fields that might be needed
  category_id?: string | null;
  estimated_hours?: number | null;
  labor_rate?: number | null;
  instructions?: string | null;
  created_by?: string | null;
  inventory_items?: any[];
}

export interface CreateWorkOrderTemplateInput {
  name: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  technician?: string | null;
  notes?: string | null;
  category_id?: string | null;
  estimated_hours?: number | null;
  labor_rate?: number | null;
  instructions?: string | null;
  created_by?: string | null;
  parts_list?: any[];
  is_active?: boolean;
  inventory_items?: any[];
}

export interface UpdateWorkOrderTemplateInput {
  name?: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  technician?: string | null;
  notes?: string | null;
  category_id?: string | null;
  estimated_hours?: number | null;
  labor_rate?: number | null;
  instructions?: string | null;
  parts_list?: any[];
  is_active?: boolean;
  inventory_items?: any[];
}

export class WorkOrderTemplateRepository {
  
  // Helper method to transform database data to application interface
  private transformDbToApp(dbItem: WorkOrderTemplateDB): WorkOrderTemplate {
    return {
      ...dbItem,
      parts_list: [], // Default empty array since not in DB
      is_active: true, // Default true since not in DB
      updated_at: dbItem.created_at, // Use created_at as fallback
      inventory_items: [] // Default empty array
    };
  }

  async findAll(): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw this.handleError(error);
    
    return (data || []).map(item => this.transformDbToApp(item));
  }

  async findById(id: string): Promise<WorkOrderTemplate | null> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw this.handleError(error);
    
    if (!data) return null;
    
    return this.transformDbToApp(data);
  }

  async findActive(): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .order('usage_count', { ascending: false });
    
    if (error) throw this.handleError(error);
    
    return (data || []).map(item => this.transformDbToApp(item));
  }

  async findByCategory(categoryId: string): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .eq('category_id', categoryId)
      .order('name');
    
    if (error) throw this.handleError(error);
    
    return (data || []).map(item => this.transformDbToApp(item));
  }

  async create(entity: CreateWorkOrderTemplateInput): Promise<WorkOrderTemplate> {
    // Only include fields that exist in the database
    const createData = {
      name: entity.name,
      description: entity.description || null,
      status: entity.status || null,
      priority: entity.priority || null,
      technician: entity.technician || null,
      notes: entity.notes || null,
      usage_count: 0
      // Don't include parts_list, is_active, etc. as they don't exist in DB
    };

    const { data, error } = await supabase
      .from('work_order_templates')
      .insert(createData)
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    
    return this.transformDbToApp(data);
  }

  async update(id: string, updates: UpdateWorkOrderTemplateInput): Promise<WorkOrderTemplate> {
    // Only include fields that exist in the database
    const updateData: Partial<WorkOrderTemplateDB> = {};
    
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
    
    return this.transformDbToApp(data);
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
      .from('work_order_templates')
      .update({ 
        usage_count: supabase.rpc('increment_usage_count', { template_id: id }),
        last_used: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    
    return this.transformDbToApp(data);
  }

  async getMostUsed(limit: number = 10): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from('work_order_templates')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit);
    
    if (error) throw this.handleError(error);
    
    return (data || []).map(item => this.transformDbToApp(item));
  }

  private handleError(error: PostgrestError): Error {
    console.error('Database error in work order templates:', error);
    return new Error(`Work order template operation failed: ${error.message}`);
  }
}
