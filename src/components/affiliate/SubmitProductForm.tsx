
import React from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { isValidAmazonLink } from '@/utils/amazonUtils';

const formSchema = z.object({
  productName: z.string().min(3, {
    message: "Product name must be at least 3 characters.",
  }),
  productUrl: z.string().url({
    message: "Please enter a valid URL.",
  }).refine(url => {
    // Allow non-Amazon URLs but validate Amazon URLs 
    return !url.includes('amazon') || isValidAmazonLink(url);
  }, {
    message: "Please enter a valid Amazon product URL."
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  notes: z.string().optional(),
});

const SubmitProductForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      productUrl: "",
      category: "",
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    
    // Show success toast
    toast({
      title: "Product submitted successfully!",
      description: "Thank you for your suggestion. We'll review it soon.",
    });
    
    // Reset form
    form.reset();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Submit a Tool Suggestion</h1>
        <p className="text-slate-600 dark:text-slate-300">
          Found a great tool that you think should be featured in our shop? Submit it here and we'll review it.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="productName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Professional Socket Set" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the full name of the product as it appears on the website.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="productUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.amazon.com/product/..." {...field} />
                </FormControl>
                <FormDescription>
                  Paste the direct link to the product (Amazon or other retail website).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hand-tools">Hand Tools</SelectItem>
                    <SelectItem value="power-tools">Power Tools</SelectItem>
                    <SelectItem value="diagnostic">Diagnostic Tools</SelectItem>
                    <SelectItem value="clips-fasteners">Body Clips & Fasteners</SelectItem>
                    <SelectItem value="specialty">Specialty Tools</SelectItem>
                    <SelectItem value="shop-equipment">Shop Equipment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Why do you recommend this tool? What makes it special?" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full sm:w-auto">Submit Suggestion</Button>
        </form>
      </Form>
    </div>
  );
};

export default SubmitProductForm;
