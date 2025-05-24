
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

  return (
    <div className="container mx-auto px-4 py-8">
      <CustomersList 
        customers={customers}
        filteredCustomers={filteredCustomers}
        filters={filters}
        loading={loading}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
