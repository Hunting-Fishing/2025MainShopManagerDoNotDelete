import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useInspectionSchedules } from '@/hooks/useInspectionSchedules';

const formSchema = z.object({
  schedule_name: z.string().min(1, 'Name is required'),
  inspection_type: z.string().min(1, 'Type is required'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'hours_based']),
  frequency_value: z.coerce.number().min(1).default(1),
  hours_interval: z.coerce.number().optional(),
  reminder_days_before: z.coerce.number().min(0).default(1),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentId?: string;
  vehicleId?: string;
}

export function CreateScheduleDialog({ 
  open, 
  onOpenChange,
  equipmentId,
  vehicleId 
}: CreateScheduleDialogProps) {
  const { createSchedule } = useInspectionSchedules();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schedule_name: '',
      inspection_type: 'vessel',
      frequency: 'daily',
      frequency_value: 1,
      reminder_days_before: 1,
      notes: '',
    },
  });

  const frequency = form.watch('frequency');

  const onSubmit = async (data: FormData) => {
    const result = await createSchedule({
      schedule_name: data.schedule_name,
      inspection_type: data.inspection_type,
      frequency: data.frequency,
      frequency_value: data.frequency_value,
      hours_interval: data.hours_interval,
      reminder_days_before: data.reminder_days_before,
      notes: data.notes,
      equipment_id: equipmentId,
      vehicle_id: vehicleId,
    });
    
    if (result) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Inspection Schedule</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="schedule_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Daily Forklift Inspection" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inspection_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspection Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="vessel">Vessel</SelectItem>
                      <SelectItem value="forklift">Forklift</SelectItem>
                      <SelectItem value="dvir">DVIR</SelectItem>
                      <SelectItem value="daily_shop">Daily Shop</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="hours_based">Hours Based</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {frequency === 'hours_based' ? 'Hours' : 'Every X'}
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reminder_days_before"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reminder Days Before</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional instructions..."
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Schedule</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
