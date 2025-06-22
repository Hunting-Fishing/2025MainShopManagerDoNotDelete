
import React from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { CustomersList } from '@/components/customers/list/CustomersList';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, TrendingUp, UserCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enhanced Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Customer Management
                </h1>
              </div>
              <p className="text-lg text-slate-600 max-w-2xl">
                Manage your customer relationships, track service history, and build lasting connections
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="outline" className="flex items-center gap-2">
                <Link to="/customers/import">
                  <TrendingUp className="h-4 w-4" />
                  Import Customers
                </Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                <Link to="/customers/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Customer
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Total Customers</p>
                <p className="text-2xl font-bold text-blue-900">
                  {customers?.length || 0}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600 rounded-xl">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Active Customers</p>
                <p className="text-2xl font-bold text-green-900">
                  {filteredCustomers?.length || 0}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">Growth Rate</p>
                <p className="text-2xl font-bold text-purple-900">+12%</p>
              </div>
            </div>
          </Card>
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
    </div>
  );
}
