
import React, { useState } from "react";
import { Customer } from "@/types/customer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CustomerInteraction, InteractionType } from "@/types/interaction";
import { addInteraction } from "@/data/interactionsData";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { teamMembers } from "@/data/teamData";

interface AddInteractionDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInteractionAdded?: (interaction: CustomerInteraction) => void;
  relatedWorkOrderId?: string;
}

const interactionFormSchema = z.object({
  type: z.enum(["work_order", "communication", "parts", "service", "follow_up"]),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  staffMemberId: z.string().min(1, {
    message: "Please select a staff member.",
  }),
  notes: z.string().optional(),
  followUpDate: z.date().optional().nullable(),
});

type InteractionFormValues = z.infer<typeof interactionFormSchema>;

export const AddInteractionDialog: React.FC<AddInteractionDialogProps> = ({
  customer,
  open,
  onOpenChange,
  onInteractionAdded,
  relatedWorkOrderId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionFormSchema),
    defaultValues: {
      type: "communication",
      description: "",
      staffMemberId: "",
      notes: "",
      followUpDate: null,
    },
  });

  const selectedType = form.watch("type");

  const onSubmit = async (values: InteractionFormValues) => {
    setIsSubmitting(true);
    try {
      // Find the selected staff member
      const staffMember = teamMembers.find((member) => member.id === values.staffMemberId);
      
      if (!staffMember) {
        throw new Error("Staff member not found");
      }

      const today = new Date().toISOString().split("T")[0];
      
      // Create interaction data
      const interactionData: Omit<CustomerInteraction, "id"> = {
        customerId: customer.id,
        customerName: customer.name,
        date: today,
        type: values.type as InteractionType,
        description: values.description,
        staffMemberId: staffMember.id,
        staffMemberName: staffMember.name,
        status: values.type === "follow_up" ? "pending" : "completed",
        notes: values.notes,
        followUpDate: values.followUpDate ? values.followUpDate.toISOString().split("T")[0] : undefined,
        followUpCompleted: false,
        relatedWorkOrderId,
      };

      // Add new interaction
      const newInteraction = addInteraction(interactionData);
      
      toast({
        title: "Interaction recorded",
        description: "The customer interaction has been recorded successfully.",
      });
      
      // Call the callback if provided
      if (onInteractionAdded) {
        onInteractionAdded(newInteraction);
      }
      
      // Close dialog and reset form
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error adding interaction:", error);
      toast({
        title: "Error",
        description: "Failed to record customer interaction.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Customer Interaction</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interaction Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="parts">Parts</SelectItem>
                      <SelectItem value="work_order">Work Order</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Input {...field} placeholder="Enter interaction description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="staffMemberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff Member</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamMembers
                        .filter((member) => member.status === "Active")
                        .map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType === "follow_up" && (
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
                            variant="outline"
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
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter any additional notes"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
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
