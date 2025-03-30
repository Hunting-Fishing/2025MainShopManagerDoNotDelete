
import { supabase } from "@/integrations/supabase/client";
import { Customer, CustomerCreate, adaptCustomerForUI, createCustomerForUI } from "@/types/customer";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";

// Export CustomerCreate type
export type { CustomerCreate };

// Local storage key for draft customer
const DRAFT_CUSTOMER_KEY = 'draft_customer';

// Fetch all customers
export const getAllCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("last_name", { ascending: true });

  if (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }

  // Adapt each customer for UI components
  return (data || []).map(customer => adaptCustomerForUI(customer));
};

// Fetch a customer by ID
export const getCustomerById = async (id: string): Promise<Customer | null> => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching customer:", error);
    throw error;
  }

  return data ? adaptCustomerForUI(data) : null;
};

// Create a new customer
export const createCustomer = async (customer: CustomerCreate): Promise<Customer> => {
  const { data, error } = await supabase
    .from("customers")
    .insert(customer)
    .select()
    .single();

  if (error) {
    console.error("Error creating customer:", error);
    throw error;
  }

  // Clear any draft after successful creation
  localStorage.removeItem(DRAFT_CUSTOMER_KEY);

  return adaptCustomerForUI(data);
};

// Update a customer
export const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<Customer> => {
  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating customer:", error);
    throw error;
  }

  return adaptCustomerForUI(data);
};

// Delete a customer
export const deleteCustomer = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};

// Search customers
export const searchCustomers = async (query: string): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    .order("last_name", { ascending: true });

  if (error) {
    console.error("Error searching customers:", error);
    throw error;
  }

  return (data || []).map(customer => adaptCustomerForUI(customer));
};

// Check for potential duplicate customers
export const checkDuplicateCustomers = async (
  firstName: string, 
  lastName: string, 
  email?: string, 
  phone?: string
): Promise<Customer[]> => {
  // First check by name (more liberal search)
  let query = supabase
    .from("customers")
    .select("*")
    .or(`first_name.ilike.${firstName},last_name.ilike.${lastName}`);

  // If we have email or phone, make the search more specific
  if (email && email.length > 0) {
    query = query.or(`email.eq.${email}`);
  }
  
  if (phone && phone.length > 0) {
    const formattedPhone = phone.replace(/\D/g, ''); // Strip non-digits
    if (formattedPhone.length >= 10) {
      query = query.or(`phone.like.%${formattedPhone.slice(-10)}%`); // Match last 10 digits
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error checking for duplicate customers:", error);
    throw error;
  }

  return (data || []).map(customer => adaptCustomerForUI(customer));
};

// Save customer form data as a draft
export const saveDraftCustomer = async (formData: CustomerFormValues): Promise<void> => {
  try {
    localStorage.setItem(DRAFT_CUSTOMER_KEY, JSON.stringify(formData));
  } catch (error) {
    console.error("Error saving draft customer:", error);
    throw new Error("Failed to save draft customer");
  }
};

// Get draft customer data
export const getDraftCustomer = async (): Promise<CustomerFormValues | null> => {
  try {
    const draftData = localStorage.getItem(DRAFT_CUSTOMER_KEY);
    return draftData ? JSON.parse(draftData) : null;
  } catch (error) {
    console.error("Error getting draft customer:", error);
    return null;
  }
};

// Clear draft customer data
export const clearDraftCustomer = async (): Promise<void> => {
  try {
    localStorage.removeItem(DRAFT_CUSTOMER_KEY);
  } catch (error) {
    console.error("Error clearing draft customer:", error);
  }
};

// Import customers from CSV file
export const importCustomersFromCSV = async (file: File): Promise<{ imported: number, errors: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const errors: string[] = [];
    let importCount = 0;
    
    reader.onload = async (event) => {
      try {
        const csvContent = event.target?.result as string;
        const lines = csvContent.split('\n');
        
        // Extract headers (first line)
        const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
        
        // Validate required headers
        const requiredFields = ['first_name', 'last_name'];
        for (const field of requiredFields) {
          if (!headers.includes(field)) {
            reject(new Error(`CSV is missing required field: ${field}`));
            return;
          }
        }
        
        // Process each customer row
        const customers: CustomerCreate[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue; // Skip empty lines
          
          const values = lines[i].split(',').map(value => value.trim());
          if (values.length !== headers.length) {
            errors.push(`Row ${i} has incorrect number of fields`);
            continue;
          }
          
          // Create customer object from CSV row
          const customer: Record<string, any> = {
            shop_id: "DEFAULT-SHOP-ID", // Default shop ID
          };
          
          headers.forEach((header, index) => {
            if (header && values[index]) {
              customer[header] = values[index];
            }
          });
          
          // Add to batch if required fields are present
          if (customer.first_name && customer.last_name) {
            customers.push(customer as CustomerCreate);
          } else {
            errors.push(`Row ${i} is missing required fields`);
          }
        }
        
        // Insert customers in batches
        if (customers.length > 0) {
          const { data, error } = await supabase
            .from("customers")
            .insert(customers);
            
          if (error) {
            reject(new Error(`Failed to import customers: ${error.message}`));
            return;
          }
          
          importCount = customers.length;
        }
        
        resolve({ imported: importCount, errors });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read CSV file"));
    };
    
    reader.readAsText(file);
  });
};
