import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useShopId } from '@/hooks/useShopId';
import { Loader2, ClipboardList, Ship, Package, Car, Users, DollarSign, Globe, Warehouse } from 'lucide-react';

export default function ExportDashboard() {
  const { shopId, loading: shopLoading } = useShopId();
  const [stats, setStats] = useState({ orders: 0, shipments: 0, customers: 0, vehicles: 0, products: 0, invoices: 0, warehouses: 0 });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!shopId) return;
    async function fetchStats() {
      setLoading(true);
      const [ordersR, shipmentsR, customersR, vehiclesR, productsR, invoicesR, warehousesR, recentR] = await Promise.all([
        supabase.from('export_orders').select('id', { count: 'exact', head: true }).eq('shop_id', shopId),
        supabase.from('export_shipments').select('id', { count: 'exact', head: true }).eq('shop_id', shopId),
        supabase.from('export_customers').select('id', { count: 'exact', head: true }).eq('shop_id', shopId),
        supabase.from('export_vehicles').select('id', { count: 'exact', head: true }).eq('shop_id', shopId),
        supabase.from('export_products').select('id', { count: 'exact', head: true }).eq('shop_id', shopId),
        supabase.from('export_invoices').select('id', { count: 'exact', head: true }).eq('shop_id', shopId),
        supabase.from('export_warehouses').select('id', { count: 'exact', head: true }).eq('shop_id', shopId),
        supabase.from('export_orders').select('*').eq('shop_id', shopId).order('created_at', { ascending: false }).limit(5),
      ]);
      setStats({
        orders: ordersR.count || 0,
        shipments: shipmentsR.count || 0,
        customers: customersR.count || 0,
        vehicles: vehiclesR.count || 0,
        products: productsR.count || 0,
        invoices: invoicesR.count || 0,
        warehouses: warehousesR.count || 0,
      });
      setRecentOrders(recentR.data || []);
      setLoading(false);
    }
    fetchStats();
  }, [shopId]);

  if (shopLoading || loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const kpis = [
    { title: 'Active Orders', value: stats.orders, icon: ClipboardList, color: 'text-blue-500' },
    { title: 'Shipments', value: stats.shipments, icon: Ship, color: 'text-indigo-500' },
    { title: 'Customers', value: stats.customers, icon: Users, color: 'text-sky-500' },
    { title: 'Vehicles', value: stats.vehicles, icon: Car, color: 'text-red-500' },
    { title: 'Products', value: stats.products, icon: Package, color: 'text-amber-500' },
    { title: 'Invoices', value: stats.invoices, icon: DollarSign, color: 'text-emerald-500' },
    { title: 'Warehouses', value: stats.warehouses, icon: Warehouse, color: 'text-violet-500' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
          <Globe className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Export Dashboard</h1>
          <p className="text-sm text-muted-foreground">Dehydrated Foods, Salt & Vehicle Exports</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-4 text-center">
              <kpi.icon className={`h-6 w-6 mx-auto mb-2 ${kpi.color}`} />
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet. Create your first export order.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{order.destination_country} • {order.incoterms}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'confirmed' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
