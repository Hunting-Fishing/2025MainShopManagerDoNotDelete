
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { CustomersList } from '@/components/customers/list/CustomersList';
import { useCustomers } from '@/hooks/useCustomers';

export default function CustomersPage() {
  const { 
    customers,
    filteredCustomers, 
    loading, 
    error, 
    filters, 
    handleFilterChange,
    refetch
  } = useCustomers();

  console.log('📄 CustomersPage render state:', {
    loading,
    error,
    customersCount: customers?.length || 0,
    filteredCount: filteredCustomers?.length || 0
  });

  const handleSearchChange = (search: string) => {
    handleFilterChange({
      search,
      searchQuery: search,
      status: filters.status || 'all',
      sortBy: filters.sortBy || 'name'
    });
  };

  const handleRetry = () => {
    console.log('🔄 Manual retry triggered');
    refetch();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              Manage your customers and view their service history
            </p>
          </div>
          <Button asChild>
            <Link to="/customers/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
        </div>
        <LoadingSpinner size="lg" text="Loading customers from database..." className="mt-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              Manage your customers and view their service history
            </p>
          </div>
          <Button asChild>
            <Link to="/customers/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-900">Unable to load customers</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRetry}
                    className="border-red-300 hover:bg-red-100"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="border-red-300 hover:bg-red-100"
                  >
                    Refresh Page
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customers and view their service history
          </p>
          {customers && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">
                {customers.length} total customers
              </Badge>
              {filteredCustomers && filteredCustomers.length !== customers.length && (
                <Badge variant="outline">
                  {filteredCustomers.length} filtered
                </Badge>
              )}
            </div>
          )}
        </div>
        <Button asChild>
          <Link to="/customers/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers by name, email, phone, or company..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      {!customers || customers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8 text-gray-400" />}
          title="No customers found"
          description="Get started by adding your first customer to the system. All customer data is fetched live from your database."
          action={{
            label: "Add Customer",
            onClick: () => window.location.href = "/customers/create"
          }}
        />
      ) : (
        <CustomersList
          customers={customers}
          filteredCustomers={filteredCustomers}
          filters={filters}
          loading={loading}
          error={error}
          onFilterChange={handleFilterChange}
        />
      )}
    </div>
  );
}
