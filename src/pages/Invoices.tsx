
import React from 'react';
import { useInvoices } from '@/hooks/useInvoices';
import { InvoiceList } from '@/components/invoices/InvoiceList';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Loader2 } from 'lucide-react';

export default function Invoices() {
  const { invoices, isLoading, error } = useInvoices();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading invoices from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Create and manage invoices for your customers
          </p>
        </div>
        
        <Alert variant="destructive">
          <Database className="h-4 w-4" />
          <AlertDescription>
            Error loading invoices: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          All invoice data is live from your Supabase database. No mock or sample data is displayed.
        </AlertDescription>
      </Alert>

      <InvoiceList 
        invoices={invoices} 
        isLoading={isLoading} 
        error={error ? new Error(error) : null} 
      />
    </div>
  );
}
