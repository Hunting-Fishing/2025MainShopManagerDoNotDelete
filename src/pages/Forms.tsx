
import React, { useState } from 'react';
import { Container, Segment, Header as SemanticHeader } from "semantic-ui-react";
import { FormsLayout } from "@/components/forms/FormsLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllCustomerForms } from "@/components/customers/forms/AllCustomerForms";

export default function Forms() {
  const [activeTab, setActiveTab] = useState("templates");
  
  return (
    <Container fluid className="px-4 py-8">
      <Segment raised className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border-t-4 border-t-blue-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <SemanticHeader as="h1" className="text-3xl font-bold">Forms Management</SemanticHeader>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Create, manage, and organize service forms and templates
            </p>
          </div>
          <Button asChild variant="outline" className="self-start">
            <Link to="/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </Segment>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="customer">Customer Forms</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates">
            <FormsLayout />
          </TabsContent>
          
          <TabsContent value="customer">
            <AllCustomerForms />
          </TabsContent>
          
          <TabsContent value="categories">
            <div className="space-y-4">
              <p>Form categories management will go here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}
