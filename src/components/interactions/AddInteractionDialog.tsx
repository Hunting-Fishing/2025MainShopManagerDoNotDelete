
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Customer } from "@/types/customer";
import { addCustomerInteraction } from "@/services/customer/customerInteractionsService";
import { CustomerInteraction, InteractionType } from "@/types/interaction";
import { useToast } from "@/hooks/use-toast";

const interactionSchema = z.object({
  type: z.enum(["work_order", "communication", "parts", "service", "follow_up"]),
  description: z.string().min(5, "Description is required").max(200, "Description is too long"),
  staffMemberName: z.string().min(3, "Staff member name is required"),
  staffMemberId: z.string().min(1, "Staff member ID is required"),
  notes: z.string().optional(),
  followUpDate: z.date().optional().nullable(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  relatedWorkOrderId: z.string().optional(),
});

type InteractionFormValues = z.infer<typeof interactionSchema>;

interface AddInteractionDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInteractionAdded?: (interaction: CustomerInteraction) => void;
}

export const AddInteractionDialog: React.FC<AddInteractionDialogProps> = ({
  customer,
  open,
  onOpenChange,
  onInteractionAdded,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      type: "service",
      description: "",
      staffMemberName: "Service Staff",
      staffMemberId: "staff-1",
      notes: "",
      followUpDate: null,
      status: "pending",
      relatedWorkOrderId: "",
    },
  });

  const onSubmit = async (values: InteractionFormValues) => {
    try {
      setIsSubmitting(true);

      // Convert form values to the structure expected by the service
      const interactionData = {
        customer_id: customer.id,
        customer_name: `${customer.first_name} ${customer.last_name}`,
        date: new Date().toISOString(),
        type: values.type,
        description: values.description,
        staff_member_id: values.staffMemberId,
        staff_member_name: values.staffMemberName,
        status: values.status,
        notes: values.notes,
        related_work_order_id: values.relatedWorkOrderId || undefined,
        follow_up_date: values.followUpDate ? values.followUpDate.toISOString() : undefined,
        follow_up_completed: false,
      };

      // Add the interaction
      const newInteraction = await addCustomerInteraction(interactionData);

      if (newInteraction) {
        toast({
          title: "Interaction Added",
          description: "The interaction has been recorded successfully.",
        });

        // Reset form
        form.reset();
        
        // Call callback with new interaction
        if (onInteractionAdded) {
          onInteractionAdded(newInteraction);
        }
        
        // Close dialog
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error adding interaction:", error);
      toast({
        title: "Error",
        description: "Failed to add the interaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchType = form.watch("type");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Record Customer Interaction</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="work_order">Work Order</SelectItem>
                        <SelectItem value="communication">Communication</SelectItem>
                        <SelectItem value="parts">Parts</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of the interaction"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="staffMemberName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff Member</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchType === "follow_up" && (
              <FormField
                control={form.control}
                name="followUpDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Follow-up Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isSubmitting}
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
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When to follow up with the customer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchType === "work_order" && (
              <FormField
                control={form.control}
                name="relatedWorkOrderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Order ID (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Related work order ID"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about this interaction"
                      className="resize-none"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Interaction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
