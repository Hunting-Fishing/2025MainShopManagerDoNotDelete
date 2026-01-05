import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  useGunsmithPendingPartOrders, 
  useUpdateJobPartOrderStatus,
  type GunsmithJobPartOrder 
} from '@/hooks/useGunsmithJobPartOrders';
import { 
  Package, 
  Search, 
  MoreVertical, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Wrench,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  ordered: { label: 'Ordered', variant: 'default', icon: <Clock className="h-3 w-3" /> },
  backordered: { label: 'Backordered', variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
  received: { label: 'Received', variant: 'secondary', icon: <CheckCircle className="h-3 w-3" /> },
  installed: { label: 'Installed', variant: 'outline', icon: <Wrench className="h-3 w-3" /> },
};

export default function GunsmithPartsOnOrder() {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useGunsmithPendingPartOrders();
  const updateStatus = useUpdateJobPartOrderStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.job?.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.job?.customer?.first_name} ${order.job?.customer?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (order: GunsmithJobPartOrder, newStatus: string) => {
    const updates: { id: string; status: string; received_date?: string; installed_date?: string } = {
      id: order.id,
      status: newStatus,
    };

    if (newStatus === 'received' && !order.received_date) {
      updates.received_date = new Date().toISOString().split('T')[0];
    }
    if (newStatus === 'installed' && !order.installed_date) {
      updates.installed_date = new Date().toISOString().split('T')[0];
    }

    updateStatus.mutate(updates);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Parts on Order</h1>
          <p className="text-muted-foreground">Track all parts ordered for customer jobs</p>
        </div>
        <Button onClick={() => navigate('/gunsmith/parts?order=1')}>
          <Plus className="mr-2 h-4 w-4" />
          Quick Add Order
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by part, supplier, job #, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="backordered">Backordered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pending Orders ({filteredOrders?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : !filteredOrders || filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No pending part orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const config = statusConfig[order.status] || statusConfig.ordered;
                const customerName = order.job?.customer 
                  ? `${order.job.customer.first_name} ${order.job.customer.last_name}`
                  : 'Unknown Customer';
                const firearmInfo = order.job?.firearm
                  ? `${order.job.firearm.make} ${order.job.firearm.model}`
                  : '';

                return (
                  <div 
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-4"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{order.part_name}</span>
                        <Badge variant={config.variant} className="flex items-center gap-1">
                          {config.icon}
                          {config.label}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>PN: {order.part_number} - Qty: {order.quantity_ordered}</p>
                        {order.supplier && <p>Supplier: {order.supplier}</p>}
                        {order.unit_cost && (
                          <p>Cost: ${order.unit_cost.toFixed(2)} ea - Total: ${order.total_cost?.toFixed(2)}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.job?.job_number || 'N/A'}</span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => navigate(`/gunsmith/jobs/${order.job_id}`)}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-muted-foreground">{customerName}</span>
                      {firearmInfo && (
                        <span className="text-muted-foreground text-xs">{firearmInfo}</span>
                      )}
                      {order.expected_date && (
                        <span className="text-xs">
                          Expected: {format(new Date(order.expected_date), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {order.status === 'ordered' && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusChange(order, 'received')}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Received
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(order, 'backordered')}>
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Mark Backordered
                            </DropdownMenuItem>
                          </>
                        )}
                        {order.status === 'backordered' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(order, 'received')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Received
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => navigate(`/gunsmith/jobs/${order.job_id}`)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
