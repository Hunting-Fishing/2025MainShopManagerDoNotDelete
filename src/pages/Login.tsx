
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuthUser } from '@/hooks/useAuthUser';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  User, 
  Users, 
  Shield, 
  Wrench, 
  Calendar, 
  FileText, 
  BarChart3,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('employee');
  const { isAuthenticated } = useAuthUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });

        if (error) throw error;
        toast.success('Account created! Please check your email to confirm your account.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Wrench className="h-6 w-6" />,
      title: "Work Order Management",
      description: "Complete work order lifecycle from creation to completion"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Customer Management", 
      description: "Comprehensive customer profiles and service history"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Scheduling & Calendar",
      description: "Advanced scheduling with real-time updates"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Invoicing & Billing",
      description: "Professional invoices and payment tracking"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics & Reports",
      description: "Detailed insights into your business performance"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security and data protection"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ServicePro</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
            <Link to="#features" className="hover:text-blue-600 transition-colors">Features</Link>
            <Link to="#about" className="hover:text-blue-600 transition-colors">About</Link>
            <Link to="#contact" className="hover:text-blue-600 transition-colors">Contact</Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-120px)]">
          {/* Left Column - Information */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Complete Service
                <span className="text-blue-600"> Management</span>
                <br />Solution
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Streamline your automotive service business with our comprehensive platform. 
                Manage work orders, customers, inventory, and team collaboration all in one place.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Trusted by 500+ shops</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span>99.9% uptime</span>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div id="features" className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="text-blue-600 mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                      <p className="text-gray-600 text-xs mt-1">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Authentication */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </CardTitle>
                <p className="text-gray-600">
                  {isSignUp ? 'Start managing your service business today' : 'Sign in to access your dashboard'}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* User Type Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                    <TabsTrigger value="employee" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Employee</span>
                    </TabsTrigger>
                    <TabsTrigger value="customer" className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Customer</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="employee" className="space-y-4 mt-6">
                    <div className="text-center py-2">
                      <h3 className="font-semibold text-gray-900">Staff Portal</h3>
                      <p className="text-sm text-gray-600">Access work orders, scheduling, and management tools</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="customer" className="space-y-4 mt-6">
                    <div className="text-center py-2">
                      <h3 className="font-semibold text-gray-900">Customer Portal</h3>
                      <p className="text-sm text-gray-600">View service history, schedule appointments, and track repairs</p>
                    </div>
                  </TabsContent>
                </Tabs>

                <Separator />

                {/* Auth Form */}
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="bg-white border-gray-200 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>Password</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="bg-white border-gray-200 focus:border-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                        className="bg-white border-gray-200 focus:border-blue-500"
                      />
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </button>
                </div>

                {activeTab === 'customer' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-700">
                      <strong>Customer Portal Features:</strong><br />
                      View service history, schedule appointments, track work orders, and manage your vehicle information.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center">
                  <Wrench className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold">ServicePro</span>
              </div>
              <p className="text-gray-400 text-sm">
                Complete service management solution for automotive businesses.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Work Order Management</li>
                <li>Customer Relationships</li>
                <li>Inventory Tracking</li>
                <li>Team Collaboration</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Help Center</li>
                <li>Contact Support</li>
                <li>System Status</li>
                <li>Documentation</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 ServicePro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
