
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { TeamMemberFormValues } from "./formValidation";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { defaultJobTitles, roleJobTitleMap } from "./jobTitleData";

interface JobInfoFieldsProps {
  control: Control<TeamMemberFormValues>;
  availableRoles: string[];
  availableDepartments: string[];
  isLoading?: boolean;
}

export function JobInfoFields({ 
  control, 
  availableRoles, 
  availableDepartments,
  isLoading = false 
}: JobInfoFieldsProps) {
  const [jobTitles, setJobTitles] = useState<string[]>(defaultJobTitles);
  const currentRole = control._formValues.role;
  
  // Update job titles when role changes
  useEffect(() => {
    if (currentRole && roleJobTitleMap[currentRole]) {
      setJobTitles(roleJobTitleMap[currentRole]);
    } else {
      setJobTitles(defaultJobTitles);
    }
  }, [currentRole]);
  
  if (isLoading) {
    return (
      <>
        <Skeleton className="h-10 w-full mb-6" />
        <Skeleton className="h-10 w-full mb-6" />
        <Skeleton className="h-10 w-full" />
      </>
    );
  }

  return (
    <>
      <FormField
        control={control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value || ""}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role || "unspecified"}>
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
              value={field.value || ""}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job title" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {jobTitles.map((title) => (
                  <SelectItem key={title} value={title || "unspecified"}>
                    {title || "Unspecified Title"}
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
              value={field.value || ""} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableDepartments.map((department) => (
                  <SelectItem key={department} value={department || "unspecified"}>
                    {department || "Unspecified Department"}
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
