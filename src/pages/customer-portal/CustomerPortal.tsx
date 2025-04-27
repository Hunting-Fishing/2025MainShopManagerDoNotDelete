import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { WorkOrder } from '@/types';
import { supabase } from '@/lib/supabase';

export function CustomerPortal() {
  const { customerId } = useParams<{ customerId: string }>();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setError('Customer ID is required.');
      setLoading(false);
      return;
    }

    const fetchWorkOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select('*')
          .eq('customer_id', customerId);

        if (error) {
          console.error('Error fetching work orders:', error);
          setError('Failed to load work orders.');
        } else {
          setWorkOrders(data || []);
        }
      } catch (err) {
        console.error('Error fetching work orders:', err);
        setError('Failed to load work orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, [customerId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const renderWorkOrders = (workOrders: WorkOrder[]) => {
    // Update property names to camelCase
    return workOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((order) => (
        <Card key={order.id} className="mb-4">
          <CardHeader>
            <CardTitle>Work Order #{order.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Service: {order.serviceType}</p>
            <p>Description: {order.description}</p>
            <p>Status: {order.status}</p>
            <p>Created At: {format(new Date(order.createdAt), 'MMMM dd, yyyy')}</p>
            {order.endTime ? (
              <span className="text-green-600">Completed</span>
            ) : (
              <span className="text-yellow-600">In Progress</span>
            )}
          </CardContent>
        </Card>
      ));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Work Orders</h1>
      {workOrders.length > 0 ? (
        renderWorkOrders(workOrders)
      ) : (
        <p>No work orders found.</p>
      )}
    </div>
  );
}
