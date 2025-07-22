import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Plus, User, AlertCircle } from "lucide-react";

export const EnhancedSupportTicketManager: React.FC = () => {
  const mockTickets = [
    {
      id: '1',
      ticket_number: 'TKT-2024-001000',
      subject: 'Cannot access work order reports',
      description: 'Unable to access reports section',
      status: 'open',
      priority: 'high',
      customer_name: 'John Smith',
      created_at: new Date().toISOString()
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Support Tickets</h2>
          <p className="text-muted-foreground">Manage customer support requests</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      <div className="grid gap-4">
        {mockTickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <h3 className="font-semibold">{ticket.subject}</h3>
                    <span className="text-sm text-muted-foreground">#{ticket.ticket_number}</span>
                  </div>
                  <p className="text-muted-foreground">{ticket.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {ticket.customer_name}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant="destructive">{ticket.status}</Badge>
                  <Badge variant="default">{ticket.priority}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};