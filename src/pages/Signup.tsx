import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthUser } from '@/hooks/useAuthUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthService } from '@/lib/services/AuthService';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Eye, EyeOff, Wrench, ArrowRight } from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function Signup() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthUser();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, isAuthenticated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name and last name are required.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      const { error } = await AuthService.signUp(
        formData.email,
        formData.password,
        {
          firstName: formData.firstName,
          lastName: formData.lastName
        }
      );

      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account before signing in.",
        });
        // Redirect to login after successful signup
        navigate('/login');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout activeLink="signup">
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="relative w-full max-w-md">
          <Card className="modern-card-elevated backdrop-blur-sm bg-card/95 border-border/50 shadow-glow">
            <CardHeader className="text-center pb-8">
              {/* Brand Icon */}
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-lg">
                <Wrench className="w-8 h-8 text-primary-foreground" />
              </div>
              
              <CardTitle className="text-3xl font-heading gradient-text mb-2">
                Create Account
              </CardTitle>
              <p className="text-muted-foreground font-body">
                Join All Business 365 today
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      className="h-11 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className="h-11 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com"
                    className="h-11 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="h-11 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm pr-10"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 6 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="h-11 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm pr-10"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl btn-gradient-primary font-semibold text-base group relative overflow-hidden transition-all duration-300 hover:shadow-glow mt-6" 
                  disabled={isSubmitting}
                >
                  <span className="flex items-center justify-center gap-3">
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Create Account
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </span>
                </Button>
                
                <div className="text-center pt-4 border-t border-border/50">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-300 group"
                  >
                    Already have an account? 
                    <span className="underline decoration-primary/30 group-hover:decoration-primary transition-colors duration-300">
                      Sign in
                    </span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
