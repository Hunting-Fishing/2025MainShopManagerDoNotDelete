import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Container, Calendar, DollarSign, Truck, AlertTriangle, Plus, ClipboardList, Users, MapPin, Package, Receipt, Route, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShopId } from '@/hooks/useShopId';
import { useModuleDisplayInfo } from '@/hooks/useModuleDisplayInfo';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function SepticDashboard() {
  const navigate = useNavigate();
  const { shopId } = useShopId();
  const { data: moduleInfo } = useModuleDisplayInfo(shopId, 'septic');

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['septic-dashboard-stats', shopId],
    queryFn: async () => {
      if (!shopId) return { customers: 0, orders: 0, tanks: 0 };
      const [customersRes, ordersRes] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('shop_id', shopId),
        supabase.from('water_delivery_orders').select('id', { count: 'exact', head: true }).eq('shop_id', shopId),
      ]);
      return {
        customers: customersRes.count || 0,
        orders: ordersRes.count || 0,
        tanks: 0,
      };
    },
    enabled: !!shopId,
  });

  const quickActions = [
    { title: 'New Service Order', icon: Plus, href: '/septic/orders/new', color: 'from-stone-500 to-stone-700' },
    { title: 'View Routes', icon: Route, href: '/septic/routes', color: 'from-emerald-500 to-teal-600' },
    { title: 'Customers', icon: Users, href: '/septic/customers', color: 'from-blue-500 to-cyan-600' },
    { title: 'Inspections', icon: Shield, href: '/septic/inspections', color: 'from-green-600 to-emerald-700' },
  ];

  const statCards = [
    { title: 'Total Customers', value: stats?.customers || 0, icon: Users, color: 'text-blue-500' },
    { title: 'Service Orders', value: stats?.orders || 0, icon: ClipboardList, color: 'text-stone-500' },
    { title: 'Septic Systems', value: stats?.tanks || 0, icon: Container, color: 'text-emerald-500' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {moduleInfo?.displayName || 'Septic Services'}
          </h1>
          <p className="text-muted-foreground mt-1">Manage pumping, inspections, and tank maintenance</p>
        </div>
        <Button onClick={() => navigate('/septic/orders/new')} className="bg-gradient-to-r from-stone-600 to-stone-800 hover:from-stone-700 hover:to-stone-900">
          <Plus className="h-4 w-4 mr-2" />
          New Service Order
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-xl bg-muted">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto flex-col gap-2 p-4"
              onClick={() => navigate(action.href)}
            >
              <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium">{action.title}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Upcoming Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Septic-Specific Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { title: 'Pump-Out Scheduling', desc: 'Automated recurring pump-out reminders based on tank size and usage' },
              { title: 'System Inspections', desc: 'EPA/county compliance inspection forms with photo documentation' },
              { title: 'Drain Field Monitoring', desc: 'Track drain field health, soil absorption rates, and repair history' },
              { title: 'Disposal Tracking', desc: 'Log disposal sites, manifests, and volume records for compliance' },
            ].map((feature) => (
              <div key={feature.title} className="p-3 rounded-lg bg-muted/50 border">
                <p className="font-medium text-sm">{feature.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
