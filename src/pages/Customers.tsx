
import React from "react";
import { CustomersList } from "@/components/customers/list/CustomersList";
import { useCustomers } from "@/hooks/useCustomers";

export default function Customers() {
  const { 
    customers, 
    filteredCustomers, 
    loading, 
    error, 
    filters, 
    handleFilterChange 
  } = useCustomers();

  // Transform customers to match expected interface
  const transformedCustomers = customers.map(customer => ({
    ...customer,
    email: customer.email || '', // Ensure email is always a string
    phone: customer.phone || '', // Ensure phone is always a string
    address: customer.address || '', // Ensure address is always a string
  }));

  const transformedFilteredCustomers = filteredCustomers.map(customer => ({
    ...customer,
    email: customer.email || '', // Ensure email is always a string
    phone: customer.phone || '', // Ensure phone is always a string
    address: customer.address || '', // Ensure address is always a string
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <CustomersList 
        customers={transformedCustomers}
        filteredCustomers={transformedFilteredCustomers}
        filters={filters}
        loading={loading}
        error={error}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
