
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Repeat } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addDays } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { createRecurringMessage } from '@/services/chat/recurring/recurringMessagesService';

interface CreateRecurringMessageDialogProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  userId: string;
  userName: string;
}

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
  startDate: z.date().min(new Date(), "Start date must be in the future"),
  endDate: z.date().optional(),
  recurrencePattern: z.enum(['daily', 'weekly', 'monthly']),
  recurrenceInterval: z.number().min(1, "Interval must be at least 1"),
  daysOfWeek: z.array(z.number()).optional(),
  hasEndDate: z.boolean().default(false)
});

type FormValues = z.infer<typeof formSchema>;

export const CreateRecurringMessageDialog: React.FC<CreateRecurringMessageDialogProps> = ({
  open,
  onClose,
  roomId,
  userId,
  userName
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      startDate: addDays(new Date(), 1),
      recurrencePattern: 'daily',
      recurrenceInterval: 1,
      daysOfWeek: [],
      hasEndDate: false
    }
  });
  
  const recurrencePattern = form.watch('recurrencePattern');
  const hasEndDate = form.watch('hasEndDate');
  
  const daysOfWeek = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 },
  ];
  
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await createRecurringMessage(
        roomId,
        values.message,
        userId,
        userName,
        values.startDate,
        values.recurrencePattern,
        values.recurrenceInterval,
        values.recurrencePattern === 'weekly' ? values.daysOfWeek : undefined,
        values.hasEndDate ? values.endDate : undefined
      );
      
      toast({
        title: "Success",
        description: "Recurring message has been created",
      });
      
      onClose();
    } catch (error) {
      console.error("Error creating recurring message:", error);
      toast({
        title: "Error",
        description: "Failed to create recurring message",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Repeat className="mr-2 h-5 w-5" />
            Create Recurring Message
          </DialogTitle>
          <DialogDescription>
            Set up a message that will be automatically sent on a schedule
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your recurring message"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                    className="w-full"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasEndDate"
                checked={hasEndDate}
                onCheckedChange={(checked) => 
                  form.setValue('hasEndDate', checked === true)
                }
              />
              <label
                htmlFor="hasEndDate"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Set an end date
              </label>
            </div>
            
            {hasEndDate && (
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                      className="w-full"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="recurrencePattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recurrence Pattern</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select how often to send" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="recurrenceInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {recurrencePattern === 'daily' && 'Every X days'}
                    {recurrencePattern === 'weekly' && 'Every X weeks'}
                    {recurrencePattern === 'monthly' && 'Every X months'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {recurrencePattern === 'weekly' && (
              <FormField
                control={form.control}
                name="daysOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>On these days of the week</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {daysOfWeek.map((day) => (
                        <div key={day.value} className="flex items-center">
                          <Checkbox
                            id={`day-${day.value}`}
                            checked={field.value?.includes(day.value)}
                            onCheckedChange={(checked) => {
                              const currentValues = [...(field.value || [])];
                              if (checked) {
                                field.onChange([...currentValues, day.value]);
                              } else {
                                field.onChange(
                                  currentValues.filter((val) => val !== day.value)
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`day-${day.value}`}
                            className="ml-2 text-sm"
                          >
                            {day.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Recurring Message"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
