
import React, { useState } from 'react';
import { Customer, CustomerNote } from '@/types/customer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, StickyNote, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface CustomerNotesTabProps {
  customer: Customer;
  notes: CustomerNote[];
  onNoteAdded?: () => void;
}

export function CustomerNotesTab({ 
  customer, 
  notes, 
  onNoteAdded 
}: CustomerNotesTabProps) {
  const [addNoteOpen, setAddNoteOpen] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Customer Notes</h3>
        <Button onClick={() => setAddNoteOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {notes.length > 0 ? (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center">
                    <StickyNote className="h-4 w-4 mr-2" />
                    {note.title || 'Customer Note'}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {note.priority && (
                      <Badge className={getPriorityColor(note.priority)}>
                        {note.priority}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(note.created_at)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">
                  {note.content || note.note}
                </p>
                {note.category && (
                  <div className="mt-3">
                    <Badge variant="secondary">{note.category}</Badge>
                  </div>
                )}
                {note.created_by_name && (
                  <div className="mt-3 text-sm text-gray-600">
                    Created by: {note.created_by_name}
                  </div>
                )}
                {note.tags && note.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {note.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <StickyNote className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Notes</h3>
            <p className="text-gray-500 text-center mb-6">
              No notes have been added for this customer yet.
            </p>
            <Button onClick={() => setAddNoteOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Note
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
