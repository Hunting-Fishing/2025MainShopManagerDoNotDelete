
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
import { useEmailTemplates } from "@/hooks/email/useEmailTemplates";
import { EmailSequence, EmailSequenceStep, EmailTemplate } from "@/types/email";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Clock, 
  Mail,
  Save,
  X,
  ArrowRight,
  Edit
} from "lucide-react";

interface EmailSequenceEditorProps {
  sequence?: EmailSequence;
  onSave: (sequence: Partial<EmailSequence>) => Promise<EmailSequence | null>;
  onCancel?: () => void;
}

export function EmailSequenceEditor({ 
  sequence, 
  onSave,
  onCancel 
}: EmailSequenceEditorProps) {
  const [name, setName] = useState(sequence?.name || "");
  const [description, setDescription] = useState(sequence?.description || "");
  const [triggerType, setTriggerType] = useState(sequence?.triggerType || "manual");
  const [triggerEvent, setTriggerEvent] = useState(sequence?.triggerEvent || "");
  const [isActive, setIsActive] = useState(sequence?.isActive || false);
  const [steps, setSteps] = useState<EmailSequenceStep[]>(sequence?.steps || []);
  const [activeTab, setActiveTab] = useState("details");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteStepDialogOpen, setIsDeleteStepDialogOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<EmailSequenceStep | null>(null);

  const { templates, loading: templatesLoading } = useEmailTemplates();
  
  // Set up form when sequence changes
  useEffect(() => {
    if (sequence) {
      setName(sequence.name);
      setDescription(sequence.description || "");
      setTriggerType(sequence.triggerType);
      setTriggerEvent(sequence.triggerEvent || "");
      setIsActive(sequence.isActive);
      setSteps(sequence.steps || []);
    }
  }, [sequence]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Ensure steps have proper position values
      const updatedSteps = steps.map((step, index) => ({
        ...step,
        position: index + 1
      }));

      const sequenceData: Partial<EmailSequence> = {
        name,
        description,
        triggerType: triggerType as 'manual' | 'event' | 'schedule',
        triggerEvent: triggerType === 'event' ? triggerEvent : undefined,
        isActive,
        steps: updatedSteps
      };

      await onSave(sequenceData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStep = () => {
    // Create a new step with default values
    const newStep: EmailSequenceStep = {
      id: `temp-${Date.now()}`, // Temporary ID, will be replaced on save
      name: "New Step",
      templateId: templates.length > 0 ? templates[0].id : "",
      delayHours: 24,
      delayType: "fixed",
      position: steps.length + 1,
      isActive: true
    };
    
    setSteps([...steps, newStep]);
    setEditingStep(newStep);
  };

  const handleDeleteStep = (stepId: string) => {
    setStepToDelete(stepId);
    setIsDeleteStepDialogOpen(true);
  };

  const confirmDeleteStep = () => {
    if (stepToDelete) {
      setSteps(steps.filter(step => step.id !== stepToDelete));
      if (editingStep && editingStep.id === stepToDelete) {
        setEditingStep(null);
      }
    }
    setIsDeleteStepDialogOpen(false);
    setStepToDelete(null);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const itemsCopy = Array.from(steps);
    const [reorderedItem] = itemsCopy.splice(result.source.index, 1);
    itemsCopy.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    setSteps(itemsCopy);
  };

  const updateStepField = (stepId: string, field: string, value: any) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId ? { ...step, [field]: value } : step
      )
    );
    
    if (editingStep && editingStep.id === stepId) {
      setEditingStep(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const getTemplateById = (id: string): EmailTemplate | undefined => {
    return templates.find(template => template.id === id);
  };

  return (
    <div className="space-y-6 pb-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Sequence Details</TabsTrigger>
          <TabsTrigger value="steps">Email Steps {steps.length > 0 && `(${steps.length})`}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="sequence-name">Sequence Name</Label>
              <Input
                id="sequence-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter sequence name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sequence-description">Description</Label>
              <Textarea
                id="sequence-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this sequence"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trigger-type">Trigger Type</Label>
                <Select 
                  value={triggerType} 
                  onValueChange={setTriggerType}
                >
                  <SelectTrigger id="trigger-type">
                    <SelectValue placeholder="Select trigger type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Enrollment</SelectItem>
                    <SelectItem value="event">Event Based</SelectItem>
                    <SelectItem value="schedule">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {triggerType === 'event' && (
                <div className="space-y-2">
                  <Label htmlFor="trigger-event">Trigger Event</Label>
                  <Select 
                    value={triggerEvent} 
                    onValueChange={setTriggerEvent}
                  >
                    <SelectTrigger id="trigger-event">
                      <SelectValue placeholder="Select trigger event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_customer">New Customer</SelectItem>
                      <SelectItem value="service_complete">Service Complete</SelectItem>
                      <SelectItem value="invoice_paid">Invoice Paid</SelectItem>
                      <SelectItem value="appointment_scheduled">Appointment Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive">Sequence Active</Label>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="steps" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Sequence Steps</h3>
            <Button onClick={handleAddStep} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Step
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1 space-y-4">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="steps">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {steps.length === 0 ? (
                        <div className="text-center p-6 border border-dashed rounded-md">
                          <p className="text-muted-foreground">No steps added yet</p>
                          <Button 
                            variant="outline" 
                            onClick={handleAddStep} 
                            className="mt-2"
                          >
                            <Plus className="mr-2 h-4 w-4" /> Add First Step
                          </Button>
                        </div>
                      ) : (
                        steps.map((step, index) => (
                          <Draggable 
                            key={step.id} 
                            draggableId={step.id} 
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex items-center space-x-2 p-3 border rounded-md ${
                                  editingStep?.id === step.id 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-border'
                                }`}
                              >
                                <div 
                                  {...provided.dragHandleProps}
                                  className="cursor-grab"
                                >
                                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{step.name}</div>
                                  <div className="text-xs text-muted-foreground flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {step.delayHours} hours
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingStep(step)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteStep(step.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
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
            
            <div className="md:col-span-3">
              {editingStep ? (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Edit Step</h3>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setEditingStep(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="step-name">Step Name</Label>
                        <Input
                          id="step-name"
                          value={editingStep.name}
                          onChange={(e) => updateStepField(editingStep.id, 'name', e.target.value)}
                          placeholder="Enter step name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email-template">Email Template</Label>
                        <Select 
                          value={editingStep.templateId} 
                          onValueChange={(value) => updateStepField(editingStep.id, 'templateId', value)}
                          disabled={templatesLoading}
                        >
                          <SelectTrigger id="email-template">
                            <SelectValue placeholder="Select email template" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {editingStep.templateId && getTemplateById(editingStep.templateId) && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            Subject: {getTemplateById(editingStep.templateId)?.subject}
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="delay-hours">Delay (hours)</Label>
                          <Input
                            id="delay-hours"
                            type="number"
                            min="0"
                            value={editingStep.delayHours}
                            onChange={(e) => updateStepField(
                              editingStep.id, 
                              'delayHours', 
                              parseInt(e.target.value) || 0
                            )}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="delay-type">Delay Type</Label>
                          <Select 
                            value={editingStep.delayType} 
                            onValueChange={(value) => updateStepField(
                              editingStep.id, 
                              'delayType', 
                              value as 'fixed' | 'business_days'
                            )}
                          >
                            <SelectTrigger id="delay-type">
                              <SelectValue placeholder="Select delay type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed Hours</SelectItem>
                              <SelectItem value="business_days">Business Days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2 pt-2">
                        <Accordion type="single" collapsible>
                          <AccordionItem value="conditions">
                            <AccordionTrigger>Conditions</AccordionTrigger>
                            <AccordionContent>
                              <div className="pt-2 pb-4 space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="condition-type">Condition Type</Label>
                                  <Select 
                                    value={editingStep.condition?.type || ""} 
                                    onValueChange={(value) => {
                                      if (!value) {
                                        // Remove condition
                                        const newStep = { ...editingStep };
                                        delete newStep.condition;
                                        setEditingStep(newStep);
                                        updateStepField(editingStep.id, 'condition', undefined);
                                      } else {
                                        updateStepField(editingStep.id, 'condition', {
                                          type: value as 'event' | 'property',
                                          value: editingStep.condition?.value || "",
                                          operator: editingStep.condition?.operator || "="
                                        });
                                      }
                                    }}
                                  >
                                    <SelectTrigger id="condition-type">
                                      <SelectValue placeholder="No condition (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="">No condition</SelectItem>
                                      <SelectItem value="event">Event Occurred</SelectItem>
                                      <SelectItem value="property">Customer Property</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                {editingStep.condition && (
                                  <>
                                    <div className="grid grid-cols-2 gap-4">
                                      {editingStep.condition.type === 'event' && (
                                        <div className="col-span-2 space-y-2">
                                          <Label htmlFor="event-name">Event Name</Label>
                                          <Select 
                                            value={editingStep.condition.value} 
                                            onValueChange={(value) => {
                                              updateStepField(editingStep.id, 'condition', {
                                                ...editingStep.condition,
                                                value
                                              });
                                            }}
                                          >
                                            <SelectTrigger id="event-name">
                                              <SelectValue placeholder="Select event" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="email_opened">Email Opened</SelectItem>
                                              <SelectItem value="link_clicked">Link Clicked</SelectItem>
                                              <SelectItem value="appointment_confirmed">Appointment Confirmed</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}
                                      
                                      {editingStep.condition.type === 'property' && (
                                        <>
                                          <div className="space-y-2">
                                            <Label htmlFor="property-name">Property</Label>
                                            <Select 
                                              value={editingStep.condition.value} 
                                              onValueChange={(value) => {
                                                updateStepField(editingStep.id, 'condition', {
                                                  ...editingStep.condition,
                                                  value
                                                });
                                              }}
                                            >
                                              <SelectTrigger id="property-name">
                                                <SelectValue placeholder="Select property" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="customer_type">Customer Type</SelectItem>
                                                <SelectItem value="lifetime_value">Lifetime Value</SelectItem>
                                                <SelectItem value="last_service_date">Last Service Date</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <Label htmlFor="condition-operator">Operator</Label>
                                            <Select 
                                              value={editingStep.condition.operator} 
                                              onValueChange={(value) => {
                                                updateStepField(editingStep.id, 'condition', {
                                                  ...editingStep.condition,
                                                  operator: value as '=' | '!=' | '>' | '<' | '>=' | '<='
                                                });
                                              }}
                                            >
                                              <SelectTrigger id="condition-operator">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="=">Equals (=)</SelectItem>
                                                <SelectItem value="!=">Not Equals (!=)</SelectItem>
                                                <SelectItem value=">">Greater Than (>)</SelectItem>
                                                <SelectItem value="<">Less Than (&lt;)</SelectItem>
                                                <SelectItem value=">=">Greater Than or Equal (>=)</SelectItem>
                                                <SelectItem value="<=">Less Than or Equal (&lt;=)</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-2">
                        <Switch 
                          id="step-active"
                          checked={editingStep.isActive}
                          onCheckedChange={(checked) => updateStepField(editingStep.id, 'isActive', checked)}
                        />
                        <Label htmlFor="step-active">Step Active</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[200px] border border-dashed rounded-md">
                  <div className="text-center p-6">
                    <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <h3 className="text-lg font-medium mb-1">Step Details</h3>
                    <p className="text-muted-foreground mb-4">Select a step from the list to edit</p>
                    {steps.length === 0 && (
                      <Button onClick={handleAddStep}>
                        <Plus className="mr-2 h-4 w-4" /> Add First Step
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleSave} 
          disabled={isSaving || !name || steps.length === 0}
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Sequence
            </>
          )}
        </Button>
      </div>
      
      <AlertDialog 
        open={isDeleteStepDialogOpen} 
        onOpenChange={setIsDeleteStepDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Step</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this step? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStep}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
