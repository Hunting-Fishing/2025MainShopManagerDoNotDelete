
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { TeamMemberFormValues } from "./formValidation";
import { useEffect, useState } from "react";
import { roleJobTitleMap, defaultJobTitles } from "./roleJobTitleData";

interface JobInfoFieldsProps {
  control: Control<TeamMemberFormValues>;
  availableRoles: string[];
  availableDepartments: string[];
}

export function JobInfoFields({ control, availableRoles, availableDepartments }: JobInfoFieldsProps) {
  const [availableJobTitles, setAvailableJobTitles] = useState<string[]>(defaultJobTitles);
  
  // Get the current role value from the form
  const currentRole = control._formValues.role as string;
  
  // Update job titles when role changes
  useEffect(() => {
    if (currentRole && roleJobTitleMap[currentRole]) {
      setAvailableJobTitles(roleJobTitleMap[currentRole]);
    } else {
      setAvailableJobTitles(defaultJobTitles);
    }
  }, [currentRole]);

  return (
    <>
      <FormField
        control={control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                // Update available job titles when role changes
                if (roleJobTitleMap[value]) {
                  setAvailableJobTitles(roleJobTitleMap[value]);
                } else {
                  setAvailableJobTitles(defaultJobTitles);
                }
              }} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              This will determine the user's permissions in the system
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="jobTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job Title</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job title" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableJobTitles.map((title) => (
                  <SelectItem key={title} value={title}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Department</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableDepartments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
