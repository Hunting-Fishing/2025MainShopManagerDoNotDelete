
import React, { useState } from 'react';
import { FormBuilderSection, FormBuilderField } from '@/types/formBuilder';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Trash2, GripVertical, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { FormFieldEditor, createNewField } from './FormFieldEditor';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface FormSectionEditorProps {
  section: FormBuilderSection;
  onUpdate: (section: FormBuilderSection) => void;
  onDelete: () => void;
  isExpanded?: boolean;
  isDragging?: boolean;
}

export const FormSectionEditor: React.FC<FormSectionEditorProps> = ({
  section,
  onUpdate,
  onDelete,
  isExpanded: initialExpanded = true,
  isDragging
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const handleChange = (
    key: keyof FormBuilderSection,
    value: string | FormBuilderField[]
  ) => {
    onUpdate({ ...section, [key]: value });
  };

  const addField = () => {
    const newField = createNewField(section.id, section.fields.length);
    handleChange('fields', [...section.fields, newField]);
  };

  const updateField = (updatedField: FormBuilderField) => {
    const newFields = section.fields.map(field => 
      field.id === updatedField.id ? updatedField : field
    );
    handleChange('fields', newFields);
  };

  const deleteField = (fieldId: string) => {
    const newFields = section.fields.filter(field => field.id !== fieldId);
    // Update display order for remaining fields
    const reorderedFields = newFields.map((field, index) => ({
      ...field,
      displayOrder: index
    }));
    handleChange('fields', reorderedFields);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(section.fields);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    
    const reorderedItems = items.map((item, index) => ({
      ...item,
      displayOrder: index
    }));
    
    handleChange('fields', reorderedItems);
  };

  return (
    <Card className={`mb-6 border-2 ${isDragging ? 'border-blue-500 opacity-50' : 'border-gray-200'}`}>
      <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <div className="cursor-move">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <CardTitle>{section.title || 'New Section'}</CardTitle>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsExpanded(!isExpanded)} 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          
          <Button 
            onClick={onDelete} 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`section-title-${section.id}`}>Section Title</Label>
                <Input
                  id={`section-title-${section.id}`}
                  value={section.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter section title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`section-desc-${section.id}`}>Description (Optional)</Label>
                <Textarea
                  id={`section-desc-${section.id}`}
                  value={section.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter section description"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="pt-2">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Fields</h4>
                <Button 
                  onClick={addField} 
                  size="sm" 
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Field
                </Button>
              </div>
              
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId={`section-fields-${section.id}`}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {section.fields.length === 0 ? (
                        <div className="text-center p-4 border border-dashed rounded-md">
                          <p className="text-muted-foreground">
                            No fields added to this section yet
                          </p>
                          <Button 
                            onClick={addField} 
                            className="mt-2" 
                            variant="outline" 
                            size="sm"
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Field
                          </Button>
                        </div>
                      ) : (
                        section.fields
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map((field, index) => (
                            <Draggable 
                              key={field.id} 
                              draggableId={field.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <FormFieldEditor
                                    field={field}
                                    onUpdate={updateField}
                                    onDelete={() => deleteField(field.id)}
                                    isDragging={snapshot.isDragging}
                                  />
                                </div>
                              )}
                            </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </CardContent>
          
          <CardFooter className="p-4 pt-0">
            <Button 
              onClick={addField}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Field
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export const createNewSection = (templateId: string, order: number): FormBuilderSection => ({
  id: uuidv4(),
  templateId,
  title: 'New Section',
  displayOrder: order,
  fields: []
});
