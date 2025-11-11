import React from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useEquipment } from '@/hooks/useEquipment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Search, Plus, Wrench, Calendar, Package, Users, Truck, Settings } from 'lucide-react';
import { AddEquipmentDialog } from '@/components/equipment/AddEquipmentDialog';
import { useState } from 'react';
import { toast } from 'sonner';

export default function VehiclesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthUser();
  const { equipment, isLoading: loading, refetch } = useEquipment();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter for fleet categories
  const fleetCategories = ['fleet_vehicle', 'courtesy_car', 'rental_vehicle', 'service_vehicle'];
  const assets = equipment.filter(item => fleetCategories.includes(item.category));

  if (authLoading || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const availableAssets = assets.filter(asset => asset.status === 'operational');
  const inUseAssets = assets.filter(asset => asset.status === 'maintenance');
  const maintenanceAssets = assets.filter(asset => asset.status === 'out_of_service');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Vehicles & Equipment</h1>
          <p className="text-muted-foreground">Manage your company's fleet, courtesy vehicles, and equipment</p>
        </div>
        <AddEquipmentDialog 
          open={dialogOpen} 
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) refetch();
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
            <p className="text-xs text-muted-foreground">
              Company assets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableAssets.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready for use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Use</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inUseAssets.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently checked out
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceAssets.length}</div>
            <p className="text-xs text-muted-foreground">
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="operational">Operational</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="out_of_service">Out of Service</SelectItem>
            <SelectItem value="down">Down</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="fleet_vehicle">Fleet Vehicle</SelectItem>
            <SelectItem value="courtesy_car">Courtesy Car</SelectItem>
            <SelectItem value="rental_vehicle">Rental Vehicle</SelectItem>
            <SelectItem value="service_vehicle">Service Vehicle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => {
          const getStatusColor = (status: string) => {
            switch (status) {
              case 'operational': return 'bg-green-100 text-green-800';
              case 'maintenance': return 'bg-yellow-100 text-yellow-800';
              case 'out_of_service': return 'bg-red-100 text-red-800';
              case 'down': return 'bg-red-200 text-red-900';
              default: return 'bg-gray-100 text-gray-800';
            }
          };

          const getCategoryIcon = (category: string) => {
            switch (category) {
              case 'courtesy_car': return <Users className="h-4 w-4" />;
              case 'rental_vehicle': return <Car className="h-4 w-4" />;
              case 'fleet_vehicle': return <Truck className="h-4 w-4" />;
              case 'service_vehicle': return <Wrench className="h-4 w-4" />;
              default: return <Package className="h-4 w-4" />;
            }
          };

          return (
            <Card key={asset.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {asset.name}
                  </CardTitle>
                  {getCategoryIcon(asset.category)}
                </div>
                <div className="flex gap-2">
                  <Badge className={`${getStatusColor(asset.status)} text-xs`}>
                    {asset.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {asset.category.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Manufacturer</label>
                    <p className="font-medium">
                      {asset.manufacturer || 'Not recorded'}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Model</label>
                    <p>{asset.model || 'Not recorded'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Location</label>
                    <p>{asset.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Serial #</label>
                    <p className="text-xs font-mono">{asset.serial_number || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' ? 'No assets found' : 'No company assets yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your search terms or filters'
                : 'Start by adding your first company vehicle or equipment'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Asset
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}