
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { updateWorkOrder } from "@/utils/workOrders";
import { WorkOrder } from "@/types/workOrder";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

interface NotesSectionProps {
  workOrder?: WorkOrder;
  onNotesUpdate?: (updatedWorkOrder: WorkOrder) => void;
  form?: UseFormReturn<any>; // Add form prop as optional
}

export function NotesSection({ workOrder, onNotesUpdate, form }: NotesSectionProps) {
  // If form is provided, render the form version
  if (form) {
    return (
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Add any notes or comments about this work order"
                className="min-h-[150px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
  
  // For non-form version (detail view)
  const [notes, setNotes] = useState(workOrder?.notes || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!workOrder || notes === workOrder.notes) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const updatedWorkOrder = await updateWorkOrder({
        ...workOrder,
        notes,
        lastUpdatedAt: new Date().toISOString()
      });
      
      if (onNotesUpdate) {
        onNotesUpdate(updatedWorkOrder);
      }
      
      toast({
        title: "Notes Updated",
        description: "Work order notes have been saved",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Error",
        description: "Could not save notes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-slate-500" />
          <CardTitle className="text-lg">Notes</CardTitle>
        </div>
        {!isEditing ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
          >
            Edit Notes
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setNotes(workOrder?.notes || "");
              setIsEditing(false);
            }}
          >
            Cancel
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this work order..."
              className="min-h-[150px]"
            />
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Notes"}
            </Button>
          </div>
        ) : (
          <div className="min-h-[100px] whitespace-pre-wrap">
            {workOrder?.notes ? (
              workOrder.notes
            ) : (
              <p className="text-slate-500 italic">
                No notes have been added to this work order yet.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
