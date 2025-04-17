
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { TeamMemberFormValues } from "./formValidation";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface SystemAccessFieldsProps {
  control: Control<TeamMemberFormValues>;
  teamMemberId?: string;
}

export function SystemAccessFields({ control, teamMemberId }: SystemAccessFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="admin_privileges"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Admin Privileges</FormLabel>
              <FormDescription>
                Grant administrative access to system settings and configuration
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="access_financials"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Access to Financials</FormLabel>
              <FormDescription>
                Allow access to financial reports, invoices and payment information
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="can_create_work_orders"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Can Create Work Orders</FormLabel>
              <FormDescription>
                Ability to create new work orders in the system
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="can_close_jobs"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Can Close Jobs</FormLabel>
              <FormDescription>
                Authorization to mark work orders as complete and finalized
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {teamMemberId && (
        <Button variant="outline" asChild className="w-full mt-4">
          <Link to={`/team/${teamMemberId}/permissions`}>
            Set Custom Permissions
          </Link>
        </Button>
      )}
    </div>
  );
}
