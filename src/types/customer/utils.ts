
import { Customer } from './base';

/**
 * Adapts raw customer data from the database to the expected UI format
 */
export function adaptCustomerForUI(dbCustomer: any): Customer {
  if (!dbCustomer) return {} as Customer;
  
  // Handle tags that might be stored as a string (JSON) in the database
  let tags = dbCustomer.tags || [];
  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags);
    } catch (e) {
      console.error('Error parsing customer tags:', e);
      tags = [];
    }
  }
  
  // Handle segments that might be stored as a string (JSON) in the database
  let segments = dbCustomer.segments || [];
  if (typeof segments === 'string') {
    try {
      segments = JSON.parse(segments);
    } catch (e) {
      console.error('Error parsing customer segments:', e);
      segments = [];
    }
  }
  
  // Create a customer object with standardized properties
  const customer: Customer = {
    id: dbCustomer.id,
    first_name: dbCustomer.first_name || '',
    last_name: dbCustomer.last_name || '',
    email: dbCustomer.email || '',
    phone: dbCustomer.phone || '',
    address: dbCustomer.address || '',
    city: dbCustomer.city || '',
    state: dbCustomer.state || '',
    postal_code: dbCustomer.postal_code || '',
    country: dbCustomer.country || '',
    shop_id: dbCustomer.shop_id || '',
    created_at: dbCustomer.created_at || new Date().toISOString(),
    updated_at: dbCustomer.updated_at || new Date().toISOString(),
    
    tags: tags,
    segments: segments,
    
    // Optional fields
    company: dbCustomer.company || '',
    notes: dbCustomer.notes || '',
    status: dbCustomer.status || 'active',
    
    // If vehicles are already loaded, use them; otherwise, set to empty array
    vehicles: dbCustomer.vehicles || [],
    
    // All other optional properties
    household_id: dbCustomer.household_id || '',
    is_fleet: dbCustomer.is_fleet || false,
    fleet_company: dbCustomer.fleet_company || '',
    fleet_manager: dbCustomer.fleet_manager || '',
    fleet_contact: dbCustomer.fleet_contact || '',
    preferred_service_type: dbCustomer.preferred_service_type || '',
    preferred_technician_id: dbCustomer.preferred_technician_id || '',
    communication_preference: dbCustomer.communication_preference || '',
    referral_source: dbCustomer.referral_source || '',
    referral_person_id: dbCustomer.referral_person_id || '',
    other_referral_details: dbCustomer.other_referral_details || '',
    
    // Business details
    business_type: dbCustomer.business_type || '',
    business_industry: dbCustomer.business_industry || '',
    other_business_industry: dbCustomer.other_business_industry || '',
    tax_id: dbCustomer.tax_id || '',
    business_email: dbCustomer.business_email || '',
    business_phone: dbCustomer.business_phone || '',
    
    // Payment & Billing
    preferred_payment_method: dbCustomer.preferred_payment_method || '',
    auto_billing: dbCustomer.auto_billing || false,
    credit_terms: dbCustomer.credit_terms || '',
    terms_agreed: dbCustomer.terms_agreed || false,
    
    // Role
    role: dbCustomer.role || 'Customer',
  };
  
  return customer;
}

/**
 * Generates the full name of a customer
 */
export function getCustomerFullName(customer: Customer): string {
  if (!customer) return '';
  if (customer.first_name && customer.last_name) {
    return `${customer.first_name} ${customer.last_name}`;
  }
  if (customer.first_name) {
    return customer.first_name;
  }
  if (customer.last_name) {
    return customer.last_name;
  }
  if (customer.email) {
    return customer.email;
  }
  return 'Unknown Customer';
}
