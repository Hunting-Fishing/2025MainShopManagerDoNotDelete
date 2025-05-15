
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export function CustomerAccountCard() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [availableShops, setAvailableShops] = useState<Array<{id: string, name: string}>>([]);
  const [isLoadingShops, setIsLoadingShops] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  
  // Fetch available shops on component mount
  useEffect(() => {
    async function fetchShops() {
      setIsLoadingShops(true);
      console.log("Fetching shops...");
      try {
        // Query the shops table directly
        const { data: shops, error } = await supabase
          .from('shops')
          .select('id, name')
          .eq('is_active', true) // Only get active shops
          .order('name', { ascending: true });
        
        if (error) {
          console.error("Error fetching shops:", error);
          toast.error("Failed to load shops. Please try again.");
          return;
        }
        
        console.log("Shops fetched:", shops);
        setAvailableShops(shops || []);
      } catch (err) {
        console.error("Exception fetching shops:", err);
        toast.error("An error occurred while loading shops.");
      } finally {
        setIsLoadingShops(false);
      }
    }
    
    fetchShops();
  }, []);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      if (!data.user) {
        toast.error("Login failed.");
        return;
      }
      
      // Check if the user is a customer by verifying if they have a customer record
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', data.user.id)
        .maybeSingle();
        
      if (customerError) {
        console.error("Error checking customer role:", customerError);
        toast.error("Error checking account type.");
        return;
      }
      
      if (!customerData) {
        toast.error("This account is not registered as a customer. Please use the staff login portal.");
        // Sign out the user since they are not a customer
        await supabase.auth.signOut();
        return;
      }
      
      // If we get here, the user is authenticated as a customer
      toast.success("Login successful!");
      window.location.href = "/customer-portal";
      
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedShops.length === 0) {
      toast.error("Please select at least one shop to register with.");
      return;
    }
    
    setLoading(true);
    
    try {
      // Create the user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      if (!data.user) {
        toast.error("Registration failed.");
        return;
      }
      
      // Create a customer record
      const { error: customerError } = await supabase.from('customers').insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        auth_user_id: data.user.id,
        shop_id: selectedShops[0], // Set the primary shop
      });
      
      if (customerError) {
        console.error("Error creating customer:", customerError);
        toast.error("Failed to create customer profile.");
        return;
      }
      
      // Create customer-shop relationships for each selected shop
      const shopRelationships = selectedShops.map(shopId => ({
        customer_id: data.user.id,
        shop_id: shopId,
        status: 'active'
      }));
      
      const { error: relationshipError } = await supabase
        .from('customer_shop_relationships')
        .insert(shopRelationships);
      
      if (relationshipError) {
        console.error("Error creating shop relationships:", relationshipError);
        toast.error("Failed to associate with selected shops.");
        return;
      }
      
      toast.success("Registration successful! Please login to continue.");
      setActiveTab("login");
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const toggleShopSelection = (shopId: string) => {
    setSelectedShops(prev => {
      if (prev.includes(shopId)) {
        return prev.filter(id => id !== shopId);
      } else {
        return [...prev, shopId];
      }
    });
  };
  
  return (
    <Tabs defaultValue="login" value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")}>
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-xs text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </div>
            <Input 
              id="password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </TabsContent>
      
      <TabsContent value="signup">
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
            />
          </div>
          
          <div className="space-y-2">
            <Label>Select Shop(s)</Label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2">
              {isLoadingShops ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Loading shops...</span>
                </div>
              ) : availableShops.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">No shops available.</p>
              ) : (
                availableShops.map((shop) => (
                  <div key={shop.id} className="flex items-center space-x-2 py-1">
                    <Checkbox 
                      id={`shop-${shop.id}`}
                      checked={selectedShops.includes(shop.id)} 
                      onCheckedChange={() => toggleShopSelection(shop.id)}
                    />
                    <Label htmlFor={`shop-${shop.id}`} className="text-sm cursor-pointer">
                      {shop.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading || selectedShops.length === 0}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
