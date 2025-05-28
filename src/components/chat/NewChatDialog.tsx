import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateChat: (name: string, type: 'direct' | 'group' | 'work_order', workOrderId?: string) => void;
}

export function NewChatDialog({ open, onOpenChange, onCreateChat }: NewChatDialogProps) {
  const [chatName, setChatName] = useState('');
  const [chatType, setChatType] = useState<'direct' | 'group' | 'work_order'>('direct');
  const [workOrderId, setWorkOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!chatName.trim()) {
      toast({
        title: 'Error',
        description: 'Chat name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      onCreateChat(chatName, chatType, workOrderId);
      toast({
        title: 'Success',
        description: 'Chat created successfully.',
      });
      onOpenChange(false);
      setChatName('');
      setChatType('direct');
      setWorkOrderId('');
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to create chat. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Chat</DialogTitle>
          <DialogDescription>
            Create a new chat room to start a conversation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select value={chatType} onValueChange={(value) => setChatType(value as 'direct' | 'group' | 'work_order')} className="col-span-3">
              <SelectTrigger>
                <SelectValue placeholder="Select chat type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="group">Group</SelectItem>
                <SelectItem value="work_order">Work Order</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {chatType === 'work_order' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="workOrderId" className="text-right">
                Work Order ID
              </Label>
              <Input
                id="workOrderId"
                value={workOrderId}
                onChange={(e) => setWorkOrderId(e.target.value)}
                className="col-span-3"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
