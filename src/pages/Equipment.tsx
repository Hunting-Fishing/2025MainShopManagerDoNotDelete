import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cog, Settings, Wrench, Package, Car } from 'lucide-react';
import { EquipmentList } from '@/components/equipment/EquipmentList';
import { AddEquipmentDialog } from '@/components/equipment/AddEquipmentDialog';
import { useEquipment } from '@/hooks/useEquipment';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Equipment() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { equipment, stats, isLoading, refetch } = useEquipment();

  // Filter equipment by category
  const filteredEquipment = categoryFilter === 'all' 
    ? equipment 
    : equipment.filter(item => item.category === categoryFilter);

  // Calculate filtered stats
  const filteredStats = {
    total: filteredEquipment.length,
    operational: filteredEquipment.filter(item => item.status === 'operational').length,
    needsMaintenance: filteredEquipment.filter(item => item.status === 'maintenance').length,
    outOfService: filteredEquipment.filter(item => item.status === 'down' || item.status === 'retired' || item.status === 'out_of_service').length
  };

  const displayStats = categoryFilter === 'all' ? stats : filteredStats;

  return (
    <>
      <Helmet>
        <title>Assets & Equipment Management | AutoShop Pro</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assets & Equipment</h1>
            <p className="text-muted-foreground">
              Manage all shop equipment, vehicles, and company assets
            </p>
          </div>
          <AddEquipmentDialog 
            open={dialogOpen} 
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                // Force refetch after closing to show new equipment
                setTimeout(() => refetch(), 300);
              }
            }}
          />
        </div>

        {/* Category Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Filter by Category:</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fleet_vehicle">Fleet Vehicles</SelectItem>
                  <SelectItem value="courtesy_car">Courtesy Cars</SelectItem>
                  <SelectItem value="rental_vehicle">Rental Vehicles</SelectItem>
                  <SelectItem value="service_vehicle">Service Vehicles</SelectItem>
                  <SelectItem value="heavy_truck">Heavy Trucks</SelectItem>
                  <SelectItem value="forklift">Forklifts</SelectItem>
                  <SelectItem value="excavator">Excavators</SelectItem>
                  <SelectItem value="loader">Loaders</SelectItem>
                  <SelectItem value="dozer">Dozers</SelectItem>
                  <SelectItem value="crane">Cranes</SelectItem>
                  <SelectItem value="vessel">Vessels</SelectItem>
                  <SelectItem value="outboard">Outboard Motors</SelectItem>
                  <SelectItem value="marine">Marine Equipment</SelectItem>
                  <SelectItem value="semi">Semi Trucks</SelectItem>
                  <SelectItem value="small_engine">Small Engines</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic Equipment</SelectItem>
                  <SelectItem value="lifting">Lifting Equipment</SelectItem>
                  <SelectItem value="air_tools">Air Tools</SelectItem>
                  <SelectItem value="hand_tools">Hand Tools</SelectItem>
                  <SelectItem value="electrical">Electrical Equipment</SelectItem>
                  <SelectItem value="generator">Generators</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {categoryFilter !== 'all' && (
                <button
                  onClick={() => setCategoryFilter('all')}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Clear filter
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : displayStats.total}</div>
              <p className="text-xs text-muted-foreground">
                {categoryFilter === 'all' ? 'All assets' : 'In category'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operational</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : displayStats.operational}</div>
              <p className="text-xs text-muted-foreground">
                Ready for use
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : displayStats.needsMaintenance}</div>
              <p className="text-xs text-muted-foreground">
                Needs attention
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Service</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : displayStats.outOfService}</div>
              <p className="text-xs text-muted-foreground">
                Not available
              </p>
            </CardContent>
          </Card>
        </div>

        <EquipmentList equipment={filteredEquipment} loading={isLoading} onUpdate={refetch} />
      </div>
    </>
  );
}