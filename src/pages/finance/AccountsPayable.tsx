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
import { Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { useShopId } from '@/hooks/useShopId';
import { useAuthUser } from '@/hooks/useAuthUser';

export default function AccountsPayable() {
  const queryClient = useQueryClient();
  const { shopId } = useShopId();
  const { userId } = useAuthUser();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    bill_number: '',
    bill_date: '',
    due_date: '',
    total_amount: '',
    status: 'draft'
  });

  const { data = [], isLoading } = useQuery({
    queryKey: ['accounts-payable-bills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_bills' as any)
        .select('id,bill_number,status,bill_date,due_date,total_amount,balance_due,supplier:suppliers(name)')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  const handleCreateBill = async () => {
    if (!shopId) {
      toast.error('Missing shop context.');
      return;
    }

    if (!form.bill_number.trim() || !form.bill_date) {
      toast.error('Bill number and bill date are required.');
      return;
    }

    const totalAmount = Number(form.total_amount || 0);

    const { error } = await supabase
      .from('vendor_bills' as any)
      .insert({
        shop_id: shopId,
        bill_number: form.bill_number.trim(),
        status: form.status,
        bill_date: form.bill_date,
        due_date: form.due_date || null,
        total_amount: totalAmount,
        balance_due: totalAmount,
        created_by: userId || null
      });

    if (error) {
      console.error('Failed to create vendor bill:', error);
      toast.error('Failed to create vendor bill.');
      return;
    }

    setForm({
      bill_number: '',
      bill_date: '',
      due_date: '',
      total_amount: '',
      status: 'draft'
    });
    setIsCreateOpen(false);
    queryClient.invalidateQueries({ queryKey: ['accounts-payable-bills'] });
    toast.success('Vendor bill created.');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accounts Payable</h1>
            <p className="text-muted-foreground">
              Track vendor bills, approvals, and upcoming payments.
            </p>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>New Bill</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Vendor Bill</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bill-number">Bill Number</Label>
                <Input
                  id="bill-number"
                  value={form.bill_number}
                  onChange={(event) => setForm({ ...form, bill_number: event.target.value })}
                  placeholder="VB-10025"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bill-date">Bill Date</Label>
                <Input
                  id="bill-date"
                  type="date"
                  value={form.bill_date}
                  onChange={(event) => setForm({ ...form, bill_date: event.target.value })}
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
                  value={form.total_amount}
                  onChange={(event) => setForm({ ...form, total_amount: event.target.value })}
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
                    <SelectItem value="approved">Approved</SelectItem>
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
              <Button onClick={handleCreateBill}>Create Bill</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Bills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading vendor bills...</div>
          ) : data.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No vendor bills have been created yet.
            </div>
          ) : (
            <div className="space-y-2">
              {data.map((bill: any) => (
                <div key={bill.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="font-medium">{bill.bill_number}</div>
                    <div className="text-xs text-muted-foreground">
                      {bill.supplier?.name || 'Unassigned vendor'} - Due {bill.due_date || 'TBD'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${Number(bill.balance_due || 0).toFixed(2)}</div>
                    <Badge variant="outline">{bill.status}</Badge>
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
