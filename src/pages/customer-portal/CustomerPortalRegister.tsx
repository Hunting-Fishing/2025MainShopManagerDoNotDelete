import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, UserPlus, Crosshair, CheckCircle } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';

export default function CustomerPortalRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { companyName } = useCompany();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (customer) {
          navigate('/customer-portal/dashboard');
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

    setLoading(true);

    try {
      // Get a default shop_id for new customers
      const { data: shopData } = await supabase
        .from('shops')
        .select('id')
        .limit(1)
        .single();
      
      if (!shopData) {
        toast({
          title: "Configuration Error",
          description: "Unable to register at this time. Please contact support.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // First, check if a customer with this email already exists
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id, user_id, first_name, last_name')
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
      const redirectUrl = `${window.location.origin}/customer-portal/dashboard`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      });

      if (authError) throw authError;

      if (existingCustomer) {
        // Link existing customer to the new auth user
        const { error: updateError } = await supabase
          .from('customers')
          .update({ user_id: authData.user?.id })
          .eq('id', existingCustomer.id);

        if (updateError) throw updateError;

        toast({
          title: "Account Linked!",
          description: `Welcome ${existingCustomer.first_name}! Your existing customer profile has been linked to your new account.`,
        });
      } else {
        // Create new customer record with shop_id
        const { error: customerError } = await supabase
          .from('customers')
          .insert([{
            shop_id: shopData.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email.toLowerCase(),
            phone: formData.phone || null,
            user_id: authData.user?.id,
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (registrationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
        <Card className="w-full max-w-md shadow-xl border-amber-200">
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
              onClick={() => navigate('/customer-portal/login')}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              Go to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-amber-200">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mb-2">
            <Crosshair className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-amber-900">
            Create Account
          </CardTitle>
          <CardDescription className="text-amber-700">
            {companyName || 'Welcome'} - Register for customer portal access
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="border-amber-200 focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="border-amber-200 focus:border-amber-500"
                />
              </div>
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
                className="border-amber-200 focus:border-amber-500"
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
                className="border-amber-200 focus:border-amber-500"
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
                className="border-amber-200 focus:border-amber-500"
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
                className="border-amber-200 focus:border-amber-500"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
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
                to="/customer-portal/login" 
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Sign in here
              </Link>
            </div>
            
            <div className="text-center">
              <Link 
                to="/" 
                className="text-sm text-muted-foreground hover:text-amber-600"
              >
                ← Back to home
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
