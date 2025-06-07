
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { ClipboardList, Users, Package, BarChart3, Calendar, MessageSquare, CheckCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: "Success",
          description: "You have been signed in successfully.",
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign in.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: ClipboardList,
      title: "Work Order Management",
      description: "Track and manage work orders from creation to completion with real-time updates"
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Comprehensive customer profiles with service history and communication logs"
    },
    {
      icon: Package,
      title: "Inventory Control",
      description: "Automated inventory tracking with low-stock alerts and reorder management"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Detailed insights into your business performance and key metrics"
    },
    {
      icon: Calendar,
      title: "Scheduling & Calendar",
      description: "Efficient appointment scheduling and resource management"
    },
    {
      icon: MessageSquare,
      title: "Team Collaboration",
      description: "Built-in communication tools to keep your team connected"
    }
  ];

  const benefits = [
    "Streamline your service operations",
    "Improve customer satisfaction",
    "Reduce operational costs",
    "Increase team productivity"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-esm-blue-50 via-white to-esm-blue-100 flex">
      {/* Left Side - Feature Showcase */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-esm-blue-600 via-esm-blue-700 to-esm-blue-800"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16 text-white">
          <div className="max-w-2xl">
            <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
              Streamline Your Service Operations
            </h1>
            <p className="text-xl xl:text-2xl mb-8 text-esm-blue-100 leading-relaxed">
              The complete solution for managing work orders, customers, inventory, and team collaboration in one powerful platform.
            </p>
            
            {/* Benefits */}
            <div className="mb-12">
              <h3 className="text-lg font-semibold mb-4">Why choose our platform?</h3>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-esm-blue-50">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className="flex items-start space-x-3">
                    <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                      <p className="text-xs text-esm-blue-100 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-40 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/5 rounded-full blur-md"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Header - Only visible on small screens */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-esm-blue-800 mb-2">
              Welcome Back
            </h1>
            <p className="text-esm-blue-600">
              Sign in to access your service management platform
            </p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl lg:text-3xl font-bold text-esm-blue-800">
                Sign In
              </CardTitle>
              <p className="text-esm-blue-600 mt-2">
                Access your dashboard and manage your operations
              </p>
            </CardHeader>
            
            <CardContent className="pt-0">
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-esm-blue-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 border-esm-blue-200 focus:border-esm-blue-500 focus:ring-esm-blue-500 transition-all duration-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-esm-blue-700 font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 border-esm-blue-200 focus:border-esm-blue-500 focus:ring-esm-blue-500 transition-all duration-200"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-esm-blue-600 to-esm-blue-700 hover:from-esm-blue-700 hover:to-esm-blue-800 text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-esm-blue-600">
                  Don't have an account?{' '}
                  <Link 
                    to="/signup" 
                    className="text-esm-blue-700 hover:text-esm-blue-800 font-semibold hover:underline transition-colors duration-200"
                  >
                    Create Account
                  </Link>
                </p>
              </div>

              {/* Additional Links */}
              <div className="mt-4 text-center">
                <a 
                  href="#" 
                  className="text-xs text-esm-blue-500 hover:text-esm-blue-700 transition-colors duration-200"
                >
                  Forgot your password?
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="mt-6 text-center">
            <p className="text-xs text-esm-blue-500">
              Trusted by service professionals worldwide
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
