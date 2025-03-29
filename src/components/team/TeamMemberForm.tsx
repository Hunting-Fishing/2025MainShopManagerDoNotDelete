
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { availableRoles, availableDepartments } from "./form/formConstants";
import { teamMemberFormSchema, TeamMemberFormValues } from "./form/formValidation";
import { PersonalInfoFields } from "./form/PersonalInfoFields";
import { JobInfoFields } from "./form/JobInfoFields";
import { StatusToggleField } from "./form/StatusToggleField";
import { NotesField } from "./form/NotesField";
import { FormActions } from "./form/FormActions";

interface TeamMemberFormProps {
  initialData?: any;
  mode: "create" | "edit";
}

export function TeamMemberForm({ initialData, mode }: TeamMemberFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      phone: "",
      jobTitle: "",
      role: "",
      department: "",
      status: true,
      notes: "",
    },
  });

  // Form submission handler
  const onSubmit = async (values: TeamMemberFormValues) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would save to a backend
      console.log("Form values:", values);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: mode === "create" ? "Team member created!" : "Team member updated!",
        description: `Successfully ${mode === "create" ? "added" : "updated"} ${values.name}`,
      });
      
      navigate("/team");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
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
          <PersonalInfoFields control={form.control} />
          <JobInfoFields 
            control={form.control}
            availableRoles={availableRoles}
            availableDepartments={availableDepartments}
          />
        </div>

        <StatusToggleField control={form.control} />
        <NotesField control={form.control} />
        <FormActions isSubmitting={isSubmitting} mode={mode} />
      </form>
    </Form>
  );
}
