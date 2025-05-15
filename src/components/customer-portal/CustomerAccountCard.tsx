
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowRight, FileText, Calendar, Car, Receipt } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export function CustomerAccountCard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error("Login failed: " + error.message);
        return;
      }
      
      toast.success("Login successful!");
      navigate("/customer-portal");
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (error) {
        toast.error("Registration failed: " + error.message);
        return;
      }
      
      // Create a customer record in the customers table
      const { error: customerError } = await supabase.from('customers')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          auth_user_id: data.user?.id,
          // Using a default shop_id - you may need to adjust this based on your requirements
          shop_id: "00000000-0000-0000-0000-000000000000"
        });
        
      if (customerError) {
        toast.error("Failed to create customer profile: " + customerError.message);
        return;
      }
      
      toast.success("Registration successful! Please check your email to confirm your account.");
      setIsRegistering(false);
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-blue-100 bg-gradient-to-br from-white to-blue-50">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-blue-800">
          {isRegistering ? "Create Customer Account" : "Customer Account Access"}
        </CardTitle>
        <CardDescription>
          {isRegistering 
            ? "Register to access your vehicle service history, appointments and more" 
            : "Sign in to access your service records, schedule appointments and more"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          {isRegistering && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="John" 
                    required 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Doe" 
                    required 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="(555) 123-4567" 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              placeholder="you@example.com" 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              placeholder="••••••••" 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isRegistering ? "Creating Account..." : "Signing In..."}
              </>
            ) : (
              <>
                {isRegistering ? "Create Account" : "Sign In"} 
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center w-full">
          {isRegistering ? (
            <Button 
              variant="link" 
              onClick={() => setIsRegistering(false)}
              className="text-blue-600"
            >
              Already have an account? Sign in
            </Button>
          ) : (
            <Button 
              variant="link" 
              onClick={() => setIsRegistering(true)}
              className="text-blue-600"
            >
              Need an account? Register now
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 w-full text-center">
          <div className="flex flex-col items-center p-2 rounded-lg bg-blue-50">
            <Car className="h-5 w-5 text-blue-600 mb-1" />
            <span className="text-xs text-gray-700">Vehicle Records</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-blue-50">
            <FileText className="h-5 w-5 text-blue-600 mb-1" />
            <span className="text-xs text-gray-700">Service History</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-blue-50">
            <Calendar className="h-5 w-5 text-blue-600 mb-1" />
            <span className="text-xs text-gray-700">Book Appointments</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-blue-50">
            <Receipt className="h-5 w-5 text-blue-600 mb-1" />
            <span className="text-xs text-gray-700">View Invoices</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
