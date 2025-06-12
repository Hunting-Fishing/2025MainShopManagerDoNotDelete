
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/customer';

export async function getAllCustomers(): Promise<Customer[]> {
  console.log('🔄 getAllCustomers: Starting fetch from database...');
  
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ getAllCustomers error:', error);
      throw error;
    }

    console.log('✅ getAllCustomers: Fetched', data?.length || 0, 'customers from database');
    console.log('📊 getAllCustomers: Sample data:', data?.slice(0, 2));
    
    return data || [];
  } catch (error) {
    console.error('❌ getAllCustomers: Exception caught:', error);
    throw error;
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  console.log('🔍 getCustomerById: Fetching customer with id:', id);
  
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('❌ getCustomerById error:', error);
      throw error;
    }

    console.log('✅ getCustomerById: Found customer:', data ? 'Yes' : 'No');
    return data;
  } catch (error) {
    console.error('❌ getCustomerById: Exception caught:', error);
    throw error;
  }
}
