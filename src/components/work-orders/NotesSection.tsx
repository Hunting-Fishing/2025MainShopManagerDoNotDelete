
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StickyNote } from "lucide-react";

interface NotesSectionProps {
  notes: string;
}

export function NotesSection({ notes }: NotesSectionProps) {
  return (
    <Card>
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
