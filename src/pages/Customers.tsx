
import { useCustomers } from "@/hooks/useCustomers";
import { CustomersList } from "@/components/customers/list/CustomersList";
import { CustomersHeader } from "@/components/customers/list/CustomersHeader";
import { CustomerCount } from "@/components/customers/CustomerCount";

export default function Customers() {
  const {
    customers,
    filteredCustomers,
    filters,
    loading,
    error,
    handleFilterChange,
    refreshCustomers
  } = useCustomers();

  console.log("Customers page rendering with:", { 
    totalCustomers: customers?.length || 0, 
    filteredCount: filteredCustomers?.length || 0,
    isLoading: loading,
    hasError: !!error
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-1">
          <CustomerCount />
        </div>
        <div className="md:col-span-3">
          <CustomersHeader />
        </div>
      </div>
      <CustomersList
        customers={customers}
        filteredCustomers={filteredCustomers}
        filters={filters}
        loading={loading}
        error={error}
        onFilterChange={handleFilterChange}
        onRefresh={refreshCustomers}
      />
    </div>
  );
}
