
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';

interface JobLineSelectorProps {
  form: UseFormReturn<WorkOrderPartFormValues>;
  jobLines: WorkOrderJobLine[];
}

export function JobLineSelector({ form, jobLines }: JobLineSelectorProps) {
  return (
    <FormField
      control={form.control}
      name="job_line_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Job Line (Optional)</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select job line..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No job line</SelectItem>
                {jobLines.map((jobLine) => (
                  <SelectItem key={jobLine.id} value={jobLine.id}>
                    {jobLine.name}
                    {jobLine.category && ` (${jobLine.category})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
