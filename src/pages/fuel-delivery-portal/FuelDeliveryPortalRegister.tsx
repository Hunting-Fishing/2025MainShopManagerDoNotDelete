import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus, Fuel, CheckCircle, Building2 } from 'lucide-react';
import { geocodeAddress } from '@/utils/geocoding';

export default function FuelDeliveryPortalRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    billingAddress: '',
    preferredFuelType: '',
    deliveryInstructions: '',
  });
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [shops, setShops] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');

  // Load available shops
  useEffect(() => {
    const loadShops = async () => {
      const { data } = await supabase
        .from('shops')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      
      if (data && data.length > 0) {
        setShops(data);
        // Auto-select if only one shop or from URL param
        const shopParam = searchParams.get('shop');
        if (shopParam) {
          const matchingShop = data.find(s => s.id === shopParam);
          if (matchingShop) setSelectedShopId(matchingShop.id);
        } else if (data.length === 1) {
          setSelectedShopId(data[0].id);
        }
      }
    };
    loadShops();
  }, [searchParams]);

  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if user has a fuel delivery customer record
        const { data: customer } = await supabase
          .from('fuel_delivery_customers')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (customer) {
          navigate('/fuel-delivery-portal/dashboard');
          return;
        }
      }
      setCheckingAuth(false);
    };

    checkExistingSession();
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    if (!selectedShopId) {
      toast({
        title: "Select a Business",
        description: "Please select the fuel delivery provider you want to register with.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Check if customer already exists with this email
      const { data: existingCustomer } = await supabase
        .from('fuel_delivery_customers')
        .select('id, user_id')
        .eq('email', formData.email.toLowerCase())
        .single();

      if (existingCustomer?.user_id) {
        toast({
          title: "Account Exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Create auth user
      const redirectUrl = `${window.location.origin}/fuel-delivery-portal/dashboard`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: formData.contactName,
            company: formData.companyName,
          }
        }
      });

      if (authError) throw authError;

      // Geocode the billing address
      let billingLat = null;
      let billingLng = null;
      if (formData.billingAddress) {
        const geocodeResult = await geocodeAddress(formData.billingAddress);
        if (geocodeResult) {
          billingLat = geocodeResult.latitude;
          billingLng = geocodeResult.longitude;
        }
      }

      if (existingCustomer) {
        // Link existing customer to new auth user
        const { error: updateError } = await supabase
          .from('fuel_delivery_customers')
          .update({ 
            user_id: authData.user?.id,
            billing_address: formData.billingAddress || undefined,
            billing_latitude: billingLat,
            billing_longitude: billingLng,
            notes: formData.deliveryInstructions || undefined,
          })
          .eq('id', existingCustomer.id);

        if (updateError) throw updateError;

        toast({
          title: "Account Linked!",
          description: "Your existing customer profile has been linked to your new account.",
        });
      } else {
        // Create new fuel delivery customer
        const { error: customerError } = await supabase
          .from('fuel_delivery_customers')
          .insert([{
            shop_id: selectedShopId,
            user_id: authData.user?.id,
            company_name: formData.companyName || null,
            contact_name: formData.contactName,
            email: formData.email.toLowerCase(),
            phone: formData.phone || null,
            billing_address: formData.billingAddress || null,
            billing_latitude: billingLat,
            billing_longitude: billingLng,
            preferred_fuel_type: formData.preferredFuelType || null,
            notes: formData.deliveryInstructions || null,
            status: 'active',
          }]);

        if (customerError) throw customerError;

        toast({
          title: "Registration Successful!",
          description: "Please check your email to verify your account.",
        });
      }

      setRegistrationComplete(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (registrationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4">
        <Card className="w-full max-w-md shadow-xl bg-card/95 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">
              Registration Complete!
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Please check your email to verify your account, then you can sign in.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              onClick={() => navigate('/fuel-delivery-portal/login')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Go to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/fuel-delivery-portal" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Fuel className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Fuel Delivery Portal</span>
          </Link>
        </div>

        <Card className="shadow-xl bg-card/95 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
              <UserPlus className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Register for fuel delivery services
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              {/* Business Selection */}
              {shops.length > 1 && (
                <div className="space-y-2">
                  <Label htmlFor="shop">Select Provider *</Label>
                  <Select value={selectedShopId} onValueChange={setSelectedShopId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your fuel delivery provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {shops.map(shop => (
                        <SelectItem key={shop.id} value={shop.id}>
                          {shop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {shops.length === 1 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-green-600 shrink-0" />
                  <div className="text-sm">
                    <span className="text-muted-foreground">Registering with </span>
                    <span className="font-medium text-foreground">{shops[0].name}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Your Company (optional)"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  placeholder="John Doe"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingAddress">Billing/Delivery Address</Label>
                <Textarea
                  id="billingAddress"
                  placeholder="123 Main St, City, State ZIP"
                  value={formData.billingAddress}
                  onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredFuelType">Preferred Fuel Type</Label>
                <Select 
                  value={formData.preferredFuelType} 
                  onValueChange={(value) => setFormData({ ...formData, preferredFuelType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasoline_87">Gasoline 87</SelectItem>
                    <SelectItem value="gasoline_89">Gasoline 89</SelectItem>
                    <SelectItem value="gasoline_91">Gasoline 91</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="heating_oil">Heating Oil</SelectItem>
                    <SelectItem value="propane">Propane</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
                <Textarea
                  id="deliveryInstructions"
                  placeholder="Gate codes, preferred delivery times, special instructions..."
                  value={formData.deliveryInstructions}
                  onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  to="/fuel-delivery-portal/login" 
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Sign in here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
