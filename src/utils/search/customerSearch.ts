
import { Customer } from "@/types/customer";
import { DateRange } from "react-day-picker";
import { CustomerFilters } from "@/components/customers/filters/CustomerFilterControls";

// Filter customers based on the specified filters
export const filterCustomers = (
  customers: Customer[],
  filters: CustomerFilters
): Customer[] => {
  if (!customers || customers.length === 0) return [];

  return customers.filter(customer => {
    // Always apply the text search filter
    const searchMatches = applySearchFilter(customer, filters.searchQuery);
    if (!searchMatches) return false;

    // Apply tag filter if any tags are selected
    if (filters.tags && filters.tags.length > 0) {
      const tagMatches = applyTagFilter(customer, filters.tags);
      if (!tagMatches) return false;
    }

    // Apply vehicle type filter if selected
    if (filters.vehicleType) {
      const vehicleTypeMatches = applyVehicleTypeFilter(customer, filters.vehicleType);
      if (!vehicleTypeMatches) return false;
    }

    // Apply date range filter if set
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
      const dateMatches = applyDateRangeFilter(customer, filters.dateRange);
      if (!dateMatches) return false;
    }

    // Apply has vehicles filter if selected
    if (filters.hasVehicles) {
      const hasVehiclesMatches = applyHasVehiclesFilter(customer, filters.hasVehicles);
      if (!hasVehiclesMatches) return false;
    }

    return true;
  });
};

// Helper functions for each filter type
const applySearchFilter = (customer: Customer, query: string): boolean => {
  if (!query) return true;
  
  const searchableFields = [
    customer.first_name,
    customer.last_name,
    customer.email,
    customer.phone,
    customer.address,
    customer.company,
    customer.notes
  ].filter(Boolean); // Remove any null/undefined values
  
  const searchText = searchableFields.join(' ').toLowerCase();
  return searchText.includes(query.toLowerCase());
};

const applyTagFilter = (customer: Customer, tags: string[]): boolean => {
  if (!customer.tags || customer.tags.length === 0) return false;
  return tags.some(tag => customer.tags?.includes(tag));
};

const applyVehicleTypeFilter = (customer: Customer, vehicleType: string): boolean => {
  if (!customer.vehicles || customer.vehicles.length === 0) return false;
  
  return customer.vehicles.some(vehicle => {
    // This is a simplified implementation - in a real app, you might 
    // want to map makes/models to vehicle types or have a dedicated field
    const vehicleDescription = `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase();
    return vehicleDescription.includes(vehicleType.toLowerCase());
  });
};

const applyDateRangeFilter = (customer: Customer, dateRange: DateRange): boolean => {
  // For demonstration purposes, we'll use lastServiceDate if available
  // In a real implementation, this would be based on work orders or service records
  if (!customer.lastServiceDate) return false;
  
  const serviceDate = new Date(customer.lastServiceDate);
  
  if (dateRange.from && dateRange.to) {
    return serviceDate >= dateRange.from && serviceDate <= dateRange.to;
  } else if (dateRange.from) {
    return serviceDate >= dateRange.from;
  } else if (dateRange.to) {
    return serviceDate <= dateRange.to;
  }
  
  return true;
};

const applyHasVehiclesFilter = (customer: Customer, hasVehicles: string): boolean => {
  if (hasVehicles === "yes") {
    return customer.vehicles !== undefined && customer.vehicles.length > 0;
  } else if (hasVehicles === "no") {
    return !customer.vehicles || customer.vehicles.length === 0;
  }
  return true;
};
