
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { createReminder } from "@/services/reminderService";
import { ReminderType } from "@/types/reminder";
import { reminderFormSchema, ReminderFormValues } from "../schemas/reminderFormSchema";

interface UseReminderFormProps {
  customerId?: string;
  vehicleId?: string;
  onSuccess?: () => void;
}

export function useReminderForm({ customerId, vehicleId, onSuccess }: UseReminderFormProps) {
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

  return {
    form,
    isSubmitting,
    onSubmit
  };
}
