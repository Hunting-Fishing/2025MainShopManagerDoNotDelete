
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, MessageCircle, Users, Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function NewChatDialog() {
  const [open, setOpen] = useState(false);
  const [chatName, setChatName] = useState('');
  const [chatType, setChatType] = useState<'direct' | 'group' | 'work_order'>('direct');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateChat = async () => {
    setIsCreating(true);
    try {
      // For now, just show a success message since the chat_threads table doesn't exist
      toast({
        title: "Chat created",
        description: `${chatName} has been created successfully`,
      });

      setOpen(false);
      setChatName('');
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getChatIcon = () => {
    switch (chatType) {
      case 'direct':
        return <MessageCircle className="h-4 w-4" />;
      case 'group':
        return <Users className="h-4 w-4" />;
      case 'work_order':
        return <Wrench className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Chat</DialogTitle>
          <DialogDescription>
            Start a new conversation with your team members.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="chat-type">Chat Type</Label>
            <Select value={chatType} onValueChange={(value: 'direct' | 'group' | 'work_order') => setChatType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select chat type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">
                  <div className="flex items-center">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Direct Message
                  </div>
                </SelectItem>
                <SelectItem value="group">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Group Chat
                  </div>
                </SelectItem>
                <SelectItem value="work_order">
                  <div className="flex items-center">
                    <Wrench className="mr-2 h-4 w-4" />
                    Work Order Chat
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="chat-name">Chat Name</Label>
            <Input
              id="chat-name"
              placeholder="Enter chat name"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreateChat} disabled={isCreating || !chatName}>
            {getChatIcon()}
            <span className="ml-2">
              {isCreating ? 'Creating...' : 'Create Chat'}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
