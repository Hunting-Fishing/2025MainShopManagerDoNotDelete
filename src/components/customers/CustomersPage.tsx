
import React from "react";
import { CustomersLayout } from "./layout/CustomersLayout";
import { CustomersHeader } from "./list/CustomersHeader";
import { CustomerStatsCards } from "./stats/CustomerStatsCards";
import { CustomerFiltersPanel } from "./filters/CustomerFiltersPanel";
import { CustomerTable } from "./table/CustomerTable";
import { useCustomerData } from "@/application/customer/hooks/useCustomerData";
import { useCustomerFilters } from "@/application/customer/hooks/useCustomerFilters";

/**
 * REFACTORED: Main customers page using clean architecture
 * - Domain layer: Customer entity and business logic
 * - Infrastructure layer: Supabase repository implementation
 * - Application layer: Use cases and hooks
 * - Presentation layer: React components
 * 
 * Uses 100% live data from Supabase with proper separation of concerns
 */
export function CustomersPage() {
  console.log('🔄 CustomersPage: Rendering with clean architecture');
  
  // Application layer - data management
  const { customers, loading, error, refetch } = useCustomerData();
  
  // Application layer - filter management
  const { 
    filters, 
    filteredCustomers, 
    handleFilterChange, 
    clearFilters 
  } = useCustomerFilters(customers);

  if (error) {
    return (
      <CustomersLayout>
        <div className="text-center py-12">
          <p className="text-red-600 text-lg mb-4">Error loading customers</p>
          <p className="text-slate-500 mb-4">{error}</p>
          <button 
            onClick={() => refetch()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </CustomersLayout>
    );
  }

  return (
    <CustomersLayout>
      <CustomersHeader />
      
      <CustomerStatsCards 
        customers={customers}
        isLoading={loading}
      />
      
      <CustomerFiltersPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />
      
      <CustomerTable 
        customers={filteredCustomers}
        isLoading={loading}
      />
    </CustomersLayout>
  );
}
