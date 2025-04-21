
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  Clock, 
  ChevronRight, 
  MessageSquare, 
  Bell,
  CalendarIcon
} from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';

interface WorkOrdersListProps {
  customerId: string;
}

const WorkOrdersList: React.FC<WorkOrdersListProps> = ({ customerId }) => {
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching work orders:", error);
          return;
        }

        if (data) {
          setWorkOrders(data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, [customerId]);

  const formatWorkOrderDate = (workOrder) => {
    if (workOrder.createdAt) {
      return format(new Date(workOrder.createdAt), 'MMM d, yyyy');
    } else if (workOrder.created_at) {
      return format(new Date(workOrder.created_at), 'MMM d, yyyy');
    }
    return 'Unknown date';
  };

  if (loading) {
    return <p>Loading work orders...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Work Orders</CardTitle>
        <CardDescription>
          Here's a list of all your work orders. Click on a work order to view
          details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {workOrders.map((workOrder) => (
            <div
              key={workOrder.id}
              className="py-4 cursor-pointer hover:bg-secondary"
              onClick={() =>
                navigate(`/customer-portal/work-orders/${workOrder.id}`)
              }
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{workOrder.description}</p>
                  <div className="text-sm text-muted-foreground">
                    Status: {workOrder.status}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-xs text-muted-foreground mt-1 flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {formatWorkOrderDate(workOrder)}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrdersList;
