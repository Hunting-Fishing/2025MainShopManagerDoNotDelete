import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { WorkOrderTemplateSelector } from "./templates/WorkOrderTemplateSelector";
import {
  createWorkOrderTemplate,
  getWorkOrderTemplateById,
  updateWorkOrderTemplate,
} from "@/services/workOrderTemplateService";
import { WorkOrderTemplate } from "@/types/workOrder";
import { useParams, useNavigate } from "react-router-dom";
import { WorkOrderStatusType, WorkOrderPriorityType } from '@/types/workOrder';

import {
  WorkOrderFormSchema,
  WorkOrderFormSchemaValues,
} from "@/schemas/workOrderSchema";

interface WorkOrderFormProps {
  workOrder?: WorkOrderFormSchemaValues;
  onSubmit: (values: WorkOrderFormSchemaValues) => Promise<void>;
}

export function WorkOrderForm({ workOrder, onSubmit }: WorkOrderFormProps) {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(WorkOrderFormSchema),
    defaultValues: {
      description: "",
      status: "pending",
      priority: "medium",
      technician_id: "",
      location: "",
      notes: "",
      customer_id: "",
    },
  });

  useEffect(() => {
    if (workOrder) {
      form.reset(workOrder);
    }
  }, [workOrder, form]);

  const { setValue } = form;

  const handleTemplateSelect = (template: WorkOrderTemplate) => {
    // Set values from the template
    setValue("description", template.description || "");
    setValue("status", template.status as WorkOrderStatusType || "pending");
    setValue("priority", template.priority as WorkOrderPriorityType || "medium");
    setValue("technician_id", template.technician_id || "");
    
    // Set location if it exists in the template
    if (template.location) {
      setValue("location", template.location);
    }
    
    // Set customer if it exists in the template (this is fixed now)
    if (template.customer) {
      setValue("customer_id", template.customer_id || "");
    }
    
    // Set notes if they exist in the template
    if (template.notes) {
      setValue("notes", template.notes);
    }

    setShowTemplateSelector(false);
  };

  const handleSaveTemplate = async (data: WorkOrderFormSchemaValues) => {
    try {
      const templateData = {
        name: "New Template",
        description: data.description,
        status: data.status,
        priority: data.priority,
        technician_id: data.technician_id,
        location: data.location,
        notes: data.notes,
        customer: data.customer_id,
        customer_id: data.customer_id,
      };

      if (id) {
        // Update existing template
        await updateWorkOrderTemplate({ ...templateData, id });
        toast({
          title: "Success",
          description: "Work order template updated successfully.",
        });
      } else {
        // Create new template
        await createWorkOrderTemplate(templateData);
        toast({
          title: "Success",
          description: "Work order template created successfully.",
        });
      }

      navigate("/work-orders");
    } catch (error) {
      console.error("Error saving work order template:", error);
      toast({
        title: "Error",
        description: "Failed to save work order template.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        {workOrder ? "Edit Work Order" : "Create Work Order"}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit(values);
              handleSaveTemplate(values);
            })}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of the work order"
                      {...form.register("description")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>

              <div>
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select {...form.register("status")} defaultValue="pending">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select {...form.register("priority")} defaultValue="medium">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              </div>

              <div>
                <FormItem>
                  <FormLabel>Technician ID</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter technician ID"
                      {...form.register("technician_id")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter location"
                      {...form.register("location")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>

              <div>
                <FormItem>
                  <FormLabel>Customer ID</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter customer ID"
                      {...form.register("customer_id")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>
            </div>

            <div>
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional notes"
                    {...form.register("notes")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTemplateSelector(true)}
              >
                Use Template
              </Button>
              <Button type="submit">
                {workOrder ? "Update Work Order" : "Create Work Order"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>

      <WorkOrderTemplateSelector
        open={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateSelect}
      />
    </Card>
  );
}
