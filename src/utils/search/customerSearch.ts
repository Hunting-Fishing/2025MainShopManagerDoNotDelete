
import { Customer } from "@/types/customer";
import { CustomerFilters } from "@/components/customers/filters/CustomerFilterControls";

export const filterCustomers = (
  customers: Customer[],
  filters: CustomerFilters
): Customer[] => {
  if (!filters || !customers || !customers.length) {
    return customers || [];
  }

  return customers.filter((customer) => {
    // Search query filter
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase();
      const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
      const email = customer.email?.toLowerCase() || '';
      const phone = customer.phone?.toLowerCase() || '';
      const company = customer.company?.toLowerCase() || '';
      
      if (
        !fullName.includes(query) &&
        !email.includes(query) &&
        !phone.includes(query) &&
        !company.includes(query)
      ) {
        return false;
      }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const customerTags = customer.tags || [];
      if (!customerTags.some(tag => filters.tags!.includes(tag))) {
        return false;
      }
    }

    // Vehicle type filter
    if (filters.vehicleType && customer.vehicles && customer.vehicles.length > 0) {
      const hasVehicleType = customer.vehicles.some(
        v => v.body_style === filters.vehicleType
      );
      if (!hasVehicleType) {
        return false;
      }
    }

    // Has vehicles filter
    if (filters.hasVehicles) {
      if (filters.hasVehicles === 'yes' && 
          (!customer.vehicles || customer.vehicles.length === 0)) {
        return false;
      }
      if (filters.hasVehicles === 'no' && 
          customer.vehicles && customer.vehicles.length > 0) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
      const customerDateAdded = customer.created_at
        ? new Date(customer.created_at)
        : null;
      
      if (customerDateAdded) {
        if (filters.dateRange.from && customerDateAdded < filters.dateRange.from) {
          return false;
        }
        if (filters.dateRange.to) {
          // Add a day to include the end date fully
          const endDate = new Date(filters.dateRange.to);
          endDate.setDate(endDate.getDate() + 1);
          if (customerDateAdded > endDate) {
            return false;
          }
        }
      }
    }

    return true;
  });
};
