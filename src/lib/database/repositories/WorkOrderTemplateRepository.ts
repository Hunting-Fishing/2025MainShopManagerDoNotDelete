
import { BaseRepository } from './BaseRepository';
import { supabase } from '@/integrations/supabase/client';

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

export class WorkOrderTemplateRepository extends BaseRepository<WorkOrderTemplate> {
  constructor() {
    super('work_order_templates');
  }

  async findActive(): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false });
    
    if (error) throw this.handleError(error);
    return data || [];
  }

  async findByCategory(categoryId: string): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw this.handleError(error);
    return data || [];
  }

  async incrementUsage(id: string): Promise<WorkOrderTemplate> {
    const { data, error } = await supabase
      .rpc('increment_template_usage', { template_id: id });
    
    if (error) throw this.handleError(error);
    
    // Return updated template
    return this.findById(id) as Promise<WorkOrderTemplate>;
  }

  async getMostUsed(limit: number = 10): Promise<WorkOrderTemplate[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false })
      .limit(limit);
    
    if (error) throw this.handleError(error);
    return data || [];
  }
}
