import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Phone, Mail, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShopId } from '@/hooks/useShopId';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function SepticStaff() {
  const navigate = useNavigate();
  const { shopId } = useShopId();

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['septic-staff', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase.from('septic_drivers').select('*').eq('shop_id', shopId).order('last_name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!shopId,
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Staff</h1>
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : drivers.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><p className="text-muted-foreground">No staff members. Add drivers to see them here.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {drivers.map((d: any) => (
            <Card key={d.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/septic/drivers/${d.id}`)}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{d.first_name} {d.last_name}</span>
                    <Badge className={d.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800'}>{d.status}</Badge>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {d.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{d.phone}</span>}
                    {d.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{d.email}</span>}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
