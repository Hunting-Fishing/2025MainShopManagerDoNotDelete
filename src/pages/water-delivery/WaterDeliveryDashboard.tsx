import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Droplets, 
  Calendar, 
  DollarSign, 
  Truck,
  AlertTriangle,
  Plus,
  ClipboardList,
  Users,
  MapPin,
  Package,
  Receipt,
  Route,
  BarChart3,
  Container,
  Settings,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShopId } from '@/hooks/useShopId';
import { useModuleDisplayInfo } from '@/hooks/useModuleDisplayInfo';
import { useWaterUnits } from '@/hooks/water-delivery/useWaterUnits';

export default function WaterDeliveryDashboard() {
  const navigate = useNavigate();
  const { shopId } = useShopId();
  const { data: moduleInfo } = useModuleDisplayInfo(shopId, 'water_delivery');
  const { getVolumeLabel, formatVolume } = useWaterUnits();

  const statCards = [
    {
      title: 'Pending Orders',
      value: 0,
      icon: ClipboardList,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Scheduled',
      value: 0,
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'In Transit',
      value: 0,
      icon: Truck,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: `${getVolumeLabel(true)} Today`,
      value: formatVolume(0),
      icon: Droplets,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Droplets className="h-8 w-8 text-cyan-600" />
              {moduleInfo?.displayName || 'Water Delivery'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage water orders, deliveries, routes, and fleet
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/water-delivery/routes/new')}>
              <Route className="h-4 w-4 mr-2" />
              Plan Route
            </Button>
            <Button onClick={() => navigate('/water-delivery/orders/new')} className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 mb-8">
        <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => navigate('/water-delivery/orders')}>
          <ClipboardList className="h-6 w-6" />
          <span className="text-xs">Orders</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => navigate('/water-delivery/customers')}>
          <Users className="h-6 w-6" />
          <span className="text-xs">Customers</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 border-teal-500/30 hover:bg-teal-500/5" onClick={() => navigate('/water-delivery/tanks')}>
          <Container className="h-6 w-6 text-teal-500" />
          <span className="text-xs">Tanks</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 border-indigo-500/30 hover:bg-indigo-500/5" onClick={() => navigate('/water-delivery/tidy-tanks')}>
          <Package className="h-6 w-6 text-indigo-500" />
          <span className="text-xs">Tidy Tanks</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 border-cyan-500/30 hover:bg-cyan-500/5" onClick={() => navigate('/water-delivery/tank-fills')}>
          <Droplets className="h-6 w-6 text-cyan-500" />
          <span className="text-xs">Tank Fills</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 border-blue-500/30 hover:bg-blue-500/5" onClick={() => navigate('/water-delivery/equipment')}>
          <Settings className="h-6 w-6 text-blue-500" />
          <span className="text-xs">Equipment</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 border-purple-500/30 hover:bg-purple-500/5" onClick={() => navigate('/water-delivery/equipment-filters')}>
          <Filter className="h-6 w-6 text-purple-500" />
          <span className="text-xs">Filters</span>
        </Button>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 mb-8">
        <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => navigate('/water-delivery/locations')}>
          <MapPin className="h-6 w-6" />
          <span className="text-xs">Locations</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 border-cyan-500/30 hover:bg-cyan-500/5" onClick={() => navigate('/water-delivery/products')}>
          <Package className="h-6 w-6 text-cyan-500" />
          <span className="text-xs">Products</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 border-blue-500/30 hover:bg-blue-500/5" onClick={() => navigate('/water-delivery/trucks')}>
          <Truck className="h-6 w-6 text-blue-500" />
          <span className="text-xs">Trucks</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 border-green-500/30 hover:bg-green-500/5" onClick={() => navigate('/water-delivery/drivers')}>
          <Users className="h-6 w-6 text-green-500" />
          <span className="text-xs">Drivers</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 border-purple-500/30 hover:bg-purple-500/5" onClick={() => navigate('/water-delivery/routes')}>
          <Route className="h-6 w-6 text-purple-500" />
          <span className="text-xs">Routes</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 border-emerald-500/30 hover:bg-emerald-500/5" onClick={() => navigate('/water-delivery/invoices')}>
          <Receipt className="h-6 w-6 text-emerald-500" />
          <span className="text-xs">Invoices</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 border-cyan-500/30 hover:bg-cyan-500/5" onClick={() => navigate('/water-delivery/inventory')}>
          <BarChart3 className="h-6 w-6 text-cyan-500" />
          <span className="text-xs">Inventory</span>
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Droplets className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No orders yet</p>
              <Button variant="link" onClick={() => navigate('/water-delivery/orders/new')}>
                Create your first order
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Fleet Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-foreground">Available Trucks</span>
                </div>
                <p className="text-2xl font-bold text-green-500">0</p>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="font-medium text-foreground">Active Drivers</span>
                </div>
                <p className="text-2xl font-bold text-blue-500">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
