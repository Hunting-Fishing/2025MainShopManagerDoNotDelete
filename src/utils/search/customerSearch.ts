
import { Customer, CustomerVehicle } from "@/types/customer";

export const searchCustomersByName = (customers: Customer[], searchTerm: string): Customer[] => {
  if (!searchTerm || searchTerm.trim() === '') return customers;
  
  const term = searchTerm.toLowerCase().trim();
  
  return customers.filter(customer => {
    const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
    const email = customer.email?.toLowerCase() || '';
    const phone = customer.phone?.toLowerCase() || '';
    const company = customer.company?.toLowerCase() || '';
    
    return fullName.includes(term) || 
           email.includes(term) || 
           phone.includes(term) ||
           company.includes(term);
  });
};

export const searchCustomersByVehicle = (customers: Customer[], searchTerm: string): Customer[] => {
  if (!searchTerm || searchTerm.trim() === '') return customers;
  
  const term = searchTerm.toLowerCase().trim();
  
  return customers.filter(customer => {
    if (!customer.vehicles || !customer.vehicles.length) {
      return false;
    }
    
    return customer.vehicles.some(vehicle => {
      const make = (vehicle.make || '').toLowerCase();
      const model = (vehicle.model || '').toLowerCase();
      const year = vehicle.year?.toString() || '';
      const vin = (vehicle.vin || '').toLowerCase();
      const licensePlate = (vehicle.license_plate || '').toLowerCase();
      // Note: vehicle type may not be available on all vehicles
      const vehicleType = vehicle.body_style?.toLowerCase() || '';
      
      return make.includes(term) || 
             model.includes(term) ||
             year.includes(term) ||
             vin.includes(term) ||
             licensePlate.includes(term) ||
             vehicleType.includes(term);
    });
  });
};

export const filterCustomersByHasVehicles = (customers: Customer[], hasVehicles: boolean): Customer[] => {
  return customers.filter(customer => {
    const hasCustomerVehicles = customer.vehicles && customer.vehicles.length > 0;
    return hasVehicles ? hasCustomerVehicles : !hasCustomerVehicles;
  });
};
