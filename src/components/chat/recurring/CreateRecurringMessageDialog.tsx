
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { createRecurringMessage } from '@/services/chat/recurring/recurringMessagesService';

export interface CreateRecurringMessageDialogProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  userId: string; // Add this missing prop
  userName: string; // Add this missing prop
  onSuccess?: () => void;
}

export const CreateRecurringMessageDialog: React.FC<CreateRecurringMessageDialogProps> = ({
  open,
  onClose,
  roomId,
  userId,
  userName,
  onSuccess
}) => {
  // Form state
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [recurringType, setRecurringType] = useState<string>('daily');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [interval, setInterval] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !message || !startDate || !recurringType) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create the recurring message with a single object parameter
      await createRecurringMessage({
        roomId,
        title,
        message,
        startDate,
        recurringType,
        isActive,
        interval,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form and close
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating recurring message:", error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setTitle('');
    setMessage('');
    setStartDate(new Date());
    setRecurringType('daily');
    setIsActive(true);
    setInterval(1);
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Recurring Message</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New recurring message"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the message that will be sent repeatedly"
              required
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recurringType">Frequency</Label>
              <Select value={recurringType} onValueChange={setRecurringType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <Label htmlFor="interval">Every</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="interval"
                  type="number"
                  min={1}
                  value={interval}
                  onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <span>{recurringType === 'daily' ? 'days' : recurringType === 'weekly' ? 'weeks' : 'months'}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="isActive">Active</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <span>{isActive ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
