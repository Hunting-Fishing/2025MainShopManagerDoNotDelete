
import React, { useState } from 'react';
import { Customer, CustomerCommunication } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Mail, Phone, MessageSquare, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AddCommunicationDialog } from '@/components/customers/communications/AddCommunicationDialog';

interface CustomerCommunicationsTabProps {
  customer: Customer;
  communications: CustomerCommunication[];
  onCommunicationAdded?: () => void;
}

export function CustomerCommunicationsTab({ 
  customer, 
  communications, 
  onCommunicationAdded 
}: CustomerCommunicationsTabProps) {
  const [addCommunicationOpen, setAddCommunicationOpen] = useState(false);

  const getCommunicationTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'text':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <UserRound className="h-4 w-4" />;
    }
  };

  const getCommunicationColorClass = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'phone':
        return 'bg-green-100 text-green-800';
      case 'text':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDirectionClass = (direction: string) => {
    return direction === 'incoming' ? 'border-l-4 border-blue-500' : 'border-l-4 border-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Customer Communications</h3>
        <Button onClick={() => setAddCommunicationOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Communication
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium">Communication History</CardTitle>
        </CardHeader>
        <CardContent>
          {communications && communications.length > 0 ? (
            <div className="space-y-4">
              {communications.map((comm) => (
                <div 
                  key={comm.id} 
                  className={`p-4 rounded-md border ${getDirectionClass(comm.direction)} bg-white`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getCommunicationColorClass(comm.type)}>
                        <span className="flex items-center">
                          {getCommunicationTypeIcon(comm.type)}
                          <span className="ml-1 capitalize">{comm.type}</span>
                        </span>
                      </Badge>
                      <Badge variant="outline">
                        {comm.direction === 'incoming' ? 'Received' : 'Sent'}
                      </Badge>
                      <Badge variant={comm.status === 'completed' ? 'default' : comm.status === 'failed' ? 'destructive' : 'outline'}>
                        {comm.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(new Date(comm.date), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  
                  {comm.subject && (
                    <h4 className="font-medium mb-1">{comm.subject}</h4>
                  )}
                  
                  <p className="text-sm whitespace-pre-wrap">{comm.content}</p>
                  
                  <div className="mt-2 text-xs text-right text-gray-500">
                    By {comm.staff_member_name || 'Unknown Staff'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                No communications have been recorded for this customer yet.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <AddCommunicationDialog
        customer={customer}
        open={addCommunicationOpen}
        onOpenChange={setAddCommunicationOpen}
        onCommunicationAdded={onCommunicationAdded}
      />
    </div>
  );
}
