import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { WorkOrder } from '@/types/workOrder';
import { getAllWorkOrders, getUniqueTechnicians } from '@/services/workOrder';
import { Plus, Filter, Users, Calendar, TrendingUp } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  'on-hold': 'bg-gray-100 text-gray-800 border-gray-200'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<string[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchWorkOrders();
    fetchTechnicians();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllWorkOrders();
      setWorkOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const data = await getUniqueTechnicians();
      setTechnicians(data);
    } catch (err: any) {
      console.error("Error fetching technicians:", err);
    }
  };

  const filteredWorkOrders = workOrders.filter(workOrder => {
    const technicianFilter = selectedTechnician === 'all' || workOrder.technician_id === selectedTechnician;
    const searchFilter = searchTerm === '' ||
      workOrder.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.customer?.toLowerCase().includes(searchTerm.toLowerCase());
    return technicianFilter && searchFilter;
  });

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading work orders..." className="mt-8" />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading work orders: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Work Orders</h1>
          <p className="text-muted-foreground">
            Manage and track service work orders
          </p>
        </div>
        <Button asChild>
          <Link to="/work-orders/create">
            <Plus className="mr-2 h-4 w-4" />
            New Work Order
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Technicians" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Technicians</SelectItem>
              {technicians.map(technician => (
                <SelectItem key={technician} value={technician}>{technician}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="search"
            placeholder="Search work orders..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Team
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Calendar
          </Button>
          <Button variant="outline">
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Work Orders List */}
      {filteredWorkOrders.length === 0 ? (
        <div className="p-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600">No work orders found.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkOrders.map(workOrder => (
            <Card key={workOrder.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">
                        Work Order #{workOrder.id.substring(0, 8)}
                      </h3>
                      <Badge className={statusColors[workOrder.status]}>
                        {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className={priorityColors[workOrder.priority]}>
                        {workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)} Priority
                      </Badge>
                    </div>
                    <p className="text-gray-600">{workOrder.description}</p>
                    <p className="text-sm text-gray-500">
                      Customer: {workOrder.customer}
                    </p>
                    <p className="text-xs text-gray-400">
                      Created: {new Date(workOrder.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Link to={`/work-orders/${workOrder.id}`}>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
