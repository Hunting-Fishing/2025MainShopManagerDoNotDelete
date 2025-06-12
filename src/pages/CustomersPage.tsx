
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users } from 'lucide-react';
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
    handleFilterChange 
  } = useCustomers();

  console.log('CustomersPage - loading:', loading);
  console.log('CustomersPage - error:', error);
  console.log('CustomersPage - customers:', customers);
  console.log('CustomersPage - filteredCustomers:', filteredCustomers);

  const handleSearchChange = (search: string) => {
    handleFilterChange({
      search,
      searchQuery: search,
      status: filters.status || 'all',
      sortBy: filters.sortBy || 'name'
    });
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
        <LoadingSpinner size="lg" text="Loading customers..." className="mt-8" />
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading customers: {error}</p>
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
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
          description="Get started by adding your first customer to the system."
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
