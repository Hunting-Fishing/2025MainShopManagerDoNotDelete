import React, { useEffect, useState } from 'react';
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
import { PackageCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useShopId } from '@/hooks/useShopId';
import { useAuthUser } from '@/hooks/useAuthUser';

type ReceiptLineDraft = {
  purchase_order_item_id: string;
  product_id: string;
  ordered_quantity: number;
  received_quantity: number;
  quantity_received: number;
  quantity_accepted: number;
  quantity_rejected: number;
};

type ReceiptLineEdit = {
  id: string;
  purchase_order_item_id: string;
  product_id: string;
  ordered_quantity: number;
  received_quantity: number;
  quantity_received: number;
  quantity_accepted: number;
  quantity_rejected: number;
};

export default function Receiving() {
  const queryClient = useQueryClient();
  const { shopId } = useShopId();
  const { userId } = useAuthUser();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    receipt_number: '',
    status: 'received'
  });
  const [editLines, setEditLines] = useState<ReceiptLineEdit[]>([]);
  const [form, setForm] = useState({
    receipt_number: '',
    status: 'received',
    purchase_order_id: ''
  });
  const [lineItems, setLineItems] = useState<ReceiptLineDraft[]>([]);

  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ['procurement-receipts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receipts' as any)
        .select('id,receipt_number,status,received_at,purchase_order_id,purchase_order:purchase_orders(po_number)')
        .order('received_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ['procurement-purchase-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders' as any)
        .select('id,po_number,order_date')
        .order('order_date', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const { data: poItems = [] } = useQuery({
    queryKey: ['procurement-purchase-order-items', form.purchase_order_id],
    enabled: !!form.purchase_order_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_order_items' as any)
        .select('id,product_id,quantity,received_quantity')
        .eq('purchase_order_id', form.purchase_order_id);

      if (error) throw error;
      return data || [];
    }
  });

  const { data: receiptLines = [] } = useQuery({
    queryKey: ['procurement-receipt-lines', selectedReceipt?.id],
    enabled: !!selectedReceipt?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receipt_lines' as any)
        .select('id,purchase_order_item_id,quantity_received,quantity_accepted,quantity_rejected,purchase_order_item:purchase_order_items(product_id,quantity,received_quantity)')
        .eq('receipt_id', selectedReceipt.id);

      if (error) throw error;
      return data || [];
    }
  });

  useEffect(() => {
    if (!form.purchase_order_id) {
      setLineItems([]);
      return;
    }

    setLineItems(
      poItems.map((item: any) => ({
        purchase_order_item_id: item.id,
        product_id: item.product_id,
        ordered_quantity: Number(item.quantity || 0),
        received_quantity: Number(item.received_quantity || 0),
        quantity_received: 0,
        quantity_accepted: 0,
        quantity_rejected: 0
      }))
    );
  }, [form.purchase_order_id, poItems]);

  useEffect(() => {
    if (!selectedReceipt) return;
    setEditForm({
      receipt_number: selectedReceipt.receipt_number || '',
      status: selectedReceipt.status || 'received'
    });
  }, [selectedReceipt]);

  useEffect(() => {
    if (!selectedReceipt) return;
    setEditLines(
      receiptLines.map((line: any) => ({
        id: line.id,
        purchase_order_item_id: line.purchase_order_item_id,
        product_id: line.purchase_order_item?.product_id || 'Item',
        ordered_quantity: Number(line.purchase_order_item?.quantity || 0),
        received_quantity: Number(line.purchase_order_item?.received_quantity || 0),
        quantity_received: Number(line.quantity_received || 0),
        quantity_accepted: Number(line.quantity_accepted || 0),
        quantity_rejected: Number(line.quantity_rejected || 0)
      }))
    );
  }, [receiptLines, selectedReceipt]);

  const handleLineItemChange = (
    itemId: string,
    field: keyof ReceiptLineDraft,
    value: number
  ) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.purchase_order_item_id !== itemId) {
          return item;
        }
        const next = { ...item, [field]: value };
        if (field === 'quantity_received' && item.quantity_accepted === 0 && item.quantity_rejected === 0) {
          next.quantity_accepted = value;
        }
        return next;
      })
    );
  };

  const resetCreateForm = () => {
    setForm({ receipt_number: '', status: 'received', purchase_order_id: '' });
    setLineItems([]);
  };

  const handleCreateReceipt = async () => {
    if (!shopId) {
      toast.error('Missing shop context.');
      return;
    }

    if (!form.receipt_number.trim()) {
      toast.error('Receipt number is required.');
      return;
    }

    if (form.purchase_order_id) {
      const invalidLine = lineItems.find((item) => {
        const received = Number(item.quantity_received || 0);
        const accepted = Number(item.quantity_accepted || 0);
        const rejected = Number(item.quantity_rejected || 0);
        const remaining = Math.max(0, Number(item.ordered_quantity) - Number(item.received_quantity));
        if (Number.isNaN(received) || Number.isNaN(accepted) || Number.isNaN(rejected)) {
          return true;
        }
        if (received <= 0 && (accepted > 0 || rejected > 0)) {
          return true;
        }
        if (received > remaining) {
          return true;
        }
        if (accepted + rejected > received) {
          return true;
        }
        return false;
      });

      if (invalidLine) {
        toast.error('Line item quantities must be valid, within remaining, and accepted + rejected cannot exceed received.');
        return;
      }

      const hasAnyQuantities = lineItems.some(
        (item) =>
          Number(item.quantity_received || 0) > 0 ||
          Number(item.quantity_accepted || 0) > 0 ||
          Number(item.quantity_rejected || 0) > 0
      );
      if (!hasAnyQuantities) {
        toast.error('Enter at least one line item quantity for the linked PO.');
        return;
      }
    }

    const { data: receipt, error } = await supabase
      .from('receipts' as any)
      .insert({
        shop_id: shopId,
        receipt_number: form.receipt_number.trim(),
        status: form.status,
        purchase_order_id: form.purchase_order_id || null,
        received_at: new Date().toISOString(),
        created_by: userId || null
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create receipt:', error);
      toast.error('Failed to create receipt.');
      return;
    }

    const lineItemsToInsert = lineItems
      .filter(
        (item) =>
          item.quantity_received > 0 ||
          item.quantity_accepted > 0 ||
          item.quantity_rejected > 0
      )
      .map((item) => ({
        receipt_id: receipt.id,
        purchase_order_item_id: item.purchase_order_item_id,
        quantity_received: item.quantity_received,
        quantity_accepted: item.quantity_accepted,
        quantity_rejected: item.quantity_rejected
      }));

    if (lineItemsToInsert.length > 0) {
      const { error: lineError } = await supabase
        .from('receipt_lines' as any)
        .insert(lineItemsToInsert);

      if (lineError) {
        console.error('Failed to create receipt lines:', lineError);
        toast.error('Receipt created, but line items failed.');
      }
    }

    if (form.purchase_order_id && lineItemsToInsert.length > 0) {
      const receivedByItem = new Map<string, number>();
      lineItemsToInsert.forEach((line) => {
        const current = receivedByItem.get(line.purchase_order_item_id) || 0;
        receivedByItem.set(line.purchase_order_item_id, current + Number(line.quantity_received || 0));
      });

      const updates = poItems
        .filter((item: any) => receivedByItem.has(item.id))
        .map((item: any) => {
          const increment = receivedByItem.get(item.id) || 0;
          const currentReceived = Number(item.received_quantity || 0);
          const ordered = Number(item.quantity || 0);
          const nextReceived = Math.min(ordered, currentReceived + increment);
          return { id: item.id, received_quantity: nextReceived, ordered };
        });

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('purchase_order_items' as any)
          .update({ received_quantity: update.received_quantity })
          .eq('id', update.id);

        if (updateError) {
          console.error('Failed to update purchase order item:', updateError);
          toast.error('Receipt created, but PO item updates failed.');
          break;
        }
      }

      await updatePurchaseOrderStatus(form.purchase_order_id);
    }

    resetCreateForm();
    setIsCreateOpen(false);
    queryClient.invalidateQueries({ queryKey: ['procurement-receipts'] });
    toast.success('Receipt created.');
  };

  const handleUpdateReceipt = async () => {
    if (!selectedReceipt) return;
    if (!editForm.receipt_number.trim()) {
      toast.error('Receipt number is required.');
      return;
    }

    const { error } = await supabase
      .from('receipts' as any)
      .update({
        receipt_number: editForm.receipt_number.trim(),
        status: editForm.status
      })
      .eq('id', selectedReceipt.id);

    if (error) {
      console.error('Failed to update receipt:', error);
      toast.error('Failed to update receipt.');
      return;
    }

    toast.success('Receipt updated.');
    queryClient.invalidateQueries({ queryKey: ['procurement-receipts'] });
    setSelectedReceipt({ ...selectedReceipt, ...editForm });
  };

  const handleEditLineChange = (
    lineId: string,
    field: keyof ReceiptLineEdit,
    value: number
  ) => {
    setEditLines((prev) =>
      prev.map((line) => {
        if (line.id !== lineId) {
          return line;
        }
        const next = { ...line, [field]: value };
        if (field === 'quantity_received' && line.quantity_accepted === 0 && line.quantity_rejected === 0) {
          next.quantity_accepted = value;
        }
        return next;
      })
    );
  };

  const handleSaveReceiptLines = async () => {
    if (!selectedReceipt) return;

    const invalidLine = editLines.find((line) => {
      const received = Number(line.quantity_received || 0);
      const accepted = Number(line.quantity_accepted || 0);
      const rejected = Number(line.quantity_rejected || 0);
      if (Number.isNaN(received) || Number.isNaN(accepted) || Number.isNaN(rejected)) {
        return true;
      }
      if (received < 0 || accepted < 0 || rejected < 0) {
        return true;
      }
      if (accepted + rejected > received) {
        return true;
      }
      return false;
    });

    if (invalidLine) {
      toast.error('Receipt line quantities must be valid and accepted + rejected cannot exceed received.');
      return;
    }

    for (const line of editLines) {
      const original = receiptLines.find((item: any) => item.id === line.id);
      const originalReceived = Number(original?.quantity_received || 0);
      const delta = Number(line.quantity_received || 0) - originalReceived;

      const { error: lineError } = await supabase
        .from('receipt_lines' as any)
        .update({
          quantity_received: line.quantity_received,
          quantity_accepted: line.quantity_accepted,
          quantity_rejected: line.quantity_rejected
        })
        .eq('id', line.id);

      if (lineError) {
        console.error('Failed to update receipt line:', lineError);
        toast.error('Failed to update receipt lines.');
        return;
      }

      if (line.purchase_order_item_id) {
        const ordered = Number(line.ordered_quantity || 0);
        const currentReceived = Number(line.received_quantity || 0);
        const nextReceived = Math.min(Math.max(currentReceived + delta, 0), ordered);
        const { error: poItemError } = await supabase
          .from('purchase_order_items' as any)
          .update({ received_quantity: nextReceived })
          .eq('id', line.purchase_order_item_id);

        if (poItemError) {
          console.error('Failed to update PO item received quantity:', poItemError);
          toast.error('Receipt lines saved, but PO item updates failed.');
        } else {
          line.received_quantity = nextReceived;
        }
      }
    }

    toast.success('Receipt lines updated.');
    queryClient.invalidateQueries({ queryKey: ['procurement-receipt-lines', selectedReceipt.id] });
    queryClient.invalidateQueries({ queryKey: ['procurement-receipts'] });
    if (selectedReceipt.purchase_order_id) {
      await updatePurchaseOrderStatus(selectedReceipt.purchase_order_id);
    }
  };

  const updatePurchaseOrderStatus = async (purchaseOrderId: string) => {
    const { data: poItems, error: itemsError } = await supabase
      .from('purchase_order_items' as any)
      .select('quantity,received_quantity')
      .eq('purchase_order_id', purchaseOrderId);

    if (itemsError) {
      console.error('Failed to load PO items for status update:', itemsError);
      return;
    }

    const { data: poData, error: poError } = await supabase
      .from('purchase_orders' as any)
      .select('status')
      .eq('id', purchaseOrderId)
      .single();

    if (poError) {
      console.error('Failed to load PO status:', poError);
      return;
    }

    if (poData?.status === 'cancelled') {
      return;
    }

    const anyReceived = (poItems || []).some(
      (item: any) => Number(item.received_quantity || 0) > 0
    );
    const allFullyReceived = (poItems || []).length > 0
      ? (poItems || []).every((item: any) => Number(item.received_quantity || 0) >= Number(item.quantity || 0))
      : false;

    if (allFullyReceived) {
      await supabase
        .from('purchase_orders' as any)
        .update({ status: 'received' })
        .eq('id', purchaseOrderId);
    } else if (anyReceived) {
      await supabase
        .from('purchase_orders' as any)
        .update({ status: 'confirmed' })
        .eq('id', purchaseOrderId);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <PackageCheck className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Receiving</h1>
            <p className="text-muted-foreground">
              Track purchase order receipts and discrepancies.
            </p>
          </div>
        </div>
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              resetCreateForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>New Receipt</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Receipt</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="receipt-number">Receipt Number</Label>
                <Input
                  id="receipt-number"
                  value={form.receipt_number}
                  onChange={(event) => setForm({ ...form, receipt_number: event.target.value })}
                  placeholder="RCV-10012"
                />
              </div>
              <div className="grid gap-2">
                <Label>Purchase Order</Label>
                <Select
                  value={form.purchase_order_id}
                  onValueChange={(value) => setForm({ ...form, purchase_order_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Link a purchase order (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {purchaseOrders.map((po: any) => (
                      <SelectItem key={po.id} value={po.id}>
                        {po.po_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="reconciled">Reconciled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.purchase_order_id && (
                <div className="space-y-2 border rounded-lg p-3">
                  <div className="text-sm font-medium">Receipt Line Items</div>
                  {poItems.length === 0 ? (
                    <div className="text-xs text-muted-foreground">No items found for this PO.</div>
                  ) : (
                    <div className="space-y-3">
                      {lineItems.map((item) => {
                        const remaining = Math.max(0, item.ordered_quantity - item.received_quantity);
                        return (
                        <div key={item.purchase_order_item_id} className="grid gap-2 md:grid-cols-4">
                          <div className="md:col-span-1">
                            <Label className="text-xs text-muted-foreground">Product</Label>
                            <div className="text-sm font-medium">{item.product_id}</div>
                            <div className="text-xs text-muted-foreground">
                              Remaining {remaining}
                            </div>
                          </div>
                          <div className="grid gap-1">
                            <Label className="text-xs text-muted-foreground">Received</Label>
                            <Input
                              type="number"
                              min="0"
                              max={remaining}
                              value={item.quantity_received}
                              onChange={(event) =>
                                handleLineItemChange(
                                  item.purchase_order_item_id,
                                  'quantity_received',
                                  Number(event.target.value)
                                )
                              }
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label className="text-xs text-muted-foreground">Accepted</Label>
                            <Input
                              type="number"
                              min="0"
                              value={item.quantity_accepted}
                              onChange={(event) =>
                                handleLineItemChange(
                                  item.purchase_order_item_id,
                                  'quantity_accepted',
                                  Number(event.target.value)
                                )
                              }
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label className="text-xs text-muted-foreground">Rejected</Label>
                            <Input
                              type="number"
                              min="0"
                              value={item.quantity_rejected}
                              onChange={(event) =>
                                handleLineItemChange(
                                  item.purchase_order_item_id,
                                  'quantity_rejected',
                                  Number(event.target.value)
                                )
                              }
                            />
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReceipt}>Create Receipt</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receipts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading receipts...</div>
          ) : receipts.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No receipts recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {receipts.map((receipt: any) => (
                <button
                  key={receipt.id}
                  className="w-full text-left"
                  onClick={() => setSelectedReceipt(receipt)}
                  type="button"
                >
                  <div className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="font-medium">{receipt.receipt_number}</div>
                      <div className="text-xs text-muted-foreground">
                        Received {receipt.received_at ? new Date(receipt.received_at).toLocaleDateString() : 'Unknown'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        PO {receipt.purchase_order?.po_number || 'Not linked'}
                      </div>
                    </div>
                    <Badge variant="outline">{receipt.status}</Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receipt Details</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="grid gap-4 text-sm">
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <Label htmlFor="receipt-edit-number" className="text-muted-foreground">Receipt Number</Label>
                  <Input
                    id="receipt-edit-number"
                    value={editForm.receipt_number}
                    onChange={(event) => setEditForm({ ...editForm, receipt_number: event.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="reconciled">Reconciled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="text-muted-foreground">Received</div>
                  <div>
                    {selectedReceipt.received_at
                      ? new Date(selectedReceipt.received_at).toLocaleDateString()
                      : 'Unknown'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Purchase Order</div>
                  <div>{selectedReceipt.purchase_order?.po_number || 'Not linked'}</div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpdateReceipt}>Save Changes</Button>
              </DialogFooter>

              <div className="space-y-2">
                <div className="font-medium">Receipt Lines</div>
                {receiptLines.length === 0 ? (
                  <div className="text-xs text-muted-foreground">No receipt lines recorded.</div>
                ) : (
                  <div className="space-y-3">
                    {editLines.map((line) => (
                      <div key={line.id} className="border rounded-lg p-3 space-y-2">
                        <div className="text-sm font-medium">{line.product_id}</div>
                        <div className="grid gap-2 md:grid-cols-3">
                          <div className="grid gap-1">
                            <Label className="text-xs text-muted-foreground">Received</Label>
                            <Input
                              type="number"
                              min="0"
                              value={line.quantity_received}
                              onChange={(event) =>
                                handleEditLineChange(line.id, 'quantity_received', Number(event.target.value))
                              }
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label className="text-xs text-muted-foreground">Accepted</Label>
                            <Input
                              type="number"
                              min="0"
                              value={line.quantity_accepted}
                              onChange={(event) =>
                                handleEditLineChange(line.id, 'quantity_accepted', Number(event.target.value))
                              }
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label className="text-xs text-muted-foreground">Rejected</Label>
                            <Input
                              type="number"
                              min="0"
                              value={line.quantity_rejected}
                              onChange={(event) =>
                                handleEditLineChange(line.id, 'quantity_rejected', Number(event.target.value))
                              }
                            />
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Ordered {line.ordered_quantity} | Received to date {line.received_quantity}
                        </div>
                      </div>
                    ))}
                    <DialogFooter>
                      <Button onClick={handleSaveReceiptLines}>Save Line Changes</Button>
                    </DialogFooter>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
