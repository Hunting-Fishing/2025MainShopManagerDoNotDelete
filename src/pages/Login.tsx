
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthUser } from '@/hooks/useAuthUser';
import { AuthService } from '@/lib/services/AuthService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ServiceErrorBoundary } from '@/components/common/ServiceErrorBoundary';
import { BaseFormField } from '@/components/forms/BaseFormField';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuthUser();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!validateEmail(loginForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!validatePassword(loginForm.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await AuthService.signIn(loginForm.email, loginForm.password);
      
      if (error) {
        setErrors({ submit: error.message });
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        });
        // Navigation will be handled by the useEffect hook
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrors({ submit: errorMessage });
      toast({
        title: 'Login Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!validateEmail(signupForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!validatePassword(signupForm.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!signupForm.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!signupForm.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await AuthService.signUp(
        signupForm.email, 
        signupForm.password,
        {
          firstName: signupForm.firstName,
          lastName: signupForm.lastName
        }
      );
      
      if (error) {
        setErrors({ submit: error.message });
        toast({
          title: 'Signup Failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Account Created!',
          description: 'Please check your email to verify your account.',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrors({ submit: errorMessage });
      toast({
        title: 'Signup Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to Auto Shop Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <BaseFormField
                  label="Email"
                  error={errors.email}
                  required
                  htmlFor="login-email"
                >
                  <Input
                    id="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </BaseFormField>

                <BaseFormField
                  label="Password"
                  error={errors.password}
                  required
                  htmlFor="login-password"
                >
                  <Input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </BaseFormField>

                {errors.submit && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {errors.submit}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <BaseFormField
                    label="First Name"
                    error={errors.firstName}
                    required
                    htmlFor="signup-firstName"
                  >
                    <Input
                      id="signup-firstName"
                      type="text"
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="First name"
                      disabled={isSubmitting}
                    />
                  </BaseFormField>

                  <BaseFormField
                    label="Last Name"
                    error={errors.lastName}
                    required
                    htmlFor="signup-lastName"
                  >
                    <Input
                      id="signup-lastName"
                      type="text"
                      value={signupForm.lastName}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Last name"
                      disabled={isSubmitting}
                    />
                  </BaseFormField>
                </div>

                <BaseFormField
                  label="Email"
                  error={errors.email}
                  required
                  htmlFor="signup-email"
                >
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                  />
                </BaseFormField>

                <BaseFormField
                  label="Password"
                  error={errors.password}
                  required
                  htmlFor="signup-password"
                >
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create a password"
                    disabled={isSubmitting}
                  />
                </BaseFormField>

                <BaseFormField
                  label="Confirm Password"
                  error={errors.confirmPassword}
                  required
                  htmlFor="signup-confirmPassword"
                >
                  <Input
                    id="signup-confirmPassword"
                    type="password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm your password"
                    disabled={isSubmitting}
                  />
                </BaseFormField>

                {errors.submit && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {errors.submit}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
