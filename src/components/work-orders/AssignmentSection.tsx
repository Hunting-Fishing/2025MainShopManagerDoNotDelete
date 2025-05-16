
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "@/hooks/useWorkOrderForm";

interface Technician {
  id: string;
  name: string;
  jobTitle?: string;
}

interface AssignmentSectionProps {
  form: UseFormReturn<WorkOrderFormValues>;
  technicians: Technician[];
  isLoading?: boolean;
}

export const AssignmentSection: React.FC<AssignmentSectionProps> = ({ 
  form,
  technicians,
  isLoading = false
}) => {
  // Convert string date to Date object for the calendar
  const getDueDateValue = () => {
    const dateValue = form.watch("dueDate");
    if (typeof dateValue === 'string') {
      return new Date(dateValue);
    }
    return dateValue as Date;
  };

  // Handle date selection and convert back to string
  const handleDateSelection = (date: Date | undefined) => {
    if (date) {
      form.setValue("dueDate", date.toISOString().split('T')[0]);
    }
  };

  return (
    <>
      {/* Technician Field */}
      <FormField
        control={form.control}
        name="technician"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assigned Technician</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // Also set the technician for backward compatibility
                form.setValue("technician", value);
              }}
              defaultValue={field.value}
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Loading..." : "Assign technician"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {technicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}{tech.jobTitle ? ` (${tech.jobTitle})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Due Date Field */}
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
                      format(
                        typeof field.value === 'string'
                          ? new Date(field.value)
                          : field.value,
                        "PPP"
                      )
                    ) : (
                      <span>Select a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={getDueDateValue()}
                  onSelect={handleDateSelection}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
