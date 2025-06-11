
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface Technician {
  id: string;
  name: string;
  jobTitle?: string;
}

interface AssignmentFieldsProps {
  form: UseFormReturn<any>;
  technicians: Technician[];
  technicianLoading: boolean;
  technicianError: string | null;
}

export function AssignmentFields({ 
  form, 
  technicians, 
  technicianLoading, 
  technicianError 
}: AssignmentFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="technician"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assigned Technician</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={
                    technicianLoading ? "Loading technicians..." : 
                    technicianError ? "Error loading technicians" :
                    "Select technician (optional)"
                  } />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="unassigned">No technician assigned</SelectItem>
                {technicians.map((technician) => (
                  <SelectItem key={technician.id} value={technician.id}>
                    {technician.name}
                    {technician.jobTitle && (
                      <span className="text-muted-foreground ml-2">
                        - {technician.jobTitle}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., Bay 1, Lift 3, etc." 
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
          <FormItem>
            <FormLabel>Due Date</FormLabel>
            <FormControl>
              <Input 
                type="date"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
