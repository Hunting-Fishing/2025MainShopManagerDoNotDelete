
import { supabase } from '@/integrations/supabase/client';
import { 
  DiscountType, 
  JobLineDiscount, 
  PartDiscount, 
  WorkOrderDiscount,
  DiscountCalculationResult,
  ApplyDiscountRequest 
} from '@/types/discount';

// Discount Types Service
export const getDiscountTypes = async (): Promise<DiscountType[]> => {
  const { data, error } = await supabase
    .from('discount_types')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
};

export const getDiscountTypesByCategory = async (applies_to: string): Promise<DiscountType[]> => {
  const { data, error } = await supabase
    .from('discount_types')
    .select('*')
    .eq('is_active', true)
    .or(`applies_to.eq.${applies_to},applies_to.eq.any`)
    .order('name');

  if (error) throw error;
  return data || [];
};

// Job Line Discounts Service
export const getJobLineDiscounts = async (jobLineId: string): Promise<JobLineDiscount[]> => {
  const { data, error } = await supabase
    .from('job_line_discounts')
    .select(`
      *,
      discountTypeInfo:discount_types(*)
    `)
    .eq('job_line_id', jobLineId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const applyJobLineDiscount = async (
  jobLineId: string,
  discountRequest: ApplyDiscountRequest
): Promise<JobLineDiscount> => {
  // Calculate discount amount
  const { data: jobLine } = await supabase
    .from('work_order_job_lines')
    .select('total_amount')
    .eq('id', jobLineId)
    .single();

  if (!jobLine) throw new Error('Job line not found');

  const laborAmount = jobLine.total_amount || 0;
  let discountAmount = 0;

  if (discountRequest.discount_type === 'percentage') {
    discountAmount = (laborAmount * discountRequest.discount_value) / 100;
  } else {
    discountAmount = discountRequest.discount_value;
  }

  const { data, error } = await supabase
    .from('job_line_discounts')
    .insert({
      job_line_id: jobLineId,
      discount_type_id: discountRequest.discount_type_id,
      discount_name: discountRequest.discount_name,
      discount_type: discountRequest.discount_type,
      discount_value: discountRequest.discount_value,
      discount_amount: discountAmount,
      reason: discountRequest.reason,
      created_by: discountRequest.created_by
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeJobLineDiscount = async (discountId: string): Promise<void> => {
  const { error } = await supabase
    .from('job_line_discounts')
    .delete()
    .eq('id', discountId);

  if (error) throw error;
};

// Part Discounts Service
export const getPartDiscounts = async (partId: string): Promise<PartDiscount[]> => {
  const { data, error } = await supabase
    .from('part_discounts')
    .select(`
      *,
      discountTypeInfo:discount_types(*)
    `)
    .eq('part_id', partId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const applyPartDiscount = async (
  partId: string,
  discountRequest: ApplyDiscountRequest
): Promise<PartDiscount> => {
  // Calculate discount amount
  const { data: part } = await supabase
    .from('work_order_parts')
    .select('customer_price, quantity')
    .eq('id', partId)
    .single();

  if (!part) throw new Error('Part not found');

  const partTotal = (part.customer_price || 0) * (part.quantity || 0);
  let discountAmount = 0;

  if (discountRequest.discount_type === 'percentage') {
    discountAmount = (partTotal * discountRequest.discount_value) / 100;
  } else {
    discountAmount = discountRequest.discount_value;
  }

  const { data, error } = await supabase
    .from('part_discounts')
    .insert({
      part_id: partId,
      discount_type_id: discountRequest.discount_type_id,
      discount_name: discountRequest.discount_name,
      discount_type: discountRequest.discount_type,
      discount_value: discountRequest.discount_value,
      discount_amount: discountAmount,
      reason: discountRequest.reason,
      created_by: discountRequest.created_by
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removePartDiscount = async (discountId: string): Promise<void> => {
  const { error } = await supabase
    .from('part_discounts')
    .delete()
    .eq('id', discountId);

  if (error) throw error;
};

// Work Order Discounts Service
export const getWorkOrderDiscounts = async (workOrderId: string): Promise<WorkOrderDiscount[]> => {
  const { data, error } = await supabase
    .from('work_order_discounts')
    .select(`
      *,
      discountTypeInfo:discount_types(*)
    `)
    .eq('work_order_id', workOrderId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const applyWorkOrderDiscount = async (
  workOrderId: string,
  discountRequest: ApplyDiscountRequest & { applies_to: 'labor' | 'parts' | 'total' }
): Promise<WorkOrderDiscount> => {
  // Calculate discount amount based on applies_to
  const totals = await calculateWorkOrderTotalsWithDiscounts(workOrderId);
  let baseAmount = 0;

  switch (discountRequest.applies_to) {
    case 'labor':
      baseAmount = totals.labor_subtotal;
      break;
    case 'parts':
      baseAmount = totals.parts_subtotal;
      break;
    case 'total':
      baseAmount = totals.subtotal_before_wo_discounts || 0;
      break;
  }

  let discountAmount = 0;
  if (discountRequest.discount_type === 'percentage') {
    discountAmount = (baseAmount * discountRequest.discount_value) / 100;
  } else {
    discountAmount = discountRequest.discount_value;
  }

  const { data, error } = await supabase
    .from('work_order_discounts')
    .insert({
      work_order_id: workOrderId,
      discount_type_id: discountRequest.discount_type_id,
      discount_name: discountRequest.discount_name,
      discount_type: discountRequest.discount_type,
      discount_value: discountRequest.discount_value,
      discount_amount: discountAmount,
      applies_to: discountRequest.applies_to,
      reason: discountRequest.reason,
      created_by: discountRequest.created_by
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeWorkOrderDiscount = async (discountId: string): Promise<void> => {
  const { error } = await supabase
    .from('work_order_discounts')
    .delete()
    .eq('id', discountId);

  if (error) throw error;
};

// Calculation Functions
export const calculateJobLineTotalWithDiscounts = async (
  jobLineId: string
): Promise<DiscountCalculationResult> => {
  const { data, error } = await supabase.rpc('calculate_job_line_total_with_discounts', {
    job_line_id_param: jobLineId
  });

  if (error) throw error;
  return data;
};

export const calculateWorkOrderTotalsWithDiscounts = async (
  workOrderId: string
): Promise<DiscountCalculationResult> => {
  const { data, error } = await supabase.rpc('calculate_work_order_totals_with_discounts', {
    work_order_id_param: workOrderId
  });

  if (error) throw error;
  return data;
};
