
import React, { useState } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Phone, Mail, MessageSquare, Calendar, User } from 'lucide-react';

interface WorkOrderCommunicationsProps {
  workOrder: WorkOrder;
}

// Mock communications data
const mockCommunications = [
  {
    id: '1',
    type: 'phone',
    direction: 'outbound',
    contact: 'John Smith',
    subject: 'Service appointment confirmation',
    timestamp: '2024-01-15T10:30:00Z',
    duration: '00:05:23',
    status: 'completed',
    notes: 'Confirmed appointment for brake service. Customer will drop off vehicle at 9 AM.'
  },
  {
    id: '2',
    type: 'email',
    direction: 'inbound',
    contact: 'john.smith@email.com',
    subject: 'Question about estimate',
    timestamp: '2024-01-14T16:45:00Z',
    status: 'responded',
    notes: 'Customer inquired about brake pad replacement cost. Estimate sent via email.'
  },
  {
    id: '3',
    type: 'sms',
    direction: 'outbound',
    contact: '+1 (555) 123-4567',
    subject: 'Work order status update',
    timestamp: '2024-01-14T14:20:00Z',
    status: 'delivered',
    notes: 'Sent SMS notification that vehicle inspection is complete and ready for pickup.'
  }
];

export function WorkOrderCommunications({ workOrder }: WorkOrderCommunicationsProps) {
  const [communications] = useState(mockCommunications);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'phone': return 'bg-blue-100 text-blue-800';
      case 'email': return 'bg-green-100 text-green-800';
      case 'sms': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'delivered': case 'responded': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Communications</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {communications.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No communications recorded yet
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-2 font-medium">TYPE</th>
                  <th className="text-left p-2 font-medium">CONTACT</th>
                  <th className="text-left p-2 font-medium">SUBJECT</th>
                  <th className="text-left p-2 font-medium">TIMESTAMP</th>
                  <th className="text-center p-2 font-medium">STATUS</th>
                  <th className="text-left p-2 font-medium">NOTES</th>
                </tr>
              </thead>
              <tbody>
                {communications.map((comm, index) => (
                  <tr key={comm.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(comm.type)}
                        <Badge className={`text-xs ${getTypeColor(comm.type)}`}>
                          {comm.type}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-gray-500" />
                        <span className="font-medium text-gray-900">{comm.contact}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <span className="text-gray-900">{comm.subject}</span>
                      {comm.duration && (
                        <div className="text-xs text-gray-500 mt-1">Duration: {comm.duration}</div>
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {formatTimestamp(comm.timestamp)}
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <Badge 
                        className={`text-xs ${getStatusColor(comm.status)}`}
                      >
                        {comm.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <span className="text-xs text-gray-600 truncate max-w-xs block">
                        {comm.notes}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
