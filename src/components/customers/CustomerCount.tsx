
import React, { useState, useEffect } from 'react';
import { getAllCustomers } from '@/services/customer/customerQueryService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export const CustomerCount: React.FC = () => {
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerCount = async () => {
      try {
        const customers = await getAllCustomers();
        setCustomerCount(customers.length);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching customer count:', err);
        setError('Failed to load customer count');
        setLoading(false);
      }
    };

    fetchCustomerCount();
  }, []);

  if (loading) return <div>Loading customer count...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{customerCount}</div>
      </CardContent>
    </Card>
  );
};
