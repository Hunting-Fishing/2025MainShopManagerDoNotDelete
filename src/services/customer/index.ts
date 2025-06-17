
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/customer';

export async function getCustomerById(customerId: string): Promise<Customer | null> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
}

export async function getAllCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching customers:', error);
    throw error;
  }
}

export async function createCustomer(customerData: Partial<Customer>): Promise<Customer> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
}

export async function checkDuplicateCustomers(email?: string, phone?: string): Promise<Customer[]> {
  try {
    let query = supabase.from('customers').select('*');
    
    if (email && phone) {
      query = query.or(`email.eq.${email},phone.eq.${phone}`);
    } else if (email) {
      query = query.eq('email', email);
    } else if (phone) {
      query = query.eq('phone', phone);
    } else {
      return [];
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error checking duplicate customers:', error);
    throw error;
  }
}

// Draft functions (simplified for now)
export async function saveDraftCustomer(draftData: Partial<Customer>): Promise<void> {
  try {
    localStorage.setItem('customer-draft', JSON.stringify(draftData));
  } catch (error) {
    console.error('Error saving draft:', error);
  }
}

export async function getDraftCustomer(): Promise<Partial<Customer> | null> {
  try {
    const draft = localStorage.getItem('customer-draft');
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.error('Error getting draft:', error);
    return null;
  }
}

export async function clearDraftCustomer(): Promise<void> {
  try {
    localStorage.removeItem('customer-draft');
  } catch (error) {
    console.error('Error clearing draft:', error);
  }
}
