import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt, CreditCard, Banknote, BookOpen } from 'lucide-react';

const metricCards = [
  { key: 'ap_open', title: 'Open Vendor Bills', icon: Receipt },
  { key: 'ar_open', title: 'Open AR Invoices', icon: CreditCard },
  { key: 'bank_accounts', title: 'Active Bank Accounts', icon: Banknote },
  { key: 'journal_entries', title: 'Journal Entries', icon: BookOpen },
];

export default function FinanceDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['finance-dashboard-metrics'],
    queryFn: async () => {
      const [
        { count: apOpen },
        { count: arOpen },
        { count: bankAccounts },
        { count: journalEntries },
      ] = await Promise.all([
        supabase.from('vendor_bills' as any).select('*', { count: 'exact', head: true }).in('status', ['draft', 'approved', 'overdue']),
        supabase.from('ar_invoices' as any).select('*', { count: 'exact', head: true }).in('status', ['draft', 'sent', 'partial', 'overdue']),
        supabase.from('bank_accounts' as any).select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true }),
      ]);

      return {
        apOpen: apOpen || 0,
        arOpen: arOpen || 0,
        bankAccounts: bankAccounts || 0,
        journalEntries: journalEntries || 0,
      };
    },
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor accounts payable, receivable, and cash operations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          const value = data ? (metric.key === 'ap_open' ? data.apOpen
            : metric.key === 'ar_open' ? data.arOpen
            : metric.key === 'bank_accounts' ? data.bankAccounts
            : data.journalEntries) : 0;

          return (
            <Card key={metric.key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? '—' : value}</div>
                <Badge variant="outline" className="mt-2">
                  Last 30 days
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Focus Areas</CardTitle>
          <CardDescription>Recommended priorities for your finance team.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 text-sm text-muted-foreground">
          <div>Close aging vendor bills and confirm approvals.</div>
          <div>Review overdue receivables and send reminders.</div>
          <div>Match bank transactions to journal entries.</div>
        </CardContent>
      </Card>
    </div>
  );
}
