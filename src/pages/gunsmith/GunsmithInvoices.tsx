import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Receipt, 
  Plus, 
  Search,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function GunsmithInvoices() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['gunsmith-invoices'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('gunsmith_invoices')
        .select('*, customers(first_name, last_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const filteredInvoices = invoices?.filter((i: any) => 
    i.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.customers?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.customers?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'sent': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-amber-500';
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
              <Receipt className="h-8 w-8 text-green-500" />
              Invoices
            </h1>
            <p className="text-muted-foreground mt-1">Manage billing and invoices</p>
          </div>
        </div>
        <Button onClick={() => navigate('/gunsmith/invoices/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : filteredInvoices?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No invoices yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInvoices?.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted" onClick={() => navigate(`/gunsmith/invoices/${invoice.id}`)}>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium">{invoice.invoice_number}</span>
                      <Badge className={`${getStatusColor(invoice.status)} text-white`}>{invoice.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {invoice.customers?.first_name} {invoice.customers?.last_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${invoice.total?.toFixed(2)}</p>
                    {invoice.balance_due > 0 && (
                      <p className="text-sm text-red-500">Due: ${invoice.balance_due?.toFixed(2)}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{format(new Date(invoice.issue_date), 'MMM d, yyyy')}</p>
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
