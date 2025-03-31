
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Tag, 
  GanttChart, 
  UserCircle2, 
  PlusCircle,
  Braces
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface EnrollCustomerFormProps {
  customerId: string;
  onEnroll?: (enrollmentId: string) => void;
}

const formSchema = z.object({
  sequenceId: z.string().min(1, { message: "Please select a sequence" }),
  personalizations: z.record(z.string()).optional(),
  segmentData: z.record(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const EnrollCustomerForm: React.FC<EnrollCustomerFormProps> = ({
  customerId,
  onEnroll
}) => {
  const [open, setOpen] = useState(false);
  const [sequences, setSequences] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [personalizationFields, setPersonalizationFields] = useState<{key: string, value: string}[]>([]);
  const [segmentFields, setSegmentFields] = useState<{key: string, value: string}[]>([]);
  const [metadataJson, setMetadataJson] = useState('{}');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sequenceId: "",
      personalizations: {},
      segmentData: {},
      metadata: {},
    },
  });

  useEffect(() => {
    const fetchSequences = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('email_sequences')
          .select('*')
          .eq('is_active', true);
          
        if (error) throw error;
        setSequences(data || []);
      } catch (error) {
        console.error('Error fetching sequences:', error);
        toast({
          title: 'Error',
          description: 'Could not load email sequences',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchCustomer = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .single();
          
        if (error) throw error;
        setCustomer(data);
        
        // Initialize basic personalization fields based on customer data
        const initialFields = [
          { key: 'first_name', value: data.first_name || '' },
          { key: 'last_name', value: data.last_name || '' },
          { key: 'email', value: data.email || '' },
        ];
        setPersonalizationFields(initialFields);
      } catch (error) {
        console.error('Error fetching customer:', error);
      }
    };
    
    if (open) {
      fetchSequences();
      fetchCustomer();
    }
  }, [customerId, open, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Convert personalization fields to record
      const personalizations = personalizationFields.reduce((acc, field) => {
        if (field.key && field.value) {
          acc[field.key] = field.value;
        }
        return acc;
      }, {} as Record<string, string>);
      
      // Convert segment fields to record
      const segmentData = segmentFields.reduce((acc, field) => {
        if (field.key && field.value) {
          acc[field.key] = field.value;
        }
        return acc;
      }, {} as Record<string, string>);
      
      // Parse metadata JSON
      let metadata = {};
      try {
        metadata = JSON.parse(metadataJson);
      } catch (e) {
        toast({
          title: 'Invalid JSON',
          description: 'The metadata is not valid JSON. Using empty object instead.',
          variant: 'destructive',
        });
      }
      
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .insert({
          sequence_id: values.sequenceId,
          customer_id: customerId,
          status: 'active',
          next_send_time: new Date().toISOString(),
          metadata: {
            personalizations,
            segmentData,
            ...metadata
          }
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: 'Customer Enrolled',
        description: 'The customer has been enrolled in the sequence successfully.',
      });
      
      setOpen(false);
      
      if (onEnroll) {
        onEnroll(data.id);
      }
      
      // Trigger sequence processing function to start the sequence
      try {
        await supabase.functions.invoke('process-email-sequences', {
          body: { 
            sequenceId: values.sequenceId, 
            action: 'process' 
          }
        });
      } catch (processError) {
        console.error('Error triggering sequence processing:', processError);
        // Non-critical error, don't show to user
      }
      
    } catch (error) {
      console.error('Error enrolling customer:', error);
      toast({
        title: 'Error',
        description: 'Failed to enroll customer in sequence',
        variant: 'destructive',
      });
    }
  };

  const addPersonalizationField = () => {
    setPersonalizationFields([...personalizationFields, { key: '', value: '' }]);
  };
  
  const updatePersonalizationField = (index: number, field: 'key' | 'value', value: string) => {
    const newFields = [...personalizationFields];
    newFields[index][field] = value;
    setPersonalizationFields(newFields);
  };
  
  const removePersonalizationField = (index: number) => {
    const newFields = [...personalizationFields];
    newFields.splice(index, 1);
    setPersonalizationFields(newFields);
  };
  
  const addSegmentField = () => {
    setSegmentFields([...segmentFields, { key: '', value: '' }]);
  };
  
  const updateSegmentField = (index: number, field: 'key' | 'value', value: string) => {
    const newFields = [...segmentFields];
    newFields[index][field] = value;
    setSegmentFields(newFields);
  };
  
  const removeSegmentField = (index: number) => {
    const newFields = [...segmentFields];
    newFields.splice(index, 1);
    setSegmentFields(newFields);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <GanttChart className="mr-2 h-4 w-4" /> Enroll in Sequence
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enroll Customer in Email Sequence</DialogTitle>
          <DialogDescription>
            Select a sequence to enroll this customer in and customize with personalization options.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="sequenceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Sequence</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sequence" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sequences.map((sequence) => (
                        <SelectItem key={sequence.id} value={sequence.id}>
                          {sequence.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose an active email sequence to enroll this customer in.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="personalizations">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <UserCircle2 className="mr-2 h-4 w-4" />
                    Personalization Variables
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {personalizationFields.map((field, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Variable name"
                          value={field.key}
                          onChange={(e) => updatePersonalizationField(index, 'key', e.target.value)}
                          className="w-1/3"
                        />
                        <Input
                          placeholder="Value"
                          value={field.value}
                          onChange={(e) => updatePersonalizationField(index, 'value', e.target.value)}
                          className="w-2/3"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removePersonalizationField(index)}
                        >
                          &times;
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPersonalizationField}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Variable
                    </Button>
                    <FormDescription>
                      Add personalization variables to use in your email templates with {"{{"}}variable_name{"}}"} syntax.
                    </FormDescription>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="segmentation">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <Tag className="mr-2 h-4 w-4" />
                    Segment Data
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {segmentFields.map((field, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Segment key"
                          value={field.key}
                          onChange={(e) => updateSegmentField(index, 'key', e.target.value)}
                          className="w-1/3"
                        />
                        <Input
                          placeholder="Value"
                          value={field.value}
                          onChange={(e) => updateSegmentField(index, 'value', e.target.value)}
                          className="w-2/3"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeSegmentField(index)}
                        >
                          &times;
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSegmentField}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Segment Data
                    </Button>
                    <FormDescription>
                      Add custom segmentation data that can be used for future targeting.
                    </FormDescription>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="metadata">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <Braces className="mr-2 h-4 w-4" />
                    Custom Metadata
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <Label htmlFor="metadata">Custom JSON Metadata</Label>
                    <Textarea
                      id="metadata"
                      placeholder='{"custom_field": "value", "tracking": {"source": "website"}}'
                      value={metadataJson}
                      onChange={(e) => setMetadataJson(e.target.value)}
                      rows={5}
                    />
                    <FormDescription>
                      Add any additional metadata as valid JSON for advanced tracking and personalization.
                    </FormDescription>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                Enroll Customer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
