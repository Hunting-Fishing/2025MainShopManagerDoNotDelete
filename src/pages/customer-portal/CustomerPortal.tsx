import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { CalendarIcon, ClipboardList } from 'lucide-react';

const CustomerPortal = () => {
  const [customer, setCustomer] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      setLoading(true);
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .eq('auth_user_id', authData.user.id)
            .single();

          if (customerError) {
            throw customerError;
          }

          if (customerData) {
            setCustomer(customerData);
          } else {
            setError("No customer profile found for this user.");
          }

          // Fetch work orders for the customer
          const { data: workOrdersData, error: workOrdersError } = await supabase
            .from('work_orders')
            .select('*')
            .eq('customer_id', customerData?.id)
            .order('created_at', { ascending: false });

          if (workOrdersError) {
            throw workOrdersError;
          }

          if (workOrdersData) {
            setWorkOrders(workOrdersData);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  if (loading) {
    return <div className="p-4">Loading customer portal...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!customer) {
    return <div className="p-4">No customer data found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {customer.first_name}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Here's a summary of your account and recent activity.</p>

          {/* Work Orders Table/List Section */}
          {workOrders.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((workOrder) => (
                  <TableRow key={workOrder.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                        {workOrder.id}
                      </div>
                    </TableCell>
                    <TableCell>{workOrder.description}</TableCell>
                    <TableCell>
                      {workOrder.createdAt
                        ? format(new Date(workOrder.createdAt), "MMM d, yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell>{workOrder.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerPortal;
