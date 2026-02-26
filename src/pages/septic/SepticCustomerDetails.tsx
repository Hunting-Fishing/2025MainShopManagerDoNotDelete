import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, Mail, MapPin, Loader2, Container, ClipboardList, Calendar } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useShopId } from '@/hooks/useShopId';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function SepticCustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { shopId } = useShopId();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['septic-customer', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: tanks = [] } = useQuery({
    queryKey: ['septic-customer-tanks', id, shopId],
    queryFn: async () => {
      if (!id || !shopId) return [];
      const { data, error } = await supabase
        .from('septic_tanks')
        .select('*')
        .eq('shop_id', shopId)
        .eq('customer_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!id && !!shopId,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['septic-customer-orders', id, shopId],
    queryFn: async () => {
      if (!id || !shopId) return [];
      const { data, error } = await supabase
        .from('septic_service_orders')
        .select('id, order_number, service_type, status, scheduled_date, total')
        .eq('shop_id', shopId)
        .eq('customer_id', id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!id && !!shopId,
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!customer) return <div className="p-6"><p className="text-muted-foreground">Customer not found</p></div>;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/septic/customers')}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-2xl font-bold">{customer.first_name} {customer.last_name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle className="text-base">Contact Info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {customer.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{customer.phone}</div>}
            {customer.email && <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />{customer.email}</div>}
            {customer.address && <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" />{customer.address}</div>}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Container className="h-4 w-4" />Septic Systems ({tanks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {tanks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tanks on file for this customer.</p>
            ) : (
              <div className="space-y-3">
                {tanks.map((t: any) => (
                  <div key={t.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{t.tank_type || 'Tank'}</span>
                      <Badge variant="outline">{t.tank_size_gallons ? `${t.tank_size_gallons} gal` : 'Unknown'}</Badge>
                    </div>
                    {t.location_address && <p className="text-xs text-muted-foreground mt-1">{t.location_address}</p>}
                    {t.install_date && <p className="text-xs text-muted-foreground">Installed: {format(new Date(t.install_date), 'MMM d, yyyy')}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4" />Service Orders</CardTitle></CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No service orders yet.</p>
          ) : (
            <div className="space-y-2">
              {orders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/septic/orders/${o.id}`)}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{o.order_number || 'Draft'}</span>
                      <Badge variant="secondary" className={statusColors[o.status] || ''}>{o.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{o.service_type?.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {o.scheduled_date && <p>{format(new Date(o.scheduled_date), 'MMM d, yyyy')}</p>}
                    {o.total != null && Number(o.total) > 0 && <p className="font-medium">${Number(o.total).toFixed(2)}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
