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
import { ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useShopId } from '@/hooks/useShopId';
import { useAuthUser } from '@/hooks/useAuthUser';

export default function QualityChecklists() {
  const queryClient = useQueryClient();
  const { shopId } = useShopId();
  const { userId } = useAuthUser();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    is_active: 'true'
  });
  const [form, setForm] = useState({
    name: '',
    description: '',
    is_active: 'true'
  });

  const { data = [], isLoading } = useQuery({
    queryKey: ['quality-checklists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quality_checklists' as any)
        .select('id,name,description,is_active,created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const handleCreateChecklist = async () => {
    if (!shopId) {
      toast.error('Missing shop context.');
      return;
    }

    if (!form.name.trim()) {
      toast.error('Checklist name is required.');
      return;
    }

    const { error } = await supabase
      .from('quality_checklists' as any)
      .insert({
        shop_id: shopId,
        name: form.name.trim(),
        description: form.description.trim() || null,
        is_active: form.is_active === 'true',
        created_by: userId || null
      });

    if (error) {
      console.error('Failed to create checklist:', error);
      toast.error('Failed to create checklist.');
      return;
    }

    setForm({ name: '', description: '', is_active: 'true' });
    setIsCreateOpen(false);
    queryClient.invalidateQueries({ queryKey: ['quality-checklists'] });
    toast.success('Checklist created.');
  };

  const handleUpdateChecklist = async () => {
    if (!selectedChecklist) return;
    if (!editForm.name.trim()) {
      toast.error('Checklist name is required.');
      return;
    }

    const { error } = await supabase
      .from('quality_checklists' as any)
      .update({
        name: editForm.name.trim(),
        description: editForm.description.trim() || null,
        is_active: editForm.is_active === 'true'
      })
      .eq('id', selectedChecklist.id);

    if (error) {
      console.error('Failed to update checklist:', error);
      toast.error('Failed to update checklist.');
      return;
    }

    toast.success('Checklist updated.');
    queryClient.invalidateQueries({ queryKey: ['quality-checklists'] });
    setSelectedChecklist({ ...selectedChecklist, ...editForm, is_active: editForm.is_active === 'true' });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quality Checklists</h1>
            <p className="text-muted-foreground">
              Manage checklists used for quality verification.
            </p>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>New Checklist</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Checklist</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="checklist-name">Name</Label>
                <Input
                  id="checklist-name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Final delivery inspection"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="checklist-description">Description</Label>
                <Textarea
                  id="checklist-description"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Describe the checklist purpose and scope."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.is_active}
                  onValueChange={(value) => setForm({ ...form, is_active: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateChecklist}>Create Checklist</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklists</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading checklists...</div>
          ) : data.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No quality checklists created yet.
            </div>
          ) : (
            <div className="space-y-2">
              {data.map((list: any) => (
                <button
                  key={list.id}
                  className="w-full text-left"
                  onClick={() => setSelectedChecklist(list)}
                  type="button"
                >
                  <div className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="font-medium">{list.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {list.description || 'No description'}
                      </div>
                    </div>
                    <Badge variant={list.is_active ? 'default' : 'secondary'}>
                      {list.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedChecklist} onOpenChange={(open) => !open && setSelectedChecklist(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Checklist Details</DialogTitle>
          </DialogHeader>
          {selectedChecklist && (
            <div className="grid gap-4 text-sm">
              <div className="grid gap-2">
                <Label htmlFor="checklist-edit-name">Name</Label>
                <Input
                  id="checklist-edit-name"
                  value={editForm.name}
                  onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="checklist-edit-description">Description</Label>
                <Textarea
                  id="checklist-edit-description"
                  value={editForm.description}
                  onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={editForm.is_active}
                  onValueChange={(value) => setEditForm({ ...editForm, is_active: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-muted-foreground">
                Created {selectedChecklist.created_at ? new Date(selectedChecklist.created_at).toLocaleDateString() : 'Unknown'}
              </div>
              <DialogFooter className="pt-2">
                <Button onClick={handleUpdateChecklist}>Save Changes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
  useEffect(() => {
    if (!selectedChecklist) return;
    setEditForm({
      name: selectedChecklist.name || '',
      description: selectedChecklist.description || '',
      is_active: selectedChecklist.is_active ? 'true' : 'false'
    });
  }, [selectedChecklist]);
