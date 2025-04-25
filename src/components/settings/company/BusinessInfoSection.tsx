
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BusinessInfoSectionProps {
  companyInfo: any;
  businessTypes: any[];
  businessIndustries: any[];
  isLoadingConstants: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

export function BusinessInfoSection({
  companyInfo,
  businessTypes,
  businessIndustries,
  isLoadingConstants,
  onInputChange,
  onSelectChange
}: BusinessInfoSectionProps) {
  
  const formSchema = z.object({
    companyName: z.string().min(2, {
      message: "Company name must be at least 2 characters.",
    }),
    address: z.string().min(5, {
      message: "Address must be at least 5 characters.",
    }),
    city: z.string().min(2, {
      message: "City must be at least 2 characters.",
    }),
    state: z.string().min(2, {
      message: "State must be at least 2 characters.",
    }),
    zipCode: z.string().min(5, {
      message: "Zip code must be at least 5 characters.",
    }),
    phone: z.string().min(10, {
      message: "Phone number must be at least 10 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    website: z.string().url({
      message: "Please enter a valid URL.",
    }).optional().or(z.literal('')),
    taxId: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: companyInfo?.companyName || "",
      address: companyInfo?.address || "",
      city: companyInfo?.city || "",
      state: companyInfo?.state || "",
      zipCode: companyInfo?.zipCode || "",
      phone: companyInfo?.phone || "",
      email: companyInfo?.email || "",
      website: companyInfo?.website || "",
      taxId: companyInfo?.taxId || "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Save the company information
  }

  return (
    <div>
      <h2>Business Information</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter company name" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        onInputChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID / EIN</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter tax ID" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        onInputChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter address" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          onInputChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter city" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        onInputChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter state" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          onInputChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter zip code" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          onInputChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter phone number" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        onInputChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter email address" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        onInputChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter website URL" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        onInputChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem>
              <FormLabel>Business Type</FormLabel>
              <Select 
                defaultValue={companyInfo?.businessType || ""}
                onValueChange={(value) => onSelectChange("businessType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type: any) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
            
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <Select 
                defaultValue={companyInfo?.industry || ""}
                onValueChange={(value) => onSelectChange("industry", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {businessIndustries.map((industry: any) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Save Company Information</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
