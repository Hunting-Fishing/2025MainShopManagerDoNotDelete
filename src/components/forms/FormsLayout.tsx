
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormTemplatesList } from './FormTemplatesList';
import { FormUploads } from './FormUploads';

interface FormsLayoutProps {
  formId?: string;
}

export function FormsLayout({ formId = 'default' }: FormsLayoutProps) {
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Forms Management</h1>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Form Templates</TabsTrigger>
          <TabsTrigger value="uploads">File Uploads</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="mt-6">
          <FormTemplatesList />
        </TabsContent>
        
        <TabsContent value="uploads" className="mt-6">
          <FormUploads formId={formId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
