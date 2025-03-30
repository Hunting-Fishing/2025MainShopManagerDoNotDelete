
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { createCustomer, CustomerCreate } from "@/services/customerService";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Buildings, UserRound, Phone, Mail, MapPin, Building, Bookmark } from "lucide-react";

// Regex for phone validation
const PHONE_REGEX = /^(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/;

// Form validation schema
const customerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").or(z.string().length(0)),
  phone: z.string().regex(PHONE_REGEX, "Invalid phone format").or(z.string().length(0)),
  address: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  shop_id: z.string().min(1, "Shop is required"),
  tags: z.string().optional(),
});

// Mock shop data for demonstration
// In a real app, this would come from an API or context
const shops = [
  { id: "DEFAULT-SHOP-ID", name: "Main Shop" },
  { id: "SHOP-2", name: "Downtown Branch" },
  { id: "SHOP-3", name: "West Side Service" }
];

export default function CustomerCreate() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Initialize form with validation
  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      company: "",
      notes: "",
      shop_id: "DEFAULT-SHOP-ID",
      tags: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof customerSchema>) => {
    setIsSubmitting(true);
    try {
      // Prepare customer data - ensure all required fields are provided
      const customerData: CustomerCreate = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || "",
        address: data.address || "",
        shop_id: data.shop_id,
        // Additional fields would need to be added to the Customer type and database
      };
      
      // Create customer
      const newCustomer = await createCustomer(customerData);
      
      // Show success message
      toast({
        title: "Customer created",
        description: "The customer has been successfully created.",
        variant: "default",
      });
      
      // Navigate to the new customer's detail page
      navigate(`/customers/${newCustomer.id}`);
    } catch (error) {
      handleApiError(error, "Failed to create customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Customer</h1>
        <p className="text-muted-foreground">
          Create a new customer record in the system
        </p>
      </div>

      <Card>
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Doe" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <div className="flex items-center">
                          <FormControl>
                            <div className="relative w-full">
                              <div className="absolute left-3 top-2.5 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                              </div>
                              <Input {...field} type="email" className="pl-10" placeholder="customer@example.com" />
                            </div>
                          </FormControl>
                        </div>
                        <FormDescription>Customer's contact email (optional)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <div className="flex items-center">
                          <FormControl>
                            <div className="relative w-full">
                              <div className="absolute left-3 top-2.5 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                              </div>
                              <Input {...field} className="pl-10" placeholder="(555) 123-4567" />
                            </div>
                          </FormControl>
                        </div>
                        <FormDescription>Format: (555) 123-4567</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Business Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <div className="flex items-center">
                          <FormControl>
                            <div className="relative w-full">
                              <div className="absolute left-3 top-2.5 text-muted-foreground">
                                <Buildings className="h-4 w-4" />
                              </div>
                              <Input {...field} className="pl-10" placeholder="ABC Company" />
                            </div>
                          </FormControl>
                        </div>
                        <FormDescription>If customer represents a business</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shop_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shop Location</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select shop location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {shops.map(shop => (
                              <SelectItem key={shop.id} value={shop.id}>
                                {shop.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Assign customer to a shop</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <div className="flex items-center">
                        <FormControl>
                          <div className="relative w-full">
                            <div className="absolute left-3 top-2.5 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                            </div>
                            <Textarea {...field} className="pl-10 min-h-[80px]" placeholder="123 Main St, City, State 12345" />
                          </div>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <div className="flex items-center">
                        <FormControl>
                          <div className="relative w-full">
                            <div className="absolute left-3 top-2.5 text-muted-foreground">
                              <Bookmark className="h-4 w-4" />
                            </div>
                            <Input {...field} className="pl-10" placeholder="vip, referral, maintenance-plan" />
                          </div>
                        </FormControl>
                      </div>
                      <FormDescription>Separate multiple tags with commas</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Additional customer information" className="min-h-[120px]" />
                      </FormControl>
                      <FormDescription>Additional information about this customer</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => navigate("/customers")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Customer"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
}
