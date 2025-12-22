import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useShopId } from '@/hooks/useShopId';
import { useAuthUser } from '@/hooks/useAuthUser';

export default function AccountsReceivable() {
  const queryClient = useQueryClient();
  const { shopId } = useShopId();
  const { userId } = useAuthUser();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    invoice_number: '',
    issue_date: '',
    due_date: '',
    total: '',
    status: 'draft'
  });

  const { data = [], isLoading } = useQuery({
    queryKey: ['accounts-receivable-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ar_invoices' as any)
        .select('id,invoice_number,status,issue_date,due_date,total,balance_due,customer:customers(first_name,last_name)')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  const handleCreateInvoice = async () => {
    if (!shopId) {
      toast.error('Missing shop context.');
      return;
    }

    if (!form.invoice_number.trim() || !form.issue_date) {
      toast.error('Invoice number and issue date are required.');
      return;
    }

    const totalAmount = Number(form.total || 0);

    const { error } = await supabase
      .from('ar_invoices' as any)
      .insert({
        shop_id: shopId,
        invoice_number: form.invoice_number.trim(),
        status: form.status,
        issue_date: form.issue_date,
        due_date: form.due_date || null,
        total: totalAmount,
        balance_due: totalAmount,
        created_by: userId || null
      });

    if (error) {
      console.error('Failed to create AR invoice:', error);
      toast.error('Failed to create AR invoice.');
      return;
    }

    setForm({
      invoice_number: '',
      issue_date: '',
      due_date: '',
      total: '',
      status: 'draft'
    });
    setIsCreateOpen(false);
    queryClient.invalidateQueries({ queryKey: ['accounts-receivable-invoices'] });
    toast.success('AR invoice created.');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accounts Receivable</h1>
            <p className="text-muted-foreground">
              Monitor customer invoices, balances, and collections.
            </p>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>New Invoice</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create AR Invoice</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="invoice-number">Invoice Number</Label>
                <Input
                  id="invoice-number"
                  value={form.invoice_number}
                  onChange={(event) => setForm({ ...form, invoice_number: event.target.value })}
                  placeholder="AR-10045"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="issue-date">Issue Date</Label>
                <Input
                  id="issue-date"
                  type="date"
                  value={form.issue_date}
                  onChange={(event) => setForm({ ...form, issue_date: event.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={form.due_date}
                  onChange={(event) => setForm({ ...form, due_date: event.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="total-amount">Total Amount</Label>
                <Input
                  id="total-amount"
                  type="number"
                  step="0.01"
                  value={form.total}
                  onChange={(event) => setForm({ ...form, total: event.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm({ ...form, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="void">Void</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateInvoice}>Create Invoice</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Invoices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading invoices...</div>
          ) : data.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No AR invoices found yet.
            </div>
          ) : (
            <div className="space-y-2">
              {data.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="font-medium">{invoice.invoice_number}</div>
                    <div className="text-xs text-muted-foreground">
                      {invoice.customer ? `${invoice.customer.first_name} ${invoice.customer.last_name}` : 'Unassigned customer'}
                      {' - '}Due {invoice.due_date || 'TBD'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${Number(invoice.balance_due || 0).toFixed(2)}</div>
                    <Badge variant="outline">{invoice.status}</Badge>
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
