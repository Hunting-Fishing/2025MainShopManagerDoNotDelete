
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, Printer } from "lucide-react";
import { formTemplates } from "@/data/formTemplatesData";
import { FormTemplate } from "@/types/form";

export default function FormPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<FormTemplate | null>(null);

  useEffect(() => {
    if (id) {
      const foundTemplate = formTemplates.find(t => t.id === id);
      if (foundTemplate) {
        setTemplate(foundTemplate);
      } else {
        navigate('/forms');
      }
    }
  }, [id, navigate]);

  if (!template) {
    return (
      <div className="container mx-auto py-6">
        <p>Loading...</p>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold tracking-tight">
              {template.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {template.category} · Version {template.version}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/forms/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{template.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p>{template.description}</p>
            
            {template.content.sections?.map((section: any, index: number) => (
              <div key={index} className="mt-6">
                <h3>{section.title}</h3>
                {section.description && <p>{section.description}</p>}
                
                <div className="space-y-4 mt-4">
                  {section.fields?.map((field: any, fieldIndex: number) => (
                    <div key={fieldIndex} className="border p-4 rounded-md">
                      <div className="font-medium mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Type: {field.type}
                        {field.options && (
                          <div>
                            Options: {field.options.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
