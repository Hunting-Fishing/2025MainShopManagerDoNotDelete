
import { useCustomers } from "@/hooks/useCustomers";
import { CustomersList } from "@/components/customers/list/CustomersList";
import { CustomersHeader } from "@/components/customers/list/CustomersHeader";
import { CustomerCount } from "@/components/customers/CustomerCount";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Customers() {
  const {
    customers = [],
    filteredCustomers = [],
    filters = {},
    loading = false,
    error = null,
    connectionOk = null,
    handleFilterChange,
    refreshCustomers
  } = useCustomers();

  console.log("Customers page rendering with:", { 
    totalCustomers: customers?.length || 0, 
    filteredCount: filteredCustomers?.length || 0,
    isLoading: loading,
    connectionStatus: connectionOk,
    hasError: !!error
  });

  // Ensure arrays are never null
  const safeCustomers = customers || [];
  const safeFilteredCustomers = filteredCustomers || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-1">
          <CustomerCount loading={loading} error={!!error} count={safeCustomers.length || 0} />
        </div>
        <div className="md:col-span-3">
          <CustomersHeader />
        </div>
      </div>
      
      {connectionOk === false && !loading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>Could not connect to the database. Please check your internet connection and try again.</p>
            <div className="mt-2">
              <Button variant="outline" onClick={refreshCustomers} size="sm">
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <CustomersList
        customers={safeCustomers}
        filteredCustomers={safeFilteredCustomers}
        filters={filters || {}}
        loading={loading}
        error={error}
        connectionOk={connectionOk}
        onFilterChange={handleFilterChange}
        onRefresh={refreshCustomers}
      />
      
      {!loading && !error && safeCustomers.length === 0 && connectionOk && (
        <div className="mt-8 text-center">
          <Button asChild>
            <Link to="/customers/create">Add Your First Customer</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
