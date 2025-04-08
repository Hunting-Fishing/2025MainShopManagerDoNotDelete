
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ArrowLeft, Save, Plus, FileText } from "lucide-react";
import { formCategories } from "@/data/formTemplatesData";
import { FormSectionEditor, createNewSection } from '@/components/forms/builder/FormSectionEditor';
import { FormBuilderTemplate, FormBuilderSection } from '@/types/formBuilder';
import { saveFormTemplate, getFormTemplate } from '@/services/formBuilderService';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export default function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewTemplate = !id || id === 'new';
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const emptyTemplate: FormBuilderTemplate = {
    id: 'new',
    name: '',
    description: '',
    category: '',
    isPublished: false,
    version: 1,
    sections: []
  };
  
  const [template, setTemplate] = useState<FormBuilderTemplate>(emptyTemplate);

  useEffect(() => {
    if (!isNewTemplate) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    if (!id) return;
    
    setLoading(true);
    
    try {
      const templateData = await getFormTemplate(id);
      if (templateData) {
        setTemplate(templateData);
      } else {
        // Handle template not found
        toast.error("Form template not found");
        navigate('/forms');
      }
    } catch (error) {
      toast.error("Failed to load form template");
      console.error("Error loading template:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!template.name || !template.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (template.sections.length === 0) {
      toast.error("Add at least one section to your form");
      return;
    }
    
    setSaving(true);
    
    try {
      const savedTemplate = await saveFormTemplate(template);
      if (savedTemplate) {
        toast.success("Form template saved successfully");
        
        // If this was a new template, redirect to edit page with real ID
        if (isNewTemplate && savedTemplate.id) {
          navigate(`/forms/${savedTemplate.id}`);
        } else {
          setTemplate(savedTemplate);
        }
      } else {
        toast.error("Failed to save form template");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
      console.error("Error saving template:", error);
    } finally {
      setSaving(false);
    }
  };
  
  const handlePublish = async () => {
    setTemplate(prev => ({
      ...prev,
      isPublished: true
    }));
    
    await handleSave();
  };

  const handleInputChange = (
    key: keyof FormBuilderTemplate,
    value: string | boolean | FormBuilderSection[]
  ) => {
    setTemplate({
      ...template,
      [key]: value
    });
  };

  const addSection = () => {
    const newSection = createNewSection(
      template.id, 
      template.sections.length
    );
    
    handleInputChange('sections', [...template.sections, newSection]);
  };

  const updateSection = (updatedSection: FormBuilderSection) => {
    const newSections = template.sections.map(section => 
      section.id === updatedSection.id ? updatedSection : section
    );
    
    handleInputChange('sections', newSections);
  };

  const deleteSection = (sectionId: string) => {
    const newSections = template.sections.filter(section => 
      section.id !== sectionId
    );
    
    // Update display order
    const reorderedSections = newSections.map((section, index) => ({
      ...section,
      displayOrder: index
    }));
    
    handleInputChange('sections', reorderedSections);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(template.sections);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    
    // Update display order
    const reorderedItems = items.map((section, index) => ({
      ...section,
      displayOrder: index
    }));
    
    handleInputChange('sections', reorderedItems);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading form builder...</p>
        </div>
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
              {isNewTemplate ? "Create Form Template" : `Edit Form: ${template.name}`}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isNewTemplate 
                ? "Create a custom form for your business" 
                : "Modify your existing form template"
              }
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isNewTemplate && template.isPublished && (
            <Button variant="outline" disabled>
              Published
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? "Edit Mode" : "Preview"}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" /> 
            {saving ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <div className="bg-white p-6 rounded-lg border shadow">
          <h2 className="text-2xl font-bold mb-4">{template.name}</h2>
          {template.description && (
            <p className="text-gray-600 mb-6">{template.description}</p>
          )}
          
          {template.sections.map((section, index) => (
            <div key={section.id} className="mb-8">
              <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
              {section.description && (
                <p className="text-gray-600 mb-4">{section.description}</p>
              )}
              
              <div className="space-y-4 border-l-2 border-gray-200 pl-4">
                {section.fields.map((field, fieldIndex) => (
                  <div key={field.id} className="space-y-1">
                    <Label className="flex items-center">
                      {field.label}
                      {field.isRequired && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    
                    {field.fieldType === 'text' && (
                      <Input placeholder={field.placeholder || ''} />
                    )}
                    
                    {field.fieldType === 'textarea' && (
                      <Textarea placeholder={field.placeholder || ''} rows={3} />
                    )}
                    
                    {field.fieldType === 'select' && (
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder || 'Select an option'} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option, i) => (
                            <SelectItem key={i} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {field.fieldType === 'checkbox' && field.options && (
                      <div className="space-y-2">
                        {field.options.map((option, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <input type="checkbox" id={`${field.id}-${i}`} />
                            <Label htmlFor={`${field.id}-${i}`}>
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {field.fieldType === 'radio' && field.options && (
                      <div className="space-y-2">
                        {field.options.map((option, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id={`${field.id}-${i}`}
                              name={`radio-${field.id}`} 
                            />
                            <Label htmlFor={`${field.id}-${i}`}>
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {field.helpText && (
                      <p className="text-xs text-gray-500">{field.helpText}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {template.sections.length === 0 && (
            <div className="text-center p-8 border border-dashed rounded">
              <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p>No form sections added yet. Switch to Edit Mode to build your form.</p>
            </div>
          )}
          
          <div className="mt-6">
            <Button>Submit Form</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Form Name *</Label>
                  <Input 
                    id="name" 
                    value={template.name} 
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter form name" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={template.description || ''} 
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter form description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={template.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger id="category">
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
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Form Builder</CardTitle>
                  <CardDescription>
                    Add sections and fields to your form
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={addSection}>
                  <Plus className="h-4 w-4 mr-2" /> Add Section
                </Button>
              </CardHeader>
              <CardContent>
                {template.sections.length === 0 ? (
                  <div className="text-center p-8 border border-dashed rounded">
                    <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-4">No form sections added yet</p>
                    <Button onClick={addSection}>
                      <Plus className="h-4 w-4 mr-1" /> Add Your First Section
                    </Button>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="form-sections">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-6"
                        >
                          {template.sections
                            .sort((a, b) => a.displayOrder - b.displayOrder)
                            .map((section, index) => (
                              <Draggable 
                                key={section.id} 
                                draggableId={section.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <FormSectionEditor
                                      section={section}
                                      onUpdate={updateSection}
                                      onDelete={() => deleteSection(section.id)}
                                      isExpanded={true}
                                      isDragging={snapshot.isDragging}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Form Status</Label>
                    <p className="text-sm text-muted-foreground">
                      {template.isPublished 
                        ? "Your form is published and available for use" 
                        : "Your form is in draft mode"
                      }
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label>{template.isPublished ? 'Published' : 'Draft'}</Label>
                    <Switch
                      checked={template.isPublished}
                      onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                    />
                  </div>
                </div>
                
                {!isNewTemplate && (
                  <div>
                    <Label className="text-base">Version</Label>
                    <div className="mt-2">
                      <span className="text-lg font-semibold">{template.version}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Template"}
                </Button>
                
                {!template.isPublished && (
                  <Button 
                    onClick={handlePublish}
                    disabled={saving}
                    variant="outline" 
                    className="w-full"
                  >
                    Save & Publish
                  </Button>
                )}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setPreviewMode(true)}
                >
                  Preview Form
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
