import React from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useCompanyAssets } from '@/hooks/useCompanyAssets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Search, Plus, Wrench, Calendar, Package, Users, Truck, Settings } from 'lucide-react';
import { AddAssetDialog } from '@/components/company-assets/AddAssetDialog';
import { useState } from 'react';
import { toast } from 'sonner';

export default function VehiclesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthUser();
  const { assets, loading, createAsset, updateAsset, checkoutAsset, checkinAsset } = useCompanyAssets();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

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
    const matchesSearch = `${asset.year} ${asset.make} ${asset.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.current_location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || asset.asset_status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || asset.asset_category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const availableAssets = assets.filter(asset => asset.asset_status === 'available');
  const inUseAssets = assets.filter(asset => asset.asset_status === 'in_use');
  const maintenanceAssets = assets.filter(asset => asset.asset_status === 'maintenance');

  const handleCheckout = async (assetId: string) => {
    try {
      // For demo purposes, we'll use a placeholder user ID
      // In a real app, you'd have a proper user selection dialog
      await checkoutAsset(assetId, 'demo-user-id');
      toast.success('Asset checked out successfully');
    } catch (error) {
      toast.error('Failed to checkout asset');
    }
  };

  const handleCheckin = async (assetId: string) => {
    try {
      await checkinAsset(assetId);
      toast.success('Asset checked in successfully');
    } catch (error) {
      toast.error('Failed to checkin asset');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Vehicles & Equipment</h1>
          <p className="text-muted-foreground">Manage your company's fleet, courtesy vehicles, and equipment</p>
        </div>
        <AddAssetDialog onAdd={createAsset} />
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
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in_use">In Use</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="out_of_service">Out of Service</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="courtesy">Courtesy</SelectItem>
            <SelectItem value="rental">Rental</SelectItem>
            <SelectItem value="fleet">Fleet</SelectItem>
            <SelectItem value="service">Service</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => {
          const getStatusColor = (status: string) => {
            switch (status) {
              case 'available': return 'bg-green-100 text-green-800';
              case 'in_use': return 'bg-blue-100 text-blue-800';
              case 'maintenance': return 'bg-yellow-100 text-yellow-800';
              case 'out_of_service': return 'bg-red-100 text-red-800';
              case 'retired': return 'bg-gray-100 text-gray-800';
              default: return 'bg-gray-100 text-gray-800';
            }
          };

          const getCategoryIcon = (category: string) => {
            switch (category) {
              case 'courtesy': return <Users className="h-4 w-4" />;
              case 'rental': return <Car className="h-4 w-4" />;
              case 'fleet': return <Truck className="h-4 w-4" />;
              case 'service': return <Wrench className="h-4 w-4" />;
              case 'equipment': return <Settings className="h-4 w-4" />;
              default: return <Package className="h-4 w-4" />;
            }
          };

          return (
            <Card key={asset.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {asset.year} {asset.make} {asset.model}
                  </CardTitle>
                  {getCategoryIcon(asset.asset_category || 'other')}
                </div>
                <div className="flex gap-2">
                  <Badge className={`${getStatusColor(asset.asset_status || 'available')} text-xs`}>
                    {asset.asset_status?.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {asset.asset_category?.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">VIN</label>
                    <p className="font-mono text-xs">
                      {asset.vin || 'Not recorded'}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">License</label>
                    <p>{asset.license_plate || 'Not recorded'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Location</label>
                    <p>{asset.current_location || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Color</label>
                    <p>{asset.color || 'Not specified'}</p>
                  </div>
                </div>

                {asset.checked_out_to && (
                  <div className="text-sm">
                    <label className="text-muted-foreground">Checked out to</label>
                    <p>{asset.checked_out_to}</p>
                    {asset.expected_return_date && (
                      <p className="text-xs text-muted-foreground">
                        Expected return: {new Date(asset.expected_return_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-3">
                  {asset.asset_status === 'available' ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleCheckout(asset.id)}
                    >
                      Check Out
                    </Button>
                  ) : asset.asset_status === 'in_use' ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleCheckin(asset.id)}
                    >
                      Check In
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1" disabled>
                      {asset.asset_status?.replace('_', ' ')}
                    </Button>
                  )}
                  <Button size="sm">
                    Details
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
              <AddAssetDialog onAdd={createAsset} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}