
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FormsLayout } from "@/components/forms/FormsLayout";
import { FileText, FilePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

      <FormsLayout />
    </div>
  );
}
