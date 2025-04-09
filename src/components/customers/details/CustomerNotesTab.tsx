
import React, { useState } from 'react';
import { Customer, CustomerNote } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, StickyNote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AddNoteDialog } from '@/components/customers/notes/AddNoteDialog';

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

  const getNoteCategoryColor = (category: string) => {
    switch (category) {
      case 'service':
        return 'bg-blue-100 text-blue-800';
      case 'sales':
        return 'bg-green-100 text-green-800';
      case 'follow-up':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Customer Notes</h3>
        <Button onClick={() => setAddNoteOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium flex items-center">
            <StickyNote className="h-4 w-4 mr-2" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notes && notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map((note) => (
                <div 
                  key={note.id} 
                  className="p-4 rounded-md border bg-white"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getNoteCategoryColor(note.category)}>
                      <span className="capitalize">{note.category}</span>
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  
                  <p className="text-sm whitespace-pre-wrap mt-2">{note.content}</p>
                  
                  <div className="mt-2 text-xs text-right text-gray-500">
                    By {note.created_by || 'System'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                No notes have been added for this customer yet.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <AddNoteDialog
        customer={customer}
        open={addNoteOpen}
        onOpenChange={setAddNoteOpen}
        onNoteAdded={onNoteAdded}
      />
    </div>
  );
}
