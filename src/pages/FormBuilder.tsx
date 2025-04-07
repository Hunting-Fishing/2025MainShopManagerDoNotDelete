
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Save, FilePlus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function FormBuilder() {
  const navigate = useNavigate();
  const [formType, setFormType] = useState("inspection");
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/forms')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Form Builder</h1>
            <p className="text-muted-foreground mt-1">
              Create a custom form for your business
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button onClick={() => {
            toast.success("Form template created successfully!");
            navigate('/forms');
          }}>
            Create Form
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Form Name</Label>
                <Input id="name" placeholder="Enter form name" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter form description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Form Type</Label>
                <Tabs defaultValue={formType} onValueChange={setFormType} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="inspection">Vehicle Inspection</TabsTrigger>
                    <TabsTrigger value="intake">Customer Intake</TabsTrigger>
                    <TabsTrigger value="custom">Custom Form</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {formType === "inspection" && (
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Inspection Form</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Our pre-built vehicle inspection form includes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Vehicle identification section</li>
                    <li>Exterior inspection checklist</li>
                    <li>Interior inspection checklist</li>
                    <li>Engine bay inspection</li>
                    <li>Tire and suspension assessment</li>
                    <li>Photo upload capabilities</li>
                    <li>Notes fields for each section</li>
                  </ul>
                  <div className="pt-4">
                    <Button onClick={() => navigate('/vehicle-inspection')}>
                      Use Vehicle Inspection Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {formType === "intake" && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Intake Form</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Our pre-built customer intake form includes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Customer contact information</li>
                    <li>Vehicle details and history</li>
                    <li>Service requirements</li>
                    <li>Authorization for work</li>
                    <li>Terms and conditions section</li>
                    <li>Electronic signature field</li>
                    <li>Custom branding options</li>
                  </ul>
                  <div className="pt-4">
                    <Button onClick={() => navigate('/forms')}>
                      Use Customer Intake Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {formType === "custom" && (
            <Card>
              <CardHeader>
                <CardTitle>Custom Form Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-dashed rounded-md p-6 mt-4 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Form Builder Coming Soon</h3>
                  <p className="text-muted-foreground mb-4">
                    Our drag-and-drop form builder will be available in the next update.
                  </p>
                  <Button variant="outline" onClick={() => setFormType("inspection")}>
                    <FilePlus className="h-4 w-4 mr-2" /> Use Template Instead
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="e.g., Vehicle, Customer, Maintenance" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" placeholder="e.g., inspection, vehicle, required" />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="required" className="h-4 w-4 rounded border-gray-300" />
                <Label htmlFor="required" className="text-sm font-normal">Required for all customers</Label>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Form Preview</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-6">
              <Button variant="outline" onClick={() => navigate('/vehicle-inspection')}>
                Preview Form
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
