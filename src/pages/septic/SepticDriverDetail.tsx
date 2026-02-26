import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, Mail, MapPin, Loader2, Calendar } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useShopId } from '@/hooks/useShopId';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function SepticDriverDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { shopId } = useShopId();

  const { data: driver, isLoading } = useQuery({
    queryKey: ['septic-driver', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('septic_drivers').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: completions = [] } = useQuery({
    queryKey: ['septic-driver-completions', id, shopId],
    queryFn: async () => {
      if (!id || !shopId) return [];
      const { data, error } = await supabase
        .from('septic_completions')
        .select('id, completion_date, gallons_pumped, waste_type, total_cost')
        .eq('shop_id', shopId)
        .eq('driver_id', id)
        .order('completion_date', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!id && !!shopId,
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!driver) return <div className="p-6"><p className="text-muted-foreground">Driver not found</p></div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/septic/drivers')}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-2xl font-bold">{driver.first_name} {driver.last_name}</h1>
        <Badge className={driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{driver.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {driver.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{driver.phone}</div>}
            {driver.email && <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />{driver.email}</div>}
            {driver.home_address && <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" />{driver.home_address}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Credentials</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {driver.cdl_number && <div className="flex justify-between"><span className="text-muted-foreground">CDL</span><span>{driver.cdl_number} ({driver.cdl_class || '—'})</span></div>}
            {driver.cdl_expiry && <div className="flex justify-between"><span className="text-muted-foreground">CDL Expiry</span><span>{format(new Date(driver.cdl_expiry), 'MMM d, yyyy')}</span></div>}
            {driver.tanker_endorsement != null && <div className="flex justify-between"><span className="text-muted-foreground">Tanker</span><Badge variant={driver.tanker_endorsement ? 'default' : 'outline'}>{driver.tanker_endorsement ? 'Yes' : 'No'}</Badge></div>}
            {driver.medical_card_expiry && <div className="flex justify-between"><span className="text-muted-foreground">Medical Card</span><span>{format(new Date(driver.medical_card_expiry), 'MMM d, yyyy')}</span></div>}
            {driver.hourly_rate && <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span>${Number(driver.hourly_rate).toFixed(2)}/hr</span></div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Completions ({completions.length})</CardTitle></CardHeader>
        <CardContent>
          {completions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed jobs yet.</p>
          ) : (
            <div className="space-y-2">
              {completions.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{c.waste_type || 'Pump-out'}</p>
                    {c.completion_date && <p className="text-xs text-muted-foreground">{format(new Date(c.completion_date), 'MMM d, yyyy')}</p>}
                  </div>
                  <div className="text-right text-sm">
                    {c.gallons_pumped && <p>{c.gallons_pumped} gal</p>}
                    {c.total_cost && <p className="text-muted-foreground">${Number(c.total_cost).toFixed(2)}</p>}
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
