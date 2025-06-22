
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/customer';

export async function getAllCustomers(): Promise<Customer[]> {
  console.log('🔄 getAllCustomers: Starting fetch from database...');
  
  try {
    // Check authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Authentication error:', authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    if (!user) {
      console.warn('⚠️ No authenticated user found');
      return [];
    }

    // Check if user is owner or admin
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        roles:role_id(name)
      `)
      .eq('user_id', user.id);

    if (roleError) {
      console.error('❌ Error checking user roles:', roleError);
      // Continue with query even if role check fails
    }

    const isOwnerOrAdmin = userRoles?.some(ur => 
      ur.roles?.name === 'owner' || ur.roles?.name === 'admin'
    ) || false;

    console.log('👑 User is owner/admin:', isOwnerOrAdmin);

    // Fetch all customers (owners/admins see all, others see filtered results)
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
