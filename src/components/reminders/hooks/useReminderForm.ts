
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { createReminder } from "@/services/reminderService";
import { ReminderType, ReminderPriority, RecurrenceUnit, ReminderCategory, CreateReminderParams } from "@/types/reminder";
import { reminderFormSchema, reminderFormSchemaWithValidation, ReminderFormValues } from "../schemas/reminderFormSchema";

interface UseReminderFormProps {
  customerId?: string;
  vehicleId?: string;
  onSuccess?: () => void;
  categories?: ReminderCategory[];
}

export function useReminderForm({ customerId, vehicleId, onSuccess, categories = [] }: UseReminderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with default values
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema), // Using the basic schema for form validation
    defaultValues: {
      customerId: customerId || "",
      vehicleId: vehicleId || "",
      type: "service",
      title: "",
      description: "",
      notes: "",
      priority: "medium",
      isRecurring: false,
      tagIds: [],
      categories,
    },
  });

  const onSubmit = async (values: ReminderFormValues) => {
    // Validate recurring fields if recurring is enabled
    if (values.isRecurring && (!values.recurrenceInterval || !values.recurrenceUnit)) {
      toast({
        title: "Validation Error",
        description: "Recurrence interval and unit are required for recurring reminders.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formattedDate = format(values.dueDate, "yyyy-MM-dd");
      
      const reminderParams: CreateReminderParams = {
        customerId: values.customerId,
        vehicleId: values.vehicleId,
        type: values.type as ReminderType,
        title: values.title,
        description: values.description || "",
        dueDate: formattedDate,
        notes: values.notes,
        
        // New advanced properties
        priority: values.priority as ReminderPriority,
        categoryId: values.categoryId,
        assignedTo: values.assignedTo,
        templateId: values.templateId,
        isRecurring: values.isRecurring,
        recurrenceInterval: values.recurrenceInterval,
        recurrenceUnit: values.recurrenceUnit as RecurrenceUnit | undefined,
        tagIds: values.tagIds,
      };
      
      await createReminder(reminderParams);
      
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
