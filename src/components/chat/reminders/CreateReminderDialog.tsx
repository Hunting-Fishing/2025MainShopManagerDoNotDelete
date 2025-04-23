
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useChatReminders } from '@/hooks/useChatReminders';
import { cn } from "@/lib/utils";

interface CreateReminderDialogProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  userId: string;
  userName: string;
  messageId?: string;
  messageContent?: string;
}

export const CreateReminderDialog: React.FC<CreateReminderDialogProps> = ({
  open,
  onClose,
  roomId,
  userId,
  userName,
  messageId,
  messageContent
}) => {
  // Get the customerId from the parent component using the hook
  const { createReminderFromMessage, isCreating } = useChatReminders();
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState(messageContent ? `Reminder: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}` : '');
  const [description, setDescription] = useState(messageContent || '');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [reminderType, setReminderType] = useState<string>('general');
  const [priority, setPriority] = useState<string>('medium');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1);
  const [recurrenceUnit, setRecurrenceUnit] = useState<string>('weeks');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a reminder title",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create reminder
      const reminder = await createReminderFromMessage({
        messageId: messageId || 'new',
        dueDate,
        title,
        description,
        type: reminderType as any,
        priority: priority as any,
        isRecurring,
        recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
        recurrenceUnit: isRecurring ? recurrenceUnit : undefined
      });
      
      toast({
        title: "Reminder created",
        description: "Your reminder has been set successfully",
      });
      
      // Close dialog and reset form
      onClose();
      resetForm();
      
    } catch (error) {
      console.error("Error creating reminder:", error);
      toast({
        title: "Failed to create reminder",
        description: "There was an error creating your reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(new Date());
    setReminderType('general');
    setPriority('medium');
    setIsRecurring(false);
    setRecurrenceInterval(1);
    setRecurrenceUnit('weeks');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{messageId ? "Create reminder from message" : "Create new reminder"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Reminder Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter reminder title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this reminder"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={reminderType} onValueChange={setReminderType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="parts">Parts</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => date && setDueDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className={cn(
                "h-4 w-4 rounded border-gray-300",
                "focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              )}
            />
            <Label htmlFor="isRecurring" className="text-sm font-medium">
              Make this a recurring reminder
            </Label>
          </div>
          
          {isRecurring && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recurrenceInterval">Repeat every</Label>
                <Input
                  id="recurrenceInterval"
                  type="number"
                  min="1"
                  max="365"
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recurrenceUnit">Period</Label>
                <Select value={recurrenceUnit} onValueChange={setRecurrenceUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Set Reminder"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
