
import React, { useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { CustomerProfileCard } from '@/components/customers/profiles/CustomerProfileCard';
import { CustomerProfilesHeader } from '@/components/customers/profiles/CustomerProfilesHeader';
import { CustomerProfilesFilters } from '@/components/customers/profiles/CustomerProfilesFilters';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CustomerFilters } from '@/components/customers/filters/CustomerFilterControls';
import { useNotifications } from '@/context/notifications';

export default function CustomerProfiles() {
  const {
    customers,
    filteredCustomers,
    filters,
    loading,
    error,
    handleFilterChange
  } = useCustomers();
  
  const { addNotification } = useNotifications();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  // Handle view toggle
  const toggleView = (newView: 'grid' | 'list') => {
    setView(newView);
  };

  // Export customer profiles
  const handleExport = () => {
    try {
      // In a real app, this would export to CSV/Excel
      const exportCount = filteredCustomers.length;
      
      addNotification({
        title: "Export Complete",
        message: `Successfully exported ${exportCount} customer profiles.`,
        type: "success",
        priority: "medium",
        category: "customer"
      });
    } catch (err) {
      console.error("Export error:", err);
      
      addNotification({
        title: "Export Failed",
        message: "There was a problem exporting customer profiles.",
        type: "error",
        priority: "high",
        category: "system"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading customer profiles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-8 mx-auto max-w-3xl">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Error loading profiles</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <CustomerProfilesHeader 
        totalCustomers={customers.length} 
        filteredCount={filteredCustomers.length}
        onExport={handleExport}
        view={view}
        onViewChange={toggleView}
      />
      
      <CustomerProfilesFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />

      {filteredCustomers.length === 0 ? (
        <div className="text-center p-8">
          <h3 className="text-xl font-semibold mb-2">No customer profiles found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or adding new customers.</p>
          <Button className="mt-4" variant="default" asChild>
            <a href="/customers/new">Add New Customer</a>
          </Button>
        </div>
      ) : (
        <div className={view === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredCustomers.map((customer) => (
            <CustomerProfileCard
              key={customer.id}
              customer={customer}
              view={view}
            />
          ))}
        </div>
      )}
    </div>
  );
}
