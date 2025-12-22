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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useShopId } from '@/hooks/useShopId';
import { useAuthUser } from '@/hooks/useAuthUser';

export default function Nonconformances() {
  const queryClient = useQueryClient();
  const { shopId } = useShopId();
  const { userId } = useAuthUser();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    severity: 'low',
    status: 'open'
  });
  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'low',
    status: 'open'
  });

  const { data = [], isLoading } = useQuery({
    queryKey: ['quality-nonconformances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nonconformances' as any)
        .select('id,title,status,severity,reported_at,description')
        .order('reported_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const handleCreateNonconformance = async () => {
    if (!shopId) {
      toast.error('Missing shop context.');
      return;
    }

    if (!form.title.trim()) {
      toast.error('Title is required.');
      return;
    }

    const { error } = await supabase
      .from('nonconformances' as any)
      .insert({
        shop_id: shopId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        severity: form.severity,
        status: form.status,
        reported_by: userId || null
      });

    if (error) {
      console.error('Failed to create nonconformance:', error);
      toast.error('Failed to create nonconformance.');
      return;
    }

    setForm({ title: '', description: '', severity: 'low', status: 'open' });
    setIsCreateOpen(false);
    queryClient.invalidateQueries({ queryKey: ['quality-nonconformances'] });
    toast.success('Nonconformance created.');
  };

  const handleUpdateNonconformance = async () => {
    if (!selectedItem) return;
    if (!editForm.title.trim()) {
      toast.error('Title is required.');
      return;
    }

    const { error } = await supabase
      .from('nonconformances' as any)
      .update({
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        severity: editForm.severity,
        status: editForm.status
      })
      .eq('id', selectedItem.id);

    if (error) {
      console.error('Failed to update nonconformance:', error);
      toast.error('Failed to update nonconformance.');
      return;
    }

    toast.success('Nonconformance updated.');
    queryClient.invalidateQueries({ queryKey: ['quality-nonconformances'] });
    setSelectedItem({ ...selectedItem, ...editForm });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nonconformances</h1>
            <p className="text-muted-foreground">
              Track quality issues and resolution status.
            </p>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>New Issue</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Nonconformance</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nc-title">Title</Label>
                <Input
                  id="nc-title"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Inspection failure - calibration"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nc-description">Description</Label>
                <Textarea
                  id="nc-description"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Describe the issue and immediate action taken."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label>Severity</Label>
                <Select
                  value={form.severity}
                  onValueChange={(value) => setForm({ ...form, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
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
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNonconformance}>Create Issue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Open Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading nonconformances...</div>
          ) : data.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No nonconformances recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {data.map((item: any) => (
                <button
                  key={item.id}
                  className="w-full text-left"
                  onClick={() => setSelectedItem(item)}
                  type="button"
                >
                  <div className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Reported {item.reported_at ? new Date(item.reported_at).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant="outline">{item.status}</Badge>
                      <Badge variant="secondary">{item.severity}</Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nonconformance Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 text-sm">
              <div className="grid gap-2">
                <Label htmlFor="nc-edit-title">Title</Label>
                <Input
                  id="nc-edit-title"
                  value={editForm.title}
                  onChange={(event) => setEditForm({ ...editForm, title: event.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nc-edit-description">Description</Label>
                <Textarea
                  id="nc-edit-description"
                  value={editForm.description}
                  onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label>Severity</Label>
                <Select
                  value={editForm.severity}
                  onValueChange={(value) => setEditForm({ ...editForm, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-muted-foreground">
                Reported {selectedItem.reported_at ? new Date(selectedItem.reported_at).toLocaleDateString() : 'Unknown'}
              </div>
              <DialogFooter className="pt-2">
                <Button onClick={handleUpdateNonconformance}>Save Changes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
  useEffect(() => {
    if (!selectedItem) return;
    setEditForm({
      title: selectedItem.title || '',
      description: selectedItem.description || '',
      severity: selectedItem.severity || 'low',
      status: selectedItem.status || 'open'
    });
  }, [selectedItem]);
