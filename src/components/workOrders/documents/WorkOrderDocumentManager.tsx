
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrderSignature } from './WorkOrderSignature';
import { WorkOrderDocuments } from './WorkOrderDocuments';

interface WorkOrderDocumentManagerProps {
  workOrderId: string;
}

export function WorkOrderDocumentManager({ workOrderId }: WorkOrderDocumentManagerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents & Signatures</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="documents">
          <TabsList>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="signatures">Signatures</TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents">
            <WorkOrderDocuments workOrderId={workOrderId} />
          </TabsContent>
          
          <TabsContent value="signatures">
            <WorkOrderSignature workOrderId={workOrderId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
