
import React, { useState } from 'react';
import { useNotifications } from '@/context/notifications';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type NotificationCategory = 'system' | 'invoice' | 'workOrder' | 'inventory' | 'customer' | 'team' | 'chat';

export function AddNotificationDemo() {
  const { addNotification } = useNotifications();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'error'>('info');
  const [category, setCategory] = useState<NotificationCategory>('system');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [link, setLink] = useState('');
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication status
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(!!data.user);
    };

    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !message) return;
    if (!isAuthenticated) {
      alert('You need to be signed in to create notifications');
      return;
    }
    
    await addNotification({
      title,
      message,
      type,
      category,
      priority,
      link: link || undefined
    });
    
    // Reset form
    setTitle('');
    setMessage('');
    setType('info');
    setCategory('system');
    setPriority('medium');
    setLink('');
    setOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <Button variant="outline" size="sm" className="ml-auto" disabled title="Sign in to create notifications">
        <AlertCircle className="mr-2 h-4 w-4" />
        Demo: Add Notification
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <AlertCircle className="mr-2 h-4 w-4" />
          Demo: Add Notification
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Test Notification</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification message"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select 
              value={type} 
              onValueChange={(value) => setType(value as any)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={category} 
              onValueChange={(value) => setCategory(value as NotificationCategory)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="workOrder">Work Order</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={priority} 
              onValueChange={(value) => setPriority(value as any)}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="link">Link (optional)</Label>
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/work-orders/123"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Notification</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
