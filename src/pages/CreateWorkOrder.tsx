
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ClipboardList, Loader2 } from 'lucide-react';
import { priorityMap } from '@/data/workOrdersData';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/customer';

// Form validation schema
const workOrderFormSchema = z.object({
  customer: z.string().min(1, "Please select a customer"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high"]),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>;

export default function CreateWorkOrder() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: "",
      description: "",
      priority: "medium",
      location: "",
      notes: "",
    },
  });

  // Fetch customers from Supabase
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('last_name', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setCustomers(data);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast({
          title: "Error",
          description: "Failed to load customers. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const onSubmit = async (data: WorkOrderFormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Work order form data:", data);
      // In a real app, you would save this data to your database
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Work order created successfully",
      });
      
      navigate("/work-orders");
    } catch (error) {
      console.error("Error creating work order:", error);
      toast({
        title: "Error",
        description: "There was a problem creating the work order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Create Work Order</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <ClipboardList className="h-5 w-5 mr-2" />
            Work Order Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          {isLoading ? (
                            <div className="flex items-center">
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              <span>Loading customers...</span>
                            </div>
                          ) : (
                            <SelectValue placeholder="Select a customer" />
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.first_name} {customer.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the work to be done" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(priorityMap).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Service location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional information" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Work Order"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </ResponsiveContainer>
  );
}
