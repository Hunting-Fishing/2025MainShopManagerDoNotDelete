
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { formTemplates, formCategories } from "@/data/formTemplatesData";
import { FormTemplate } from "@/types/form";

export default function FormEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewTemplate = !id || id === 'create';
  
  const emptyTemplate: FormTemplate = {
    id: "",
    name: "",
    description: "",
    category: "",
    content: { sections: [] },
    created_by: "Current User", // This would come from auth context in a real app
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
    is_published: false
  };
  
  const [template, setTemplate] = useState<FormTemplate>(emptyTemplate);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isNewTemplate) {
      const foundTemplate = formTemplates.find(t => t.id === id);
      if (foundTemplate) {
        setTemplate(foundTemplate);
      } else {
        // Handle template not found
        navigate('/forms');
      }
    }
  }, [id, navigate, isNewTemplate]);

  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      navigate('/forms');
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTemplate({
      ...template,
      [e.target.name]: e.target.value,
      updated_at: new Date().toISOString()
    });
  };

  const handleCategoryChange = (value: string) => {
    setTemplate({
      ...template,
      category: value,
      updated_at: new Date().toISOString()
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/forms')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNewTemplate ? "Create Form Template" : "Edit Form Template"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isNewTemplate 
              ? "Create a new form template for your business" 
              : `Editing "${template.name}" template`
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={template.name} 
                  onChange={handleInputChange} 
                  placeholder="Enter template name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={template.description} 
                  onChange={handleInputChange} 
                  placeholder="Enter template description"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={template.category} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {formCategories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The form builder will be implemented here. This would include draggable form elements, 
                sections, and the ability to configure fields.
              </p>
              <div className="border border-dashed rounded-md p-6 mt-4 text-center">
                <p className="text-muted-foreground">
                  Form builder component will go here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Template Status</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className={`h-3 w-3 rounded-full ${template.is_published ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <span>{template.is_published ? 'Published' : 'Draft'}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-base">Version</Label>
                  <div className="mt-2">
                    <span>{template.version}</span>
                  </div>
                </div>
                
                {!isNewTemplate && (
                  <>
                    <div>
                      <Label className="text-base">Created</Label>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {new Date(template.created_at).toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-base">Last Modified</Label>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {new Date(template.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleSave}
                disabled={isSaving || !template.name}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Template"}
              </Button>
              
              {!isNewTemplate && template.is_published && (
                <Button variant="outline" className="w-full">
                  Unpublish
                </Button>
              )}
              
              {!isNewTemplate && !template.is_published && (
                <Button variant="outline" className="w-full">
                  Publish
                </Button>
              )}
              
              <Button variant="outline" className="w-full">
                Preview
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
