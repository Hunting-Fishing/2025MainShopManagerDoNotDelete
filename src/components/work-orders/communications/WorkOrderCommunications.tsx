
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Phone, Mail } from 'lucide-react';

interface WorkOrderCommunicationsProps {
  workOrder: WorkOrder;
}

export function WorkOrderCommunications({ workOrder }: WorkOrderCommunicationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Customer Communications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Phone className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-medium">Phone</h3>
              <p className="text-sm text-muted-foreground">
                {workOrder.customer_phone || 'No phone number'}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Mail className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-medium">Email</h3>
              <p className="text-sm text-muted-foreground">
                {workOrder.customer_email || 'No email address'}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-medium">Messages</h3>
              <p className="text-sm text-muted-foreground">No messages yet</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Recent Activity</h4>
            <div className="text-sm text-muted-foreground">
              <p>No recent communication activity</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
