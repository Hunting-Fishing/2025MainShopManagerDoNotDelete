import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

export default function GeneralLedger() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['general-ledger-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('id,account_code,account_name,account_type,is_active')
        .order('account_code', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Ledger</h1>
          <p className="text-muted-foreground">
            Review your chart of accounts and ledger configuration.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chart of Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading accounts...</div>
          ) : data.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No accounts found. Add accounts to build your ledger.
            </div>
          ) : (
            <div className="space-y-2">
              {data.map((account: any) => (
                <div key={account.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="font-medium">{account.account_code} · {account.account_name}</div>
                    <div className="text-xs text-muted-foreground">{account.account_type}</div>
                  </div>
                  <Badge variant={account.is_active ? 'default' : 'secondary'}>
                    {account.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
