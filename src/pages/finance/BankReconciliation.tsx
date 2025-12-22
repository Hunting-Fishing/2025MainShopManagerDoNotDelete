import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Banknote } from 'lucide-react';

export default function BankReconciliation() {
  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts' as any)
        .select('id,name,institution,account_type,current_balance,is_active')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  const { data: reconciliations = [], isLoading: recLoading } = useQuery({
    queryKey: ['bank-reconciliations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_reconciliations' as any)
        .select('id,period_start,period_end,statement_balance,reconciled_balance,status,bank_account_id')
        .order('period_end', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Banknote className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Reconciliation</h1>
          <p className="text-muted-foreground">
            Track bank account balances and reconciliation periods.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bank Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {accountsLoading ? (
            <div className="text-sm text-muted-foreground">Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No bank accounts have been configured.
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {accounts.map((account: any) => (
                <div key={account.id} className="border rounded-lg p-3">
                  <div className="font-medium">{account.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {account.institution || 'Institution not set'} · {account.account_type || 'type not set'}
                  </div>
                  <div className="mt-2 text-sm font-semibold">
                    ${Number(account.current_balance || 0).toFixed(2)}
                  </div>
                  <Badge variant={account.is_active ? 'default' : 'secondary'} className="mt-2">
                    {account.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Periods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recLoading ? (
            <div className="text-sm text-muted-foreground">Loading reconciliations...</div>
          ) : reconciliations.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No reconciliation periods have been created yet.
            </div>
          ) : (
            <div className="space-y-2">
              {reconciliations.map((rec: any) => (
                <div key={rec.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="font-medium">
                      {rec.period_start} → {rec.period_end}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Statement ${Number(rec.statement_balance || 0).toFixed(2)} · Reconciled ${Number(rec.reconciled_balance || 0).toFixed(2)}
                    </div>
                  </div>
                  <Badge variant="outline">{rec.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
