
import { Customer } from "@/types/customer";
import { CustomerFilters } from "@/components/customers/filters/CustomerFilterControls";

export const filterCustomers = (
  customers: Customer[],
  filters: CustomerFilters
): Customer[] => {
  let result = [...customers];
  
  // Apply search query filter
  if (filters.searchQuery && filters.searchQuery.trim() !== '') {
    const query = filters.searchQuery.toLowerCase().trim();
    result = result.filter(customer => {
      return (
        (customer.first_name && customer.first_name.toLowerCase().includes(query)) ||
        (customer.last_name && customer.last_name.toLowerCase().includes(query)) ||
        (customer.email && customer.email.toLowerCase().includes(query)) ||
        (customer.phone && customer.phone.includes(query)) ||
        (customer.company && customer.company.toLowerCase().includes(query))
      );
    });
  }
  
  // Apply tags filter
  if (filters.tags && filters.tags.length > 0) {
    result = result.filter(customer => {
      // Skip customers without tags
      if (!customer.tags || !Array.isArray(customer.tags) || customer.tags.length === 0) {
        return false;
      }
      
      // Check if customer has any of the selected tags
      return filters.tags.some(tag => 
        customer.tags.includes(tag)
      );
    });
  }
  
  return result;
};
