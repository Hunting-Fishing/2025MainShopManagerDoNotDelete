
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
  const [activeTab, setActiveTab] = useState('all');

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

    if (customerId) {
      fetchWorkOrders();
    }
  }, [customerId]);

  // Format the work order date handling both createdAt and created_at
  const formatWorkOrderDate = (workOrder: any) => {
    if (workOrder.createdAt) {
      return format(new Date(workOrder.createdAt), 'MMM d, yyyy');
    } else if (workOrder.created_at) {
      return format(new Date(workOrder.created_at), 'MMM d, yyyy');
    }
    return 'Unknown date';
  };

  // Get status-filtered work orders
  const getFilteredWorkOrders = () => {
    if (activeTab === 'all') {
      return workOrders;
    }
    return workOrders.filter(workOrder => workOrder.status === activeTab);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p>Loading work orders...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
        <CardTitle>Your Work Orders</CardTitle>
        <CardDescription>
          Here's a list of all your work orders. Click on a work order to view
          details.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-800">
              All
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-800">
              Pending
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
              In Progress
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="divide-y divide-border">
          {getFilteredWorkOrders().length === 0 ? (
            <p className="py-4 text-slate-500 text-center italic">
              No {activeTab === 'all' ? '' : activeTab} work orders found
            </p>
          ) : (
            getFilteredWorkOrders().map((workOrder) => (
              <div
                key={workOrder.id}
                className="py-4 cursor-pointer hover:bg-slate-50 rounded-lg px-4 transition-colors"
                onClick={() =>
                  navigate(`/customer-portal/work-orders/${workOrder.id}`)
                }
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{workOrder.description}</p>
                    <div className="flex items-center text-sm text-slate-500 mt-1">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {formatWorkOrderDate(workOrder)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      className={`
                        ${workOrder.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                          workOrder.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                          workOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          'bg-red-100 text-red-800 border-red-300'}
                        border
                      `}
                    >
                      {workOrder.status}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrdersList;
