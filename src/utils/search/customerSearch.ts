import { Customer } from "@/types/customer";
import { CustomerFilters } from "@/components/customers/filters/CustomerFilterControls";
import { getCustomerFullName } from "@/types/customer";

// Filter customers based on the provided filters
export const filterCustomers = (
  customers: Customer[],
  filters: CustomerFilters
): Customer[] => {
  return customers.filter(customer => {
    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const fullName = getCustomerFullName(customer).toLowerCase();
      const company = customer.company?.toLowerCase() || '';
      const email = customer.email?.toLowerCase() || '';
      const phone = customer.phone?.toLowerCase() || '';
      const address = customer.address?.toLowerCase() || '';
      
      const matchesQuery = 
        fullName.includes(query) ||
        company.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        address.includes(query);
      
      if (!matchesQuery) return false;
    }
    
    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      if (!customer.tags) return false;
      
      const hasAllTags = filters.tags.every(tag => 
        customer.tags?.includes(tag)
      );
      
      if (!hasAllTags) return false;
    }
    
    // Filter by vehicle type
    if (filters.vehicleType) {
      // This would require joining with vehicles table
      // For now, we'll assume all customers match
    }
    
    // Filter by date added
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
      const customerDate = new Date(customer.created_at);
      
      if (filters.dateRange.from && customerDate < filters.dateRange.from) {
        return false;
      }
      
      if (filters.dateRange.to) {
        const endDate = new Date(filters.dateRange.to);
        endDate.setHours(23, 59, 59, 999); // End of day
        
        if (customerDate > endDate) {
          return false;
        }
      }
    }
    
    // Filter by hasVehicles
    if (filters.hasVehicles) {
      // This would require checking if the customer has vehicles
      // For now, we'll assume all customers match
    }
    
    return true;
  });
};
