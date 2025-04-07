
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FormsLayout } from "@/components/forms/FormsLayout";
import { FileText, FilePlus, Clipboard, FileEdit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";

export default function Forms() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
          <p className="text-muted-foreground mt-1">
            Create, manage, and customize form templates for your business
          </p>
        </div>
        <Button 
          onClick={() => navigate('/forms/create')}
          className="flex items-center gap-1"
        >
          <FilePlus className="h-4 w-4" /> 
          <span>Create Template</span>
        </Button>
      </div>

      {/* Featured Templates Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Featured Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="overflow-hidden border-purple-100 transition-all hover:shadow-md">
            <div className="h-2 bg-gradient-to-r from-purple-400 to-blue-400"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Clipboard className="h-5 w-5 mr-2 text-purple-500" />
                  Vehicle Inspection Form
                </CardTitle>
              </div>
              <CardDescription>
                Comprehensive vehicle inspection checklist
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                A detailed multi-section inspection form with exterior, interior, engine, and tire checks.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate('/forms/create')}
                >
                  <FileEdit className="h-4 w-4 mr-2" /> Customize
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => navigate('/vehicle-inspection')}
                >
                  <FileText className="h-4 w-4 mr-2" /> Use Template
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-blue-100 transition-all hover:shadow-md">
            <div className="h-2 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Clipboard className="h-5 w-5 mr-2 text-blue-500" />
                  Customer Intake Form
                </CardTitle>
              </div>
              <CardDescription>
                New customer onboarding form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Collect customer information, vehicle details, service history, and preferences.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate('/forms/create')}
                >
                  <FileEdit className="h-4 w-4 mr-2" /> Customize
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    toast.info("Coming soon! Use the Vehicle Inspection form for now.");
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" /> Use Template
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-teal-100 transition-all hover:shadow-md">
            <div className="h-2 bg-gradient-to-r from-teal-400 to-green-400"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Clipboard className="h-5 w-5 mr-2 text-teal-500" />
                  Repair Authorization
                </CardTitle>
              </div>
              <CardDescription>
                Service approval and authorization form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Get customer approval for repairs with cost estimates and service details.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate('/forms/create')}
                >
                  <FileEdit className="h-4 w-4 mr-2" /> Customize
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    toast.info("Coming soon! Use the Vehicle Inspection form for now.");
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" /> Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <FormsLayout />
    </div>
  );
}
