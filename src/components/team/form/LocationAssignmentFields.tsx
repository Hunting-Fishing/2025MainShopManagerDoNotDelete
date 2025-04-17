
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { TeamMemberFormValues } from "./formValidation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface LocationAssignmentFieldsProps {
  control: Control<TeamMemberFormValues>;
}

export function LocationAssignmentFields({ control }: LocationAssignmentFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="primary_location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary Location</FormLabel>
            <FormControl>
              <Input placeholder="Enter primary location..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="work_at_other_locations"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Allowed to Work at Other Locations</FormLabel>
              <FormDescription>
                This team member can be assigned to work at locations other than their primary one
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
