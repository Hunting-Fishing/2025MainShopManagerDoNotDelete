
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuthUser } from "@/hooks/useAuthUser";

type ProfileFormData = {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
}

export function CustomerProfileInfo() {
  const { userId, userEmail } = useAuthUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        // First check if the customer exists
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (customerError && customerError.code !== 'PGRST116') {
          throw customerError;
        }
        
        if (customerData) {
          // If customer exists, populate form
          reset({
            first_name: customerData.first_name || '',
            last_name: customerData.last_name || '',
            phone: customerData.phone || '',
            address: customerData.address || '',
            city: customerData.city || '',
            state: customerData.state || '',
            postal_code: customerData.postal_code || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load your profile information.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!userId) return;
    
    setIsSubmitting(true);
    try {
      // Check if customer already exists
      const { data: existingCustomer, error: checkError } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', userId)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingCustomer) {
        // Update existing customer
        const { error: updateError } = await supabase
          .from('customers')
          .update(data)
          .eq('user_id', userId);
          
        if (updateError) throw updateError;
      } else {
        // Insert new customer
        const { error: insertError } = await supabase
          .from('customers')
          .insert([{
            ...data,
            user_id: userId,
            email: userEmail
          }]);
          
        if (insertError) throw insertError;
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Your Profile</h2>
        <p className="text-muted-foreground">
          Manage your personal information and contact details.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-10 w-10 border-4 border-t-blue-600 border-b-blue-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input 
                      id="first_name" 
                      {...register("first_name", { required: "First name is required" })}
                      className={errors.first_name ? "border-red-500" : ""}
                    />
                    {errors.first_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input 
                      id="last_name" 
                      {...register("last_name", { required: "Last name is required" })}
                      className={errors.last_name ? "border-red-500" : ""}
                    />
                    {errors.last_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={userEmail || ''}
                    disabled
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>
                <div className="mt-4">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    {...register("phone")}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium">Address Information</h3>
                <div className="grid gap-4 mt-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input 
                      id="address" 
                      {...register("address")}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        {...register("city")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state" 
                        {...register("state")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input 
                        id="postal_code" 
                        {...register("postal_code")}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !isDirty}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
