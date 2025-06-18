
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { WORK_ORDER_STATUSES } from "@/data/workOrderConstants";

interface StatusFieldsProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
}

export const StatusFields: React.FC<StatusFieldsProps> = ({ form }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-900">Status & Priority</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Field */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium">Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border-slate-200 shadow-lg">
                  {WORK_ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value} className="hover:bg-slate-50 focus:bg-slate-100 text-slate-900">
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Priority Field */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium">Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border-slate-200 shadow-lg">
                  <SelectItem value="low" className="hover:bg-slate-50 focus:bg-slate-100 text-slate-900">Low</SelectItem>
                  <SelectItem value="medium" className="hover:bg-slate-50 focus:bg-slate-100 text-slate-900">Medium</SelectItem>
                  <SelectItem value="high" className="hover:bg-slate-50 focus:bg-slate-100 text-slate-900">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
