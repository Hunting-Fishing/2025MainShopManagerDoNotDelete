import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthUser } from '@/hooks/useAuthUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthService } from '@/lib/services/AuthService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, LogIn, ArrowRight, Wrench, Info, Phone, HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PublicLayout } from '@/components/layout/PublicLayout';

// Mobile background
import mobileBgLogin from '@/assets/mobile-bg-login.jpg';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Password reset state
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      // Skip auto-redirect if coming from logout
      const params = new URLSearchParams(window.location.search);
      if (params.get('logout') === 'true') {
        // Clear the param from URL without triggering navigation
        window.history.replaceState({}, '', '/login');
        return;
      }

      if (isAuthenticated) {
        // Check if user has a shop
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('shop_id')
            .or(`id.eq.${user.id},user_id.eq.${user.id}`)
            .single();
          
          if (profile?.shop_id) {
            // Get enabled modules for the shop
            const { data: enabledModules } = await supabase
              .from('shop_enabled_modules')
              .select('module_id')
              .eq('shop_id', profile.shop_id);
            
            // Get module details to find the slugs
            if (enabledModules && enabledModules.length > 0) {
              const { data: modules } = await supabase
                .from('business_modules')
                .select('slug')
                .in('id', enabledModules.map(em => em.module_id))
                .order('display_order');
              
              if (modules && modules.length === 1) {
                // Only 1 module - go directly to it
                navigate(`/${modules[0].slug}`, { replace: true });
                return;
              } else if (modules && modules.length > 1) {
                // Multiple modules - go to module hub to choose
                navigate('/module-hub', { replace: true });
                return;
              }
            }
            
            // Fallback to module-hub if no enabled modules found
            navigate('/module-hub', { replace: true });
          } else {
            navigate('/onboarding', { replace: true });
          }
        }
      }
    };
    
    checkUserAndRedirect();
  }, [navigate, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await AuthService.signIn(email, password);
      if (error) {
        toast({
          title: "Sign In Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Success will be handled by the auth state change listener
        toast({
          title: "Success",
          description: "Signing you in...",
        });
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
    <PublicLayout activeLink="login">
      {/* Mobile Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat md:hidden z-0"
        style={{ backgroundImage: `url(${mobileBgLogin})` }}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="relative w-full max-w-md">
        {/* Main Card */}
        <Card className="modern-card-elevated backdrop-blur-sm bg-card/95 border-border/50 shadow-glow">
          <CardHeader className="text-center pb-8">
            {/* Brand Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-lg">
              <Wrench className="w-8 h-8 text-primary-foreground" />
            </div>
            
            <CardTitle className="text-3xl font-heading gradient-text mb-2">
              Welcome Back
            </CardTitle>
            <p className="text-muted-foreground font-body">
              Sign in to your All Business 365 account
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="pl-12 h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-12 h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              
              {/* Sign In Button */}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl btn-gradient-primary font-semibold text-base group relative overflow-hidden transition-all duration-300 hover:shadow-glow"
              >
                <span className="flex items-center justify-center gap-3">
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </Button>
            </form>
            
            {/* Links Section */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="text-center">
                <Link 
                  to="/signup" 
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-300 group"
                >
                  Don't have an account? 
                  <span className="underline decoration-primary/30 group-hover:decoration-primary transition-colors duration-300">
                    Sign up here
                  </span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setShowResetDialog(true);
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 underline decoration-muted-foreground/30 hover:decoration-foreground"
                >
                  Forgot your password?
                </button>
              </div>
            </div>
            
            {/* Additional Features Section */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  to="/about" 
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors duration-300 p-2 rounded-lg hover:bg-primary/5 group"
                >
                  <Info className="w-3 h-3 group-hover:text-primary" />
                  About Us
                </Link>
                
                <button
                  type="button"
                  onClick={() => {
                    toast({
                      title: "Contact Support",
                      description: "Call us at 1-800-AUTO-PRO or email support@autoshoppro.com",
                    });
                  }}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors duration-300 p-2 rounded-lg hover:bg-primary/5 group"
                >
                  <Phone className="w-3 h-3 group-hover:text-primary" />
                  Support
                </button>
              </div>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    toast({
                      title: "Demo Credentials",
                      description: "Use demo@autoshoppro.com / demo123 for testing",
                      duration: 8000,
                    });
                  }}
                  className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors duration-300 p-2 rounded-lg hover:bg-primary/5 group"
                >
                  <HelpCircle className="w-3 h-3 group-hover:text-primary" />
                  Need demo credentials?
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Footer below card */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Secure login powered by Supabase
          </p>
        </div>
      </div>
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!resetEmail.trim()) {
                toast({
                  title: "Email Required",
                  description: "Please enter your email address.",
                  variant: "destructive",
                });
                return;
              }
              
              setIsResetting(true);
              try {
                const { error } = await AuthService.resetPassword(resetEmail.trim());
                if (error) {
                  toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                  });
                } else {
                  toast({
                    title: "Check Your Email",
                    description: "We've sent you a password reset link. Please check your inbox.",
                    duration: 6000,
                  });
                  setShowResetDialog(false);
                  setResetEmail('');
                }
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to send reset email. Please try again.",
                  variant: "destructive",
                });
              } finally {
                setIsResetting(false);
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="resetEmail">Email Address</Label>
              <Input
                id="resetEmail"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email address"
                className="h-11"
                required
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowResetDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isResetting}
                className="flex-1 btn-gradient-primary"
              >
                {isResetting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
