import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, ArrowLeft, Search, AlertTriangle, History, 
  ShoppingCart, Barcode, Plus, TrendingDown, TrendingUp
} from 'lucide-react';
import { useGunsmithParts } from '@/hooks/useGunsmith';
import { useStockMovements, useLowStockParts, useSerializedItems, usePurchaseOrders } from '@/hooks/useGunsmithInventory';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function GunsmithInventory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('parts');

  const { data: parts, isLoading: partsLoading } = useGunsmithParts();
  const { data: movements, isLoading: movementsLoading } = useStockMovements();
  const { data: lowStock } = useLowStockParts();
  const { data: serialized, isLoading: serializedLoading } = useSerializedItems();
  const { data: purchaseOrders, isLoading: poLoading } = usePurchaseOrders();

  const filteredParts = parts?.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.part_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'job_usage': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'adjustment': return <History className="h-4 w-4 text-blue-500" />;
      default: return <History className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gunsmith')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Package className="h-8 w-8 text-amber-600" />
              Inventory Management
            </h1>
            <p className="text-muted-foreground mt-1">Stock tracking, movements, and purchase orders</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/gunsmith/inventory/adjust')}>
            <History className="h-4 w-4 mr-2" />
            Adjust Stock
          </Button>
          <Button onClick={() => navigate('/gunsmith/inventory/purchase-orders/new')}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            New PO
          </Button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {(lowStock?.length || 0) > 0 && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="font-medium">{lowStock?.length} item(s) need reordering</span>
            <Button size="sm" variant="outline" onClick={() => navigate('/gunsmith/inventory/purchase-orders/new')}>
              Create Purchase Order
            </Button>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="serialized">Serialized</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
        </TabsList>

        {/* Parts Tab */}
        <TabsContent value="parts">
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Parts Inventory</CardTitle>
              <Button size="sm" onClick={() => navigate('/gunsmith/parts/new')}>
                <Plus className="h-4 w-4 mr-1" /> Add Part
              </Button>
            </CardHeader>
            <CardContent>
              {partsLoading ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredParts?.map(part => (
                    <div 
                      key={part.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted"
                      onClick={() => navigate(`/gunsmith/parts/${part.id}`)}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{part.name}</span>
                          {part.part_number && <Badge variant="outline">{part.part_number}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {part.manufacturer} {part.location && `• ${part.location}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={part.quantity <= part.min_quantity ? 'destructive' : 'secondary'}>
                          Qty: {part.quantity}
                        </Badge>
                        {part.retail_price && (
                          <p className="text-sm text-muted-foreground mt-1">${part.retail_price.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movement History</CardTitle>
            </CardHeader>
            <CardContent>
              {movementsLoading ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : movements?.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No stock movements recorded</p>
              ) : (
                <div className="space-y-2">
                  {movements?.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getMovementIcon(m.movement_type)}
                        <div>
                          <span className="font-medium">{m.gunsmith_parts?.name}</span>
                          <p className="text-sm text-muted-foreground">
                            {m.movement_type.replace('_', ' ')} • {m.reason || 'No reason'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={m.quantity_change > 0 ? 'default' : 'destructive'}>
                          {m.quantity_change > 0 ? '+' : ''}{m.quantity_change}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(m.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Serialized Tab */}
        <TabsContent value="serialized">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Barcode className="h-5 w-5" />
                Serialized Items
              </CardTitle>
              <Button size="sm" onClick={() => navigate('/gunsmith/inventory/serialized/new')}>
                <Plus className="h-4 w-4 mr-1" /> Add Serial
              </Button>
            </CardHeader>
            <CardContent>
              {serializedLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : serialized?.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No serialized items tracked</p>
              ) : (
                <div className="space-y-2">
                  {serialized?.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{item.serial_number}</span>
                          <Badge variant="outline">{item.gunsmith_parts?.name}</Badge>
                        </div>
                        {item.customers && (
                          <p className="text-sm text-muted-foreground">
                            Customer: {item.customers.first_name} {item.customers.last_name}
                          </p>
                        )}
                      </div>
                      <Badge variant={item.status === 'in_stock' ? 'default' : 'secondary'}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Purchase Orders</CardTitle>
              <Button size="sm" onClick={() => navigate('/gunsmith/inventory/purchase-orders/new')}>
                <Plus className="h-4 w-4 mr-1" /> New PO
              </Button>
            </CardHeader>
            <CardContent>
              {poLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : purchaseOrders?.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No purchase orders</p>
              ) : (
                <div className="space-y-2">
                  {purchaseOrders?.map(po => (
                    <div 
                      key={po.id} 
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted"
                      onClick={() => navigate(`/gunsmith/inventory/purchase-orders/${po.id}`)}
                    >
                      <div>
                        <span className="font-medium">{po.po_number}</span>
                        <p className="text-sm text-muted-foreground">
                          {po.supplier || 'No supplier'} • {format(new Date(po.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          po.status === 'received' ? 'default' :
                          po.status === 'cancelled' ? 'destructive' : 'secondary'
                        }>
                          {po.status}
                        </Badge>
                        {po.total && <p className="text-sm mt-1">${po.total.toFixed(2)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
