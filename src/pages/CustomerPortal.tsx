
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CustomerPortalHeader } from '@/components/customer-portal/CustomerPortalHeader';
import { CustomerAccountCard } from '@/components/customer-portal/CustomerAccountCard';
import { CustomerVehicles } from '@/components/customer-portal/CustomerVehicles';
import { CustomerWorkOrders } from '@/components/customer-portal/CustomerWorkOrders';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export default function CustomerPortal() {
  const { customerId } = useParams<{ customerId: string }>();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) throw error;
      setCustomer(data);
    } catch (error: any) {
      console.error('Error fetching customer:', error);
      toast({
        title: "Error",
        description: "Failed to load customer information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Customer not found</div>
      </div>
    );
  }

  const customerName = `${customer.first_name} ${customer.last_name}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerPortalHeader customerName={customerName} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CustomerAccountCard customer={customer} />
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <CustomerWorkOrders customerId={customerId!} />
            <CustomerVehicles customer={customer} />
          </div>
        </div>
      </div>
    </div>
  );
}
