import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ArrowLeft, 
  Droplets, 
  BarChart3, 
  Plus, 
  Search, 
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertTriangle,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useWaterUnits } from '@/hooks/water-delivery/useWaterUnits';
import { 
  useWaterInventory, 
  useLowStockInventory,
  useDeleteWaterInventory,
  WaterInventoryItem 
} from '@/hooks/water-delivery/useWaterInventory';
import { AddInventoryDialog, EditInventoryDialog, AdjustQuantityDialog } from '@/components/water-delivery/inventory';

const LOCATION_FILTERS = [
  { value: 'all', label: 'All Locations' },
  { value: 'storage_tank', label: 'Storage Tanks' },
  { value: 'tanker_truck', label: 'Tanker Trucks' },
  { value: 'customer_site', label: 'Customer Sites' },
  { value: 'other', label: 'Other' },
];

const formatLocationType = (type: string) => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getStockStatus = (quantity: number, maxCapacity: number | null, reorderPoint: number | null) => {
  if (reorderPoint && quantity <= reorderPoint) {
    return { label: 'Low Stock', variant: 'destructive' as const, color: 'text-red-600' };
  }
  if (maxCapacity) {
    const utilization = (quantity / maxCapacity) * 100;
    if (utilization > 50) return { label: 'Good', variant: 'default' as const, color: 'text-green-600' };
    if (utilization > 20) return { label: 'Medium', variant: 'secondary' as const, color: 'text-amber-600' };
    return { label: 'Low', variant: 'destructive' as const, color: 'text-red-600' };
  }
  return { label: 'Good', variant: 'default' as const, color: 'text-green-600' };
};

export default function WaterDeliveryInventory() {
  const navigate = useNavigate();
  const { formatVolume } = useWaterUnits();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add');
  const [selectedItem, setSelectedItem] = useState<WaterInventoryItem | null>(null);

  const { data: inventory, isLoading } = useWaterInventory(locationFilter);
  const { data: lowStockItems = [] } = useLowStockInventory();
  const deleteMutation = useDeleteWaterInventory();

  // Filter inventory based on search
  const filteredInventory = useMemo(() => {
    if (!inventory) return [];
    if (!searchQuery) return inventory;
    
    const query = searchQuery.toLowerCase();
    return inventory.filter(item => 
      item.water_delivery_products?.product_name?.toLowerCase().includes(query) ||
      item.location_type?.toLowerCase().includes(query) ||
      item.location_id?.toLowerCase().includes(query)
    );
  }, [inventory, searchQuery]);

  // Summary calculations
  const totalCapacity = inventory?.reduce((sum, item) => sum + (item.max_capacity || 0), 0) || 0;
  const totalCurrent = inventory?.reduce((sum, item) => sum + (item.quantity_gallons || 0), 0) || 0;
  const utilizationPercent = totalCapacity > 0 ? (totalCurrent / totalCapacity) * 100 : 0;

  const handleEdit = (item: WaterInventoryItem) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleAdjust = (item: WaterInventoryItem, type: 'add' | 'remove') => {
    setSelectedItem(item);
    setAdjustType(type);
    setAdjustDialogOpen(true);
  };

  const handleDelete = (item: WaterInventoryItem) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      deleteMutation.mutate(item.id);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/water-delivery')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-cyan-600" />
              Water Inventory
            </h1>
            <p className="text-muted-foreground mt-1">
              Track water stock levels and storage
            </p>
          </div>
          <Button 
            onClick={() => setAddDialogOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Inventory
          </Button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">
              {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} at or below reorder point
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {lowStockItems.map(i => i.water_delivery_products?.product_name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatVolume(totalCapacity, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">{formatVolume(totalCurrent, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilizationPercent.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatVolume(totalCapacity - totalCurrent, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {LOCATION_FILTERS.map((filter) => (
                <Button
                  key={filter.value}
                  variant={locationFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLocationFilter(filter.value)}
                  className={locationFilter === filter.value ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredInventory.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Quick Actions</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => {
                    const status = getStockStatus(item.quantity_gallons, item.max_capacity, item.reorder_point);
                    const utilization = item.max_capacity 
                      ? (item.quantity_gallons / item.max_capacity) * 100 
                      : 100;
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.location_id || formatLocationType(item.location_type)}</p>
                            <p className="text-sm text-muted-foreground">{formatLocationType(item.location_type)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.water_delivery_products?.product_name}</p>
                            <p className="text-sm text-muted-foreground">{item.water_delivery_products?.water_type}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatVolume(item.quantity_gallons, 0)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.max_capacity ? formatVolume(item.max_capacity, 0) : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={status.variant}>{status.label}</Badge>
                            {item.max_capacity && (
                              <div className="w-20 bg-muted rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    utilization > 50 ? 'bg-green-500' : 
                                    utilization > 20 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(utilization, 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAdjust(item, 'add')}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAdjust(item, 'remove')}
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            >
                              <span className="font-bold">−</span>
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(item)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(item)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">
                {searchQuery || locationFilter !== 'all' 
                  ? 'No inventory items match your filters' 
                  : 'No inventory items yet'}
              </p>
              {!searchQuery && locationFilter === 'all' && (
                <Button 
                  onClick={() => setAddDialogOpen(true)}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Inventory Item
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddInventoryDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
      />
      <EditInventoryDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen}
        item={selectedItem}
      />
      <AdjustQuantityDialog
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        item={selectedItem}
        type={adjustType}
      />
    </div>
  );
}
