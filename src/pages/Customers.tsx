
import { useCustomers } from "@/hooks/useCustomers";
import { CustomersList } from "@/components/customers/list/CustomersList";
import { CustomersHeader } from "@/components/customers/list/CustomersHeader";

export default function Customers() {
  const {
    customers,
    filteredCustomers,
    filters,
    loading,
    error,
    handleFilterChange
  } = useCustomers();

  console.log("Customers page rendering with:", { 
    totalCustomers: customers?.length || 0, 
    filteredCount: filteredCustomers?.length || 0,
    isLoading: loading,
    hasError: !!error
  });

  return (
    <div className="space-y-6">
      <CustomersHeader />
      <CustomersList
        customers={customers}
        filteredCustomers={filteredCustomers}
        filters={filters}
        loading={loading}
        error={error}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
