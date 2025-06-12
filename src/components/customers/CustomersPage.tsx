
import React from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { CustomersList } from '@/components/customers/list/CustomersList';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CustomersPage() {
  console.log('🏠 CustomersPage component mounted');
  
  const {
    customers,
    filteredCustomers,
    loading,
    error,
    filters,
    handleFilterChange
  } = useCustomers();

  console.log('🏠 CustomersPage - customers:', customers?.length || 0);
  console.log('🏠 CustomersPage - loading:', loading);
  console.log('🏠 CustomersPage - error:', error);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer database and relationships
          </p>
        </div>
        <Button asChild>
          <Link to="/customers/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Link>
        </Button>
      </div>

      {/* Main Content */}
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
