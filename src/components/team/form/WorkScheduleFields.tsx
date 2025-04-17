
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { TeamMemberFormValues } from "./formValidation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WorkScheduleFieldsProps {
  control: Control<TeamMemberFormValues>;
}

const daysOfWeek = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

export function WorkScheduleFields({ control }: WorkScheduleFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="work_days"
        render={({ field }) => {
          const selectedDays = field.value || [];
          return (
            <FormItem>
              <FormLabel>Work Days</FormLabel>
              <div className="grid grid-cols-4 gap-2">
                {daysOfWeek.map((day) => (
                  <FormItem
                    key={day.id}
                    className="flex flex-row items-center space-x-2 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={selectedDays.includes(day.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...selectedDays, day.id]);
                          } else {
                            field.onChange(selectedDays.filter((d) => d !== day.id));
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{day.label}</FormLabel>
                  </FormItem>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="shift_start"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shift Start</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="shift_end"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shift End</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="on_call_after_hours"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>On Call After Hours</FormLabel>
              <FormDescription>
                This team member is available for emergency calls outside of regular hours
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
