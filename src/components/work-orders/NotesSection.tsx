import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StickyNote } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { WorkOrderFormValues } from "@/hooks/useWorkOrderForm";
import { WorkOrderFormFieldValues } from "@/components/work-orders/WorkOrderFormFields";

interface NotesSectionBaseProps {
  className?: string;
}

interface NotesSectionStringProps extends NotesSectionBaseProps {
  notes: string;
  form?: never;
}

interface NotesSectionFormProps extends NotesSectionBaseProps {
  form: UseFormReturn<WorkOrderFormValues | WorkOrderFormFieldValues>;
  notes?: never;
}

export type NotesSectionProps = NotesSectionStringProps | NotesSectionFormProps;

export function NotesSection({ notes, form, className }: NotesSectionProps) {
  if (form) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <StickyNote className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    placeholder="Enter any additional notes here" 
                    className="min-h-[120px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <StickyNote className="h-5 w-5 text-muted-foreground" />
        <CardTitle className="text-lg">Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {notes ? (
          <div className="whitespace-pre-wrap">{notes}</div>
        ) : (
          <div className="text-muted-foreground italic">No notes available</div>
        )}
      </CardContent>
    </Card>
  );
}
