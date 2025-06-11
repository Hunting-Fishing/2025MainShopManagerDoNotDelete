
import { supabase } from '@/integrations/supabase/client';
import { 
  DiscountType, 
  JobLineDiscount, 
  PartDiscount, 
  WorkOrderDiscount, 
  DiscountCalculationResult,
  ApplyDiscountRequest 
} from '@/types/discount';

// Type assertion helpers
const assertDiscountType = (type: string): 'percentage' | 'fixed_amount' => {
  if (type === 'percentage' || type === 'fixed_amount') {
    return type;
  }
  throw new Error(`Invalid discount type: ${type}`);
};

const assertAppliesTo = (appliesTo: string): 'labor' | 'parts' | 'work_order' | 'any' => {
  if (appliesTo === 'labor' || appliesTo === 'parts' || appliesTo === 'work_order' || appliesTo === 'any') {
    return appliesTo;
  }
  throw new Error(`Invalid applies_to value: ${appliesTo}`);
};

const assertWorkOrderDiscountAppliesTo = (appliesTo: string): 'labor' | 'parts' | 'total' => {
  if (appliesTo === 'labor' || appliesTo === 'parts' || appliesTo === 'total') {
    return appliesTo;
  }
  throw new Error(`Invalid work order discount applies_to value: ${appliesTo}`);
};

export const discountService = {
  // Get all active discount types
  async getDiscountTypes(): Promise<DiscountType[]> {
    const { data, error } = await supabase
      .from('discount_types')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return data.map(item => ({
      ...item,
      discount_type: assertDiscountType(item.discount_type),
      applies_to: assertAppliesTo(item.applies_to)
    }));
  },

  // Get discount types that apply to a specific context
  async getDiscountTypesForContext(context: 'labor' | 'parts' | 'work_order'): Promise<DiscountType[]> {
    const { data, error } = await supabase
      .from('discount_types')
      .select('*')
      .eq('is_active', true)
      .in('applies_to', [context, 'any'])
      .order('name');

    if (error) throw error;

    return data.map(item => ({
      ...item,
      discount_type: assertDiscountType(item.discount_type),
      applies_to: assertAppliesTo(item.applies_to)
    }));
  },

  // Get job line discounts with related discount type info
  async getJobLineDiscounts(jobLineId: string): Promise<JobLineDiscount[]> {
    const { data, error } = await supabase
      .from('job_line_discounts')
      .select(`
        *,
        discountTypeInfo:discount_types(*)
      `)
      .eq('job_line_id', jobLineId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      ...item,
      discount_type: assertDiscountType(item.discount_type),
      discountTypeInfo: item.discountTypeInfo ? {
        ...item.discountTypeInfo,
        discount_type: assertDiscountType(item.discountTypeInfo.discount_type),
        applies_to: assertAppliesTo(item.discountTypeInfo.applies_to)
      } : undefined
    }));
  },

  // Apply discount to job line
  async applyJobLineDiscount(
    jobLineId: string, 
    request: ApplyDiscountRequest
  ): Promise<JobLineDiscount> {
    const { data, error } = await supabase
      .from('job_line_discounts')
      .insert({
        job_line_id: jobLineId,
        discount_type_id: request.discount_type_id,
        discount_name: request.discount_name,
        discount_type: request.discount_type,
        discount_value: request.discount_value,
        discount_amount: 0, // Will be calculated by trigger or application logic
        reason: request.reason,
        created_by: request.created_by
      })
      .select('*')
      .single();

    if (error) throw error;

    return {
      ...data,
      discount_type: assertDiscountType(data.discount_type)
    };
  },

  // Remove job line discount
  async removeJobLineDiscount(discountId: string): Promise<void> {
    const { error } = await supabase
      .from('job_line_discounts')
      .delete()
      .eq('id', discountId);

    if (error) throw error;
  },

  // Get part discounts with related discount type info
  async getPartDiscounts(partId: string): Promise<PartDiscount[]> {
    const { data, error } = await supabase
      .from('part_discounts')
      .select(`
        *,
        discountTypeInfo:discount_types(*)
      `)
      .eq('part_id', partId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      ...item,
      discount_type: assertDiscountType(item.discount_type),
      discountTypeInfo: item.discountTypeInfo ? {
        ...item.discountTypeInfo,
        discount_type: assertDiscountType(item.discountTypeInfo.discount_type),
        applies_to: assertAppliesTo(item.discountTypeInfo.applies_to)
      } : undefined
    }));
  },

  // Apply discount to part
  async applyPartDiscount(
    partId: string, 
    request: ApplyDiscountRequest
  ): Promise<PartDiscount> {
    const { data, error } = await supabase
      .from('part_discounts')
      .insert({
        part_id: partId,
        discount_type_id: request.discount_type_id,
        discount_name: request.discount_name,
        discount_type: request.discount_type,
        discount_value: request.discount_value,
        discount_amount: 0, // Will be calculated by trigger or application logic
        reason: request.reason,
        created_by: request.created_by
      })
      .select('*')
      .single();

    if (error) throw error;

    return {
      ...data,
      discount_type: assertDiscountType(data.discount_type)
    };
  },

  // Remove part discount
  async removePartDiscount(discountId: string): Promise<void> {
    const { error } = await supabase
      .from('part_discounts')
      .delete()
      .eq('id', discountId);

    if (error) throw error;
  },

  // Get work order discounts with related discount type info
  async getWorkOrderDiscounts(workOrderId: string): Promise<WorkOrderDiscount[]> {
    const { data, error } = await supabase
      .from('work_order_discounts')
      .select(`
        *,
        discountTypeInfo:discount_types(*)
      `)
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      ...item,
      discount_type: assertDiscountType(item.discount_type),
      applies_to: assertWorkOrderDiscountAppliesTo(item.applies_to),
      discountTypeInfo: item.discountTypeInfo ? {
        ...item.discountTypeInfo,
        discount_type: assertDiscountType(item.discountTypeInfo.discount_type),
        applies_to: assertAppliesTo(item.discountTypeInfo.applies_to)
      } : undefined
    }));
  },

  // Apply discount to work order
  async applyWorkOrderDiscount(
    workOrderId: string, 
    request: ApplyDiscountRequest & { applies_to: 'labor' | 'parts' | 'total' }
  ): Promise<WorkOrderDiscount> {
    const { data, error } = await supabase
      .from('work_order_discounts')
      .insert({
        work_order_id: workOrderId,
        discount_type_id: request.discount_type_id,
        discount_name: request.discount_name,
        discount_type: request.discount_type,
        discount_value: request.discount_value,
        discount_amount: 0, // Will be calculated by trigger or application logic
        applies_to: request.applies_to,
        reason: request.reason,
        created_by: request.created_by
      })
      .select('*')
      .single();

    if (error) throw error;

    return {
      ...data,
      discount_type: assertDiscountType(data.discount_type),
      applies_to: assertWorkOrderDiscountAppliesTo(data.applies_to)
    };
  },

  // Remove work order discount
  async removeWorkOrderDiscount(discountId: string): Promise<void> {
    const { error } = await supabase
      .from('work_order_discounts')
      .delete()
      .eq('id', discountId);

    if (error) throw error;
  },

  // Calculate job line totals with discounts
  async calculateJobLineTotals(jobLineId: string): Promise<DiscountCalculationResult> {
    const { data, error } = await supabase
      .rpc('calculate_job_line_total_with_discounts', {
        job_line_id_param: jobLineId
      });

    if (error) throw error;

    // Parse the JSON response from the function
    const result = typeof data === 'string' ? JSON.parse(data) : data;
    return result as DiscountCalculationResult;
  },

  // Calculate work order totals with all discounts
  async calculateWorkOrderTotals(workOrderId: string): Promise<DiscountCalculationResult> {
    const { data, error } = await supabase
      .rpc('calculate_work_order_totals_with_discounts', {
        work_order_id_param: workOrderId
      });

    if (error) throw error;

    // Parse the JSON response from the function
    const result = typeof data === 'string' ? JSON.parse(data) : data;
    return result as DiscountCalculationResult;
  }
};
