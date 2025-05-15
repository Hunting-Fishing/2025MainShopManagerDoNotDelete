
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export function CustomerAccountCard() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [shops, setShops] = useState<Array<{id: string, name: string}>>([]);
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const navigate = useNavigate();

  // Fetch available shops
  useEffect(() => {
    const fetchShops = async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error("Error fetching shops:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load available shops. Please try again later.",
        });
        return;
      }
      
      setShops(data || []);
    };

    if (!isSignIn) {
      fetchShops();
    }
  }, [isSignIn]);

  // Clean up any auth-related storage to prevent auth limbo
  const cleanupAuthState = () => {
    localStorage.removeItem('supabase.auth.token');
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Clean up existing auth state first
      cleanupAuthState();
      
      // Attempt to sign in globally
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if sign out fails
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Check if user is a customer
      const { data: roleData, error: roleError } = await supabase
        .rpc('is_customer', { user_id: data.user.id });
        
      if (roleError) {
        throw new Error("Error verifying user role");
      }
      
      if (!roleData) {
        await supabase.auth.signOut();
        throw new Error("This login is for customers only. Please use the staff login portal if you're a staff member.");
      }
      
      toast({
        title: "Signed in",
        description: "Welcome back to your customer portal.",
      });
      
      navigate('/customer-portal');
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message || "Failed to sign in. Please check your credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShopSelection = (shopId: string) => {
    setSelectedShops(current => 
      current.includes(shopId)
        ? current.filter(id => id !== shopId)
        : [...current, shopId]
    );
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (selectedShops.length === 0 && !isSignIn) {
      toast({
        variant: "destructive",
        title: "Shop selection required",
        description: "Please select at least one shop to continue.",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      // Clean up existing auth state first
      cleanupAuthState();
      
      // Attempt to sign out globally
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if sign out fails
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: "customer" // Explicitly set role to customer
          }
        }
      });

      if (error) throw error;
      
      // Create customer record
      const { error: customerError } = await supabase
        .from('customers')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: email,
          auth_user_id: data.user?.id,
          shop_id: selectedShops[0] // Primary shop
        });
      
      if (customerError) {
        console.error("Error creating customer:", customerError);
        throw new Error("Failed to create customer profile");
      }
      
      // Create shop relationships for additional shops
      if (selectedShops.length > 1) {
        const shopRelationships = selectedShops.slice(1).map(shopId => ({
          customer_id: data.user?.id,
          shop_id: shopId,
          status: 'active'
        }));
        
        const { error: relationshipError } = await supabase
          .from('customer_shop_relationships')
          .insert(shopRelationships);
          
        if (relationshipError) {
          console.error("Error creating shop relationships:", relationshipError);
          // Non-fatal error, just log it
        }
      }
      
      toast({
        title: "Account created",
        description: "Your customer account has been created. Please check your email for verification.",
      });
      
      // If email confirmation is disabled in Supabase settings,
      // we can redirect immediately
      if (data.session) {
        navigate('/customer-portal');
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message || "Failed to create account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-1">
      <form onSubmit={isSignIn ? handleLogin : handleSignUp} className="space-y-4">
        {!isSignIn && (
          <>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={isLoading}
                placeholder="First Name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Last Name"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Select Shop(s)</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                {shops.map((shop) => (
                  <div key={shop.id} className="flex items-center space-x-2 py-1">
                    <Checkbox 
                      id={`shop-${shop.id}`} 
                      checked={selectedShops.includes(shop.id)}
                      onCheckedChange={() => toggleShopSelection(shop.id)}
                    />
                    <Label 
                      htmlFor={`shop-${shop.id}`}
                      className="cursor-pointer"
                    >
                      {shop.name}
                    </Label>
                  </div>
                ))}
                {shops.length === 0 && (
                  <p className="text-sm text-gray-500">Loading shops...</p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Select all shops you'd like to work with. You can add more later.
              </p>
            </div>
          </>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            placeholder="Email"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            placeholder="Password"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700" 
          disabled={isLoading}
        >
          <User className="h-4 w-4 mr-2" />
          {isLoading 
            ? isSignIn ? "Signing in..." : "Creating account..." 
            : isSignIn ? "Sign In" : "Create Account"
          }
        </Button>
      </form>
      
      <div className="text-center">
        <Button 
          variant="link" 
          onClick={() => {
            setIsSignIn(!isSignIn);
            setSelectedShops([]);
          }}
          className="text-blue-600"
        >
          {isSignIn ? "Create a new account" : "Already have an account? Sign in"}
        </Button>
      </div>
    </div>
  );
}
