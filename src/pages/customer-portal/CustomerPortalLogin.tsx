import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, LogIn, Crosshair } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';

export default function CustomerPortalLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { companyName } = useCompany();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if already logged in as a customer
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if this user is linked to a customer
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (customer) {
          navigate('/customer-portal/dashboard');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if this user is linked to a customer account
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id, first_name, last_name')
        .eq('user_id', data.user.id)
        .single();

      if (customerError || !customer) {
        // Not a customer account, sign out
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "No customer account is linked to this email. Please contact us for assistance.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: `Logged in as ${customer.first_name} ${customer.last_name}`,
      });

      navigate('/customer-portal/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-amber-200">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mb-2">
            <Crosshair className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-amber-900">
            Customer Portal
          </CardTitle>
          <CardDescription className="text-amber-700">
            {companyName || 'Welcome'} - Sign in to view your account
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-amber-200 focus:border-amber-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link 
                to="/customer-portal/register" 
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Register here
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
