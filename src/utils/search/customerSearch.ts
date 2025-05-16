
import { Customer } from "@/types/customer";

interface FilterOptions {
  status?: string;
  hasVehicles?: string;
  tags?: string[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  searchTerm?: string;
  vehicleType?: string;
}

export const filterCustomers = (
  customers: Customer[],
  options: FilterOptions
): Customer[] => {
  return customers.filter(customer => {
    // Filter by status
    if (options.status && options.status !== "_any") {
      if (options.status === "active" && customer.status !== "active") {
        return false;
      }
      if (options.status === "inactive" && customer.status !== "inactive") {
        return false;
      }
    }

    // Filter by has vehicles (this is just a placeholder, implement according to your data structure)
    if (options.hasVehicles && options.hasVehicles !== "_any") {
      const hasVehicles = (customer.vehicles?.length || 0) > 0;
      if (options.hasVehicles === "yes" && !hasVehicles) {
        return false;
      }
      if (options.hasVehicles === "no" && hasVehicles) {
        return false;
      }
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      const customerTags = Array.isArray(customer.tags) 
        ? customer.tags 
        : typeof customer.tags === 'object' && customer.tags !== null 
          ? Object.keys(customer.tags)
          : [];
          
      const hasMatchingTag = options.tags.some(tag => customerTags.includes(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }

    // Filter by search term
    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      const searchableFields = [
        customer.first_name,
        customer.last_name,
        customer.email,
        customer.phone,
        customer.company,
      ];

      const matchesSearch = searchableFields.some(
        field => field && field.toLowerCase().includes(searchLower)
      );

      if (!matchesSearch) {
        return false;
      }
    }

    // Filter by vehicle type (this is a placeholder, implement according to your data structure)
    if (options.vehicleType && options.vehicleType !== "_any") {
      const hasMatchingVehicleType = customer.vehicles?.some(
        vehicle => vehicle.type === options.vehicleType
      );
      if (!hasMatchingVehicleType) {
        return false;
      }
    }

    return true;
  });
};
