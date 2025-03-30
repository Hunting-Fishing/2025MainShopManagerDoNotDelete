
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { createReminder } from "@/services/reminderService";
import { ReminderType } from "@/types/reminder";

// Schema for reminder form validation
const reminderFormSchema = z.object({
  customerId: z.string({
    required_error: "Customer is required",
  }),
  vehicleId: z.string().optional(),
  type: z.enum(["service", "maintenance", "follow_up", "warranty", "other"], {
    required_error: "Reminder type is required",
  }),
  title: z.string().min(3, {
    message: "Title must be at least 3 characters",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters",
  }),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  notes: z.string().optional(),
});

type ReminderFormValues = z.infer<typeof reminderFormSchema>;

interface AddReminderFormProps {
  customerId?: string;
  vehicleId?: string;
  onSuccess?: () => void;
}

export function AddReminderForm({ customerId, vehicleId, onSuccess }: AddReminderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with default values
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      customerId: customerId || "",
      vehicleId: vehicleId || "",
      type: "service",
      title: "",
      description: "",
      notes: "",
    },
  });

  const onSubmit = async (values: ReminderFormValues) => {
    setIsSubmitting(true);
    try {
      const formattedDate = format(values.dueDate, "yyyy-MM-dd");
      
      await createReminder({
        customerId: values.customerId,
        vehicleId: values.vehicleId,
        type: values.type as ReminderType,
        title: values.title,
        description: values.description,
        dueDate: formattedDate,
        notes: values.notes,
      });
      
      toast({
        title: "Reminder Created",
        description: "The service reminder has been created successfully."
      });
      
      // Reset the form
      form.reset();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating reminder:", error);
      toast({
        title: "Error",
        description: "Failed to create service reminder.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!!customerId} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!!vehicleId} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reminder Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reminder type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="follow_up">Follow-Up</SelectItem>
                  <SelectItem value="warranty">Warranty</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Reminder title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the service reminder" 
                  className="min-h-20" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional notes" 
                  className="min-h-20" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Reminder"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
