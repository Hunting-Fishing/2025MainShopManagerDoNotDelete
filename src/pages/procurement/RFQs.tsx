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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useShopId } from '@/hooks/useShopId';
import { useAuthUser } from '@/hooks/useAuthUser';

export default function RFQs() {
  const queryClient = useQueryClient();
  const { shopId } = useShopId();
  const { userId } = useAuthUser();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState<any | null>(null);
  const [isItemOpen, setIsItemOpen] = useState(false);
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editingResponse, setEditingResponse] = useState<any | null>(null);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteResponseId, setDeleteResponseId] = useState<string | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    needed_by: '',
    status: 'draft'
  });
  const [form, setForm] = useState({
    title: '',
    needed_by: '',
    status: 'draft'
  });
  const [itemForm, setItemForm] = useState({
    item_name: '',
    quantity: '',
    uom: '',
    notes: ''
  });
  const [editItemForm, setEditItemForm] = useState({
    item_name: '',
    quantity: '',
    uom: '',
    notes: ''
  });
  const [responseForm, setResponseForm] = useState({
    supplier_id: '',
    status: 'submitted',
    total_amount: '',
    notes: ''
  });
  const [editResponseForm, setEditResponseForm] = useState({
    supplier_id: '',
    status: 'submitted',
    total_amount: '',
    notes: ''
  });
  const [eventForm, setEventForm] = useState({
    event_type: 'note',
    notes: ''
  });
  const [editEventForm, setEditEventForm] = useState({
    event_type: 'note',
    notes: ''
  });
  const [convertForm, setConvertForm] = useState({
    po_number: '',
    supplier_id: '',
    expected_delivery_date: ''
  });

  const { data: rfqs = [], isLoading } = useQuery({
    queryKey: ['procurement-rfqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rfqs' as any)
        .select('id,title,status,needed_by,created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const { data: rfqItems = [] } = useQuery({
    queryKey: ['procurement-rfq-items', selectedRfq?.id],
    enabled: !!selectedRfq?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rfq_items' as any)
        .select('id,item_name,quantity,uom,notes')
        .eq('rfq_id', selectedRfq.id)
        .order('item_name');

      if (error) throw error;
      return data || [];
    }
  });

  const { data: rfqResponses = [] } = useQuery({
    queryKey: ['procurement-rfq-responses', selectedRfq?.id],
    enabled: !!selectedRfq?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rfq_responses' as any)
        .select('id,supplier_id,status,response_date,total_amount,notes,supplier:suppliers(name)')
        .eq('rfq_id', selectedRfq.id)
        .order('response_date', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['procurement-suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers' as any)
        .select('id,name')
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });

  const { data: responseEvents = [] } = useQuery({
    queryKey: ['procurement-rfq-response-events', editingResponse?.id],
    enabled: !!editingResponse?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rfq_response_events' as any)
        .select('id,event_type,notes,created_at')
        .eq('response_id', editingResponse.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  useEffect(() => {
    if (!selectedRfq) return;
    setEditForm({
      title: selectedRfq.title || '',
      needed_by: selectedRfq.needed_by || '',
      status: selectedRfq.status || 'draft'
    });
  }, [selectedRfq]);

  useEffect(() => {
    if (!selectedRfq) return;
    const acceptedResponse = rfqResponses.find((response: any) => response.status === 'accepted');
    setConvertForm({
      po_number: `PO-${Date.now()}`,
      supplier_id: acceptedResponse?.supplier_id || '',
      expected_delivery_date: selectedRfq.needed_by || ''
    });
  }, [selectedRfq, rfqResponses]);

  useEffect(() => {
    if (!editingItem) return;
    setEditItemForm({
      item_name: editingItem.item_name || '',
      quantity: editingItem.quantity?.toString() || '',
      uom: editingItem.uom || '',
      notes: editingItem.notes || ''
    });
  }, [editingItem]);

  useEffect(() => {
    if (!editingResponse) return;
    setEditResponseForm({
      supplier_id: editingResponse.supplier_id || '',
      status: editingResponse.status || 'submitted',
      total_amount: editingResponse.total_amount?.toString() || '',
      notes: editingResponse.notes || ''
    });
    setEventForm({ event_type: 'note', notes: '' });
  }, [editingResponse]);

  useEffect(() => {
    if (!editingEvent) return;
    setEditEventForm({
      event_type: editingEvent.event_type || 'note',
      notes: editingEvent.notes || ''
    });
  }, [editingEvent]);

  const handleCreateRfq = async () => {
    if (!shopId) {
      toast.error('Missing shop context.');
      return;
    }

    if (!form.title.trim()) {
      toast.error('RFQ title is required.');
      return;
    }

    const { error } = await supabase
      .from('rfqs' as any)
      .insert({
        shop_id: shopId,
        title: form.title.trim(),
        status: form.status,
        needed_by: form.needed_by || null,
        created_by: userId || null
      });

    if (error) {
      console.error('Failed to create RFQ:', error);
      toast.error('Failed to create RFQ.');
      return;
    }

    setForm({ title: '', needed_by: '', status: 'draft' });
    setIsCreateOpen(false);
    queryClient.invalidateQueries({ queryKey: ['procurement-rfqs'] });
    toast.success('RFQ created.');
  };

  const handleUpdateRfq = async () => {
    if (!selectedRfq) return;
    if (!editForm.title.trim()) {
      toast.error('RFQ title is required.');
      return;
    }

    const { error } = await supabase
      .from('rfqs' as any)
      .update({
        title: editForm.title.trim(),
        needed_by: editForm.needed_by || null,
        status: editForm.status
      })
      .eq('id', selectedRfq.id);

    if (error) {
      console.error('Failed to update RFQ:', error);
      toast.error('Failed to update RFQ.');
      return;
    }

    toast.success('RFQ updated.');
    queryClient.invalidateQueries({ queryKey: ['procurement-rfqs'] });
    setSelectedRfq({ ...selectedRfq, ...editForm });
  };

  const handleAddItem = async () => {
    if (!selectedRfq) return;
    if (!itemForm.item_name.trim()) {
      toast.error('Item name is required.');
      return;
    }

    const { error } = await supabase
      .from('rfq_items' as any)
      .insert({
        rfq_id: selectedRfq.id,
        item_name: itemForm.item_name.trim(),
        quantity: Number(itemForm.quantity || 1),
        uom: itemForm.uom.trim() || null,
        notes: itemForm.notes.trim() || null
      });

    if (error) {
      console.error('Failed to add RFQ item:', error);
      toast.error('Failed to add RFQ item.');
      return;
    }

    setItemForm({ item_name: '', quantity: '', uom: '', notes: '' });
    setIsItemOpen(false);
    queryClient.invalidateQueries({ queryKey: ['procurement-rfq-items', selectedRfq.id] });
    toast.success('Item added.');
  };

  const handleAddResponse = async () => {
    if (!selectedRfq) return;

    const { error } = await supabase
      .from('rfq_responses' as any)
      .insert({
        rfq_id: selectedRfq.id,
        supplier_id: responseForm.supplier_id || null,
        status: responseForm.status,
        total_amount: Number(responseForm.total_amount || 0),
        notes: responseForm.notes.trim() || null
      });

    if (error) {
      console.error('Failed to add RFQ response:', error);
      toast.error('Failed to add RFQ response.');
      return;
    }

    setResponseForm({ supplier_id: '', status: 'submitted', total_amount: '', notes: '' });
    setIsResponseOpen(false);
    queryClient.invalidateQueries({ queryKey: ['procurement-rfq-responses', selectedRfq.id] });
    toast.success('Response added.');
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    if (!editItemForm.item_name.trim()) {
      toast.error('Item name is required.');
      return;
    }

    const { error } = await supabase
      .from('rfq_items' as any)
      .update({
        item_name: editItemForm.item_name.trim(),
        quantity: Number(editItemForm.quantity || 1),
        uom: editItemForm.uom.trim() || null,
        notes: editItemForm.notes.trim() || null
      })
      .eq('id', editingItem.id);

    if (error) {
      console.error('Failed to update RFQ item:', error);
      toast.error('Failed to update RFQ item.');
      return;
    }

    toast.success('Item updated.');
    queryClient.invalidateQueries({ queryKey: ['procurement-rfq-items', selectedRfq?.id] });
    setEditingItem(null);
  };

  const handleDeleteItem = async () => {
    if (!deleteItemId) return;
    const { error } = await supabase
      .from('rfq_items' as any)
      .delete()
      .eq('id', deleteItemId);

    if (error) {
      console.error('Failed to delete RFQ item:', error);
      toast.error('Failed to delete RFQ item.');
      return;
    }

    toast.success('Item deleted.');
    queryClient.invalidateQueries({ queryKey: ['procurement-rfq-items', selectedRfq?.id] });
    setDeleteItemId(null);
  };

  const handleUpdateResponse = async () => {
    if (!editingResponse) return;
    const { error } = await supabase
      .from('rfq_responses' as any)
      .update({
        supplier_id: editResponseForm.supplier_id || null,
        status: editResponseForm.status,
        total_amount: Number(editResponseForm.total_amount || 0),
        notes: editResponseForm.notes.trim() || null
      })
      .eq('id', editingResponse.id);

    if (error) {
      console.error('Failed to update RFQ response:', error);
      toast.error('Failed to update RFQ response.');
      return;
    }

    toast.success('Response updated.');
    queryClient.invalidateQueries({ queryKey: ['procurement-rfq-responses', selectedRfq?.id] });
    setEditingResponse(null);
  };

  const handleDeleteResponse = async () => {
    if (!deleteResponseId) return;
    const { error } = await supabase
      .from('rfq_responses' as any)
      .delete()
      .eq('id', deleteResponseId);

    if (error) {
      console.error('Failed to delete RFQ response:', error);
      toast.error('Failed to delete RFQ response.');
      return;
    }

    toast.success('Response deleted.');
    queryClient.invalidateQueries({ queryKey: ['procurement-rfq-responses', selectedRfq?.id] });
    setDeleteResponseId(null);
  };

  const handleAddResponseEvent = async () => {
    if (!editingResponse) return;
    if (!eventForm.notes.trim()) {
      toast.error('Event notes are required.');
      return;
    }

    const { error } = await supabase
      .from('rfq_response_events' as any)
      .insert({
        response_id: editingResponse.id,
        event_type: eventForm.event_type,
        notes: eventForm.notes.trim(),
        created_by: userId || null
      });

    if (error) {
      console.error('Failed to add response event:', error);
      toast.error('Failed to add response event.');
      return;
    }

    setEventForm({ event_type: 'note', notes: '' });
    queryClient.invalidateQueries({ queryKey: ['procurement-rfq-response-events', editingResponse.id] });
    toast.success('Event added.');
  };

  const handleUpdateResponseEvent = async () => {
    if (!editingEvent) return;
    if (!editEventForm.notes.trim()) {
      toast.error('Event notes are required.');
      return;
    }

    const { error } = await supabase
      .from('rfq_response_events' as any)
      .update({
        event_type: editEventForm.event_type,
        notes: editEventForm.notes.trim()
      })
      .eq('id', editingEvent.id);

    if (error) {
      console.error('Failed to update response event:', error);
      toast.error('Failed to update response event.');
      return;
    }

    toast.success('Event updated.');
    queryClient.invalidateQueries({ queryKey: ['procurement-rfq-response-events', editingResponse?.id] });
    setEditingEvent(null);
  };

  const handleDeleteResponseEvent = async () => {
    if (!deleteEventId) return;
    const { error } = await supabase
      .from('rfq_response_events' as any)
      .delete()
      .eq('id', deleteEventId);

    if (error) {
      console.error('Failed to delete response event:', error);
      toast.error('Failed to delete response event.');
      return;
    }

    toast.success('Event deleted.');
    queryClient.invalidateQueries({ queryKey: ['procurement-rfq-response-events', editingResponse?.id] });
    setDeleteEventId(null);
  };

  const handleConvertToPo = async () => {
    if (!selectedRfq) return;

    if (!convertForm.po_number.trim()) {
      toast.error('PO number is required.');
      return;
    }

    const { data: purchaseOrder, error } = await supabase
      .from('purchase_orders' as any)
      .insert({
        po_number: convertForm.po_number.trim(),
        supplier_id: convertForm.supplier_id || null,
        status: 'draft',
        expected_delivery_date: convertForm.expected_delivery_date || null,
        notes: `Converted from RFQ ${selectedRfq.title}`
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create purchase order:', error);
      toast.error('Failed to create purchase order.');
      return;
    }

    if (rfqItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('purchase_order_items' as any)
        .insert(
          rfqItems.map((item: any) => ({
            purchase_order_id: purchaseOrder.id,
            product_id: item.item_name,
            quantity: Number(item.quantity || 0),
            unit_cost: 0,
            total_cost: 0
          }))
        );

      if (itemsError) {
        console.error('Failed to create purchase order items:', itemsError);
        toast.error('PO created, but items failed.');
      }
    }

    toast.success('Purchase order created.');
    setIsConvertOpen(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">RFQs</h1>
            <p className="text-muted-foreground">
              Collect vendor quotes before issuing purchase orders.
            </p>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>New RFQ</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create RFQ</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rfq-title">Title</Label>
                <Input
                  id="rfq-title"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Quarterly supply request"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rfq-needed-by">Needed By</Label>
                <Input
                  id="rfq-needed-by"
                  type="date"
                  value={form.needed_by}
                  onChange={(event) => setForm({ ...form, needed_by: event.target.value })}
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
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRfq}>Create RFQ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requests for Quote</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading RFQs...</div>
          ) : rfqs.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No RFQs created yet.
            </div>
          ) : (
            <div className="space-y-2">
              {rfqs.map((rfq: any) => (
                <button
                  key={rfq.id}
                  className="w-full text-left"
                  onClick={() => setSelectedRfq(rfq)}
                  type="button"
                >
                  <div className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="font-medium">{rfq.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Needed by {rfq.needed_by || 'TBD'}
                      </div>
                    </div>
                    <Badge variant="outline">{rfq.status}</Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedRfq} onOpenChange={(open) => !open && setSelectedRfq(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>RFQ Details</DialogTitle>
          </DialogHeader>
          {selectedRfq && (
            <div className="grid gap-6 text-sm">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="rfq-edit-title">Title</Label>
                  <Input
                    id="rfq-edit-title"
                    value={editForm.title}
                    onChange={(event) => setEditForm({ ...editForm, title: event.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rfq-edit-needed-by">Needed By</Label>
                  <Input
                    id="rfq-edit-needed-by"
                    type="date"
                    value={editForm.needed_by || ''}
                    onChange={(event) => setEditForm({ ...editForm, needed_by: event.target.value })}
                  />
                </div>
                <div className="text-xs text-muted-foreground md:col-span-2">
                  Created {selectedRfq.created_at ? new Date(selectedRfq.created_at).toLocaleDateString() : 'Unknown'}
                </div>
                <div className="md:col-span-3 flex flex-wrap gap-2">
                  <Button onClick={handleUpdateRfq}>Save RFQ</Button>
                  <Button variant="outline" onClick={() => setIsConvertOpen(true)}>
                    Convert to PO
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">RFQ Items</div>
                  <Button size="sm" onClick={() => setIsItemOpen(true)}>Add Item</Button>
                </div>
                {rfqItems.length === 0 ? (
                  <div className="text-xs text-muted-foreground">No items added yet.</div>
                ) : (
                  <div className="space-y-2">
                    {rfqItems.map((item: any) => (
                      <div key={item.id} className="border rounded-lg p-3 flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{item.item_name}</div>
                          <div className="text-xs text-muted-foreground">
                            Qty {item.quantity} {item.uom || ''} {item.notes ? `- ${item.notes}` : ''}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingItem(item)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setDeleteItemId(item.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Supplier Responses</div>
                  <Button size="sm" onClick={() => setIsResponseOpen(true)}>Add Response</Button>
                </div>
                {rfqResponses.length === 0 ? (
                  <div className="text-xs text-muted-foreground">No responses recorded yet.</div>
                ) : (
                  <div className="space-y-2">
                    {rfqResponses.map((response: any) => (
                      <div key={response.id} className="border rounded-lg p-3 flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">
                            {response.supplier?.name || 'Unassigned supplier'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {response.status} - ${Number(response.total_amount || 0).toFixed(2)}
                          </div>
                          {response.notes && (
                            <div className="text-xs text-muted-foreground">{response.notes}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingResponse(response)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setDeleteResponseId(response.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isItemOpen} onOpenChange={setIsItemOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add RFQ Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="rfq-item-name">Item Name</Label>
              <Input
                id="rfq-item-name"
                value={itemForm.item_name}
                onChange={(event) => setItemForm({ ...itemForm, item_name: event.target.value })}
                placeholder="Oil filters"
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="rfq-item-qty">Quantity</Label>
                <Input
                  id="rfq-item-qty"
                  type="number"
                  min="1"
                  value={itemForm.quantity}
                  onChange={(event) => setItemForm({ ...itemForm, quantity: event.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rfq-item-uom">UOM</Label>
                <Input
                  id="rfq-item-uom"
                  value={itemForm.uom}
                  onChange={(event) => setItemForm({ ...itemForm, uom: event.target.value })}
                  placeholder="each"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rfq-item-notes">Notes</Label>
              <Textarea
                id="rfq-item-notes"
                value={itemForm.notes}
                onChange={(event) => setItemForm({ ...itemForm, notes: event.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isResponseOpen} onOpenChange={setIsResponseOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Supplier Response</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Supplier</Label>
              <Select
                value={responseForm.supplier_id}
                onValueChange={(value) => setResponseForm({ ...responseForm, supplier_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier: any) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={responseForm.status}
                onValueChange={(value) => setResponseForm({ ...responseForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rfq-response-amount">Total Amount</Label>
              <Input
                id="rfq-response-amount"
                type="number"
                step="0.01"
                value={responseForm.total_amount}
                onChange={(event) => setResponseForm({ ...responseForm, total_amount: event.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rfq-response-notes">Notes</Label>
              <Textarea
                id="rfq-response-notes"
                value={responseForm.notes}
                onChange={(event) => setResponseForm({ ...responseForm, notes: event.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddResponse}>Add Response</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConvertOpen} onOpenChange={setIsConvertOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Convert to Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="po-number">PO Number</Label>
              <Input
                id="po-number"
                value={convertForm.po_number}
                onChange={(event) => setConvertForm({ ...convertForm, po_number: event.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Supplier</Label>
              <Select
                value={convertForm.supplier_id}
                onValueChange={(value) => setConvertForm({ ...convertForm, supplier_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier: any) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="po-expected">Expected Delivery</Label>
              <Input
                id="po-expected"
                type="date"
                value={convertForm.expected_delivery_date}
                onChange={(event) => setConvertForm({ ...convertForm, expected_delivery_date: event.target.value })}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              This will create a purchase order with the current RFQ items.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConvertOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConvertToPo}>Create PO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit RFQ Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="rfq-item-edit-name">Item Name</Label>
              <Input
                id="rfq-item-edit-name"
                value={editItemForm.item_name}
                onChange={(event) => setEditItemForm({ ...editItemForm, item_name: event.target.value })}
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="rfq-item-edit-qty">Quantity</Label>
                <Input
                  id="rfq-item-edit-qty"
                  type="number"
                  min="1"
                  value={editItemForm.quantity}
                  onChange={(event) => setEditItemForm({ ...editItemForm, quantity: event.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rfq-item-edit-uom">UOM</Label>
                <Input
                  id="rfq-item-edit-uom"
                  value={editItemForm.uom}
                  onChange={(event) => setEditItemForm({ ...editItemForm, uom: event.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rfq-item-edit-notes">Notes</Label>
              <Textarea
                id="rfq-item-edit-notes"
                value={editItemForm.notes}
                onChange={(event) => setEditItemForm({ ...editItemForm, notes: event.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateItem}>Save Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingResponse} onOpenChange={(open) => !open && setEditingResponse(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Supplier Response</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label>Supplier</Label>
              <Select
                value={editResponseForm.supplier_id}
                onValueChange={(value) => setEditResponseForm({ ...editResponseForm, supplier_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier: any) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={editResponseForm.status}
                onValueChange={(value) => setEditResponseForm({ ...editResponseForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rfq-response-edit-amount">Total Amount</Label>
              <Input
                id="rfq-response-edit-amount"
                type="number"
                step="0.01"
                value={editResponseForm.total_amount}
                onChange={(event) => setEditResponseForm({ ...editResponseForm, total_amount: event.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rfq-response-edit-notes">Notes</Label>
              <Textarea
                id="rfq-response-edit-notes"
                value={editResponseForm.notes}
                onChange={(event) => setEditResponseForm({ ...editResponseForm, notes: event.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <div className="font-medium">Response History</div>
              {responseEvents.length === 0 ? (
                <div className="text-xs text-muted-foreground">No history events yet.</div>
              ) : (
                <div className="space-y-2">
                  {responseEvents.map((event: any) => (
                    <div key={event.id} className="border rounded-lg p-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          {event.event_type} · {event.created_at ? new Date(event.created_at).toLocaleString() : 'Unknown'}
                        </div>
                        <div className="text-sm">{event.notes}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingEvent(event)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeleteEventId(event.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid gap-2 border rounded-lg p-3">
                <div className="text-sm font-medium">Add History Note</div>
                <Select
                  value={eventForm.event_type}
                  onValueChange={(value) => setEventForm({ ...eventForm, event_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="status_change">Status Change</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  value={eventForm.notes}
                  onChange={(event) => setEventForm({ ...eventForm, notes: event.target.value })}
                  rows={3}
                  placeholder="Add context or status updates..."
                />
                <Button size="sm" onClick={handleAddResponseEvent}>Add Event</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingResponse(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateResponse}>Save Response</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit History Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Event Type</Label>
              <Select
                value={editEventForm.event_type}
                onValueChange={(value) => setEditEventForm({ ...editEventForm, event_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="status_change">Status Change</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                value={editEventForm.notes}
                onChange={(event) => setEditEventForm({ ...editEventForm, notes: event.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEvent(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateResponseEvent}>Save Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteItemId} onOpenChange={(open) => !open && setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete RFQ Item</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the item from the RFQ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteResponseId} onOpenChange={(open) => !open && setDeleteResponseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier Response</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the supplier response.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteResponse}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteEventId} onOpenChange={(open) => !open && setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete History Event</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the history event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteResponseEvent}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
