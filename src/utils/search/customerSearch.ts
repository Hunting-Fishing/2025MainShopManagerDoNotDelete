
import { Customer } from "@/types/customer";
import { CustomerFilters } from "@/components/customers/filters/CustomerFilterControls";

export const filterCustomers = (customers: Customer[], filters: CustomerFilters) => {
  return customers.filter(customer => {
    // Filter by search query
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase();
      const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
      
      // Check if any customer field contains the search query
      const matchesQuery = 
        fullName.includes(query) ||
        (customer.email && customer.email.toLowerCase().includes(query)) ||
        (customer.phone && customer.phone.toLowerCase().includes(query)) ||
        (customer.company && customer.company.toLowerCase().includes(query));
        
      if (!matchesQuery) return false;
    }
    
    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      // Make sure customer has tags property and it's an array
      const customerTags = Array.isArray(customer.tags) ? customer.tags : [];
      
      // Check if customer has any of the selected tags
      const hasMatchingTag = filters.tags.some(tag => 
        customerTags.includes(tag)
      );
      
      if (!hasMatchingTag) return false;
    }
    
    // Filter by vehicle type
    if (filters.vehicleType && filters.vehicleType !== 'all') {
      // Skip if customer has no vehicles
      if (!customer.vehicles || !Array.isArray(customer.vehicles) || customer.vehicles.length === 0) {
        return false;
      }
      
      // Check if customer has any vehicle of the selected type
      const hasVehicleType = customer.vehicles.some(vehicle => 
        vehicle.type === filters.vehicleType || 
        vehicle.make === filters.vehicleType
      );
      
      if (!hasVehicleType) return false;
    }
    
    // Filter by has vehicles
    if (filters.hasVehicles) {
      const hasVehicles = customer.vehicles && Array.isArray(customer.vehicles) && customer.vehicles.length > 0;
      
      if (filters.hasVehicles === 'yes' && !hasVehicles) return false;
      if (filters.hasVehicles === 'no' && hasVehicles) return false;
    }
    
    // If we get here, the customer passed all filters
    return true;
  });
};
