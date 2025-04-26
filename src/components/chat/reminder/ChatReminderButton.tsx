
import React, { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ReminderPriority, ReminderType } from '@/types/reminder';

interface ChatReminderButtonProps {
  messageId: string;
  messageContent: string;
  onCreateReminder: (reminderData: {
    messageId: string;
    dueDate: Date;
    title: string;
    description: string;
    type: ReminderType;
    priority: ReminderPriority;
    isRecurring: boolean;
    recurrenceInterval?: number;
    recurrenceUnit?: string;
  }) => Promise<void>;
}

export const ChatReminderButton: React.FC<ChatReminderButtonProps> = ({
  messageId,
  messageContent,
  onCreateReminder,
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ReminderType>('follow_up');
  const [priority, setPriority] = useState<ReminderPriority>('medium');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceUnit, setRecurrenceUnit] = useState('weeks');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateReminder = async () => {
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a due date",
        variant: "destructive"
      });
      return;
    }

    if (!title.trim()) {
      setTitle(`Reminder: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}`);
    }

    setIsCreating(true);

    try {
      await onCreateReminder({
        messageId,
        dueDate: date,
        title: title || `Reminder: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}`,
        description: messageContent,
        type,
        priority,
        isRecurring,
        recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
        recurrenceUnit: isRecurring ? recurrenceUnit : undefined
      });

      toast({
        title: "Reminder created",
        description: "Your reminder has been scheduled"
      });
      setOpen(false);
    } catch (error) {
      console.error("Error creating reminder:", error);
      toast({
        title: "Failed to create reminder",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
        >
          <CalendarDays className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h3 className="font-medium">Create Reminder</h3>
          
          <div className="space-y-2">
            <Label htmlFor="title">Reminder Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Reminder: ${messageContent.substring(0, 30)}...`}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reminder Type</Label>
              <Select defaultValue={type} onValueChange={(val: ReminderType) => setType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="warranty">Warranty</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select defaultValue={priority} onValueChange={(val: ReminderPriority) => setPriority(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Due Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
            <Label htmlFor="recurring">Recurring Reminder</Label>
          </div>
          
          {isRecurring && (
            <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-slate-200">
              <div className="space-y-2">
                <Label htmlFor="interval">Repeat every</Label>
                <Input
                  id="interval"
                  type="number"
                  min={1}
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select defaultValue={recurrenceUnit} onValueChange={setRecurrenceUnit}>
                  <SelectTrigger>
                    <SelectValue />
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
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateReminder} 
              disabled={isCreating || !date}
            >
              {isCreating ? "Creating..." : "Create Reminder"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
