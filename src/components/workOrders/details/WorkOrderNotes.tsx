
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Plus } from "lucide-react";
import { WorkOrder } from "@/types/workOrder";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface WorkOrderNotesProps {
  workOrder: WorkOrder;
}

export function WorkOrderNotes({ workOrder }: WorkOrderNotesProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState(workOrder.notes || "");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ 
          // Make sure the notes field matches the database schema
          description: notes // Using description instead of notes
        })
        .eq('id', workOrder.id);

      if (error) throw error;

      toast({
        title: "Notes Saved",
        description: "Work order notes have been updated",
      });
      
      setEditing(false);
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-muted-foreground" />
          <CardTitle className="text-lg">Notes</CardTitle>
        </div>
        
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Edit Notes
          </Button>
        ) : (
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveNotes} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {editing ? (
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter notes about this work order..."
            className="min-h-[200px]"
          />
        ) : (
          <div className="min-h-[100px]">
            {notes ? (
              <div className="whitespace-pre-wrap">{notes}</div>
            ) : (
              <div className="text-muted-foreground text-center py-8">
                No notes have been added yet
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
