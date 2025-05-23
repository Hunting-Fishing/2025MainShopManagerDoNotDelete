
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { Loader2, UserCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export function CustomerSelector() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const { toast } = useToast();
  const { startImpersonation, stopImpersonation, isImpersonating, impersonatedCustomer } = useImpersonation();

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('Fetching customers for impersonation');
      // First try to get customers with auth accounts
      const { data: linkedCustomers, error: linkedError } = await supabase
        .from('customers')
        .select('id, first_name, last_name, email')
        .not('auth_user_id', 'is', null);
      
      if (linkedError) {
        console.error('Error fetching customers with auth accounts:', linkedError);
        throw new Error(linkedError.message);
      }
      
      console.log('Retrieved customers with auth accounts:', linkedCustomers);
      
      // If no customers with auth accounts found, get all customers
      if (linkedCustomers.length === 0) {
        console.log('No customers with auth accounts found, fetching all customers');
        const { data: allCustomers, error: allError } = await supabase
          .from('customers')
          .select('id, first_name, last_name, email')
          .limit(50);
        
        if (allError) {
          console.error('Error fetching all customers:', allError);
          throw new Error(allError.message);
        }
        
        console.log('Retrieved all customers:', allCustomers);
        return allCustomers as Customer[];
      }
      
      return linkedCustomers as Customer[];
    }
  });

  const handleSelectCustomer = () => {
    if (!selectedCustomerId) return;
    
    const customer = customers?.find(c => c.id === selectedCustomerId);
    if (!customer) return;
    
    startImpersonation({
      id: customer.id,
      name: `${customer.first_name} ${customer.last_name}`.trim(),
      email: customer.email || 'No email',
    });
    
    toast({
      title: "Customer Portal Preview Activated",
      description: `You are now viewing the portal as ${customer.first_name} ${customer.last_name}`,
    });
  };
  
  const handleStopImpersonation = () => {
    stopImpersonation();
    toast({
      title: "Customer Portal Preview Ended",
      description: "You are now back to your normal view",
    });
  };

  if (isLoading) return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2">Loading customers...</span>
        </div>
      </CardContent>
    </Card>
  );

  const noCustomersFound = !error && (!customers || customers.length === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Portal Preview</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load customers: {error instanceof Error ? error.message : 'Unknown error'}
            </AlertDescription>
          </Alert>
        )}

        {noCustomersFound && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No customers found in the database. Please add customers before using this feature.
            </AlertDescription>
          </Alert>
        )}

        {isImpersonating ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <UserCheck className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p className="font-medium">Currently previewing as:</p>
                <p className="text-sm text-green-700">{impersonatedCustomer?.name} ({impersonatedCustomer?.email})</p>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button
                onClick={() => window.open('/customer-portal', '_blank')}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Open Customer Portal
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleStopImpersonation}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Exit Preview Mode
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-600">
              Select a customer to preview their portal view. This allows you to test the customer 
              experience without affecting your admin access.
            </p>
            
            <div className="flex flex-col space-y-3">
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId} disabled={noCustomersFound}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers && customers.length > 0 ? (
                    customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name} {customer.email ? `(${customer.email})` : ''}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No customers available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleSelectCustomer}
                disabled={!selectedCustomerId || noCustomersFound}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start Customer Preview
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
