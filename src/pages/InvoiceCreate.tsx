
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { InventoryItemExtended } from '@/types/inventory';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const InvoiceCreate = () => {
  const { data: invoiceData, isLoading, error } = useQuery({
    queryKey: ['invoice-draft'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('status', 'draft')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error) throw error;
        
        return data || {
          id: '',
          status: 'draft',
          items: [],
          total: 0,
          subtotal: 0,
          tax: 0
        };
      } catch (err) {
        console.error('Error fetching draft invoice:', err);
        throw err;
      }
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-48">
      <div className="text-lg">Loading invoice data...</div>
    </div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <h2 className="text-lg font-semibold text-red-700">Error loading invoice</h2>
      <p className="text-red-600">There was a problem loading the invoice data. Please try again.</p>
    </div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Invoice</h1>
      <div className="grid gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
          <p className="text-slate-500">
            Connect to your database to load customer and inventory data for invoice creation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCreate;
