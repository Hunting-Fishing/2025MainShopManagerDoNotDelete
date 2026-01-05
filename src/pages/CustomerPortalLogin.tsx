
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Shield, Mail, HelpCircle, Users } from 'lucide-react';

export default function CustomerPortalLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // For now, just show a message that this is under development
      setMessage('Customer portal login is under development. Please check back later.');
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-muted/50 to-background font-['Space_Grotesk',sans-serif]">
      {/* Header */}
      <header className="p-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="gap-2 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Login Card */}
          <Card className="shadow-lg">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-3xl font-semibold tracking-tight">Customer Portal</CardTitle>
              <CardDescription className="text-base">
                Access your service history, invoices, and appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login to Portal'}
                </Button>
                
                {message && (
                  <p className="text-sm text-center text-muted-foreground mt-4">
                    {message}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          {/* How to Get Access Card */}
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">How to Get Access</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  1
                </div>
                <p>Visit the shop and provide your email address during your service appointment.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  2
                </div>
                <p>The service provider will create a customer account for you in their system.</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  3
                </div>
                <p>You'll receive an email with a magic link to access your portal — no password needed!</p>
              </div>
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Your data is secured and encrypted</span>
          </div>
        </div>
      </main>
    </div>
  );
}
