import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Loader2 } from 'lucide-react';

export default function Onboarding() {
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter your company name",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Not authenticated');

      // First create an organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: companyName.trim()
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create the shop linked to the organization
      const { data: shop, error: shopError } = await supabase
        .from('shops')
        .insert({
          name: companyName.trim(),
          organization_id: org.id
        })
        .select()
        .single();

      if (shopError) throw shopError;

      // Update the user's profile with the new shop_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ shop_id: shop.id })
        .or(`id.eq.${user.id},user_id.eq.${user.id}`);

      if (profileError) throw profileError;

      // Assign owner role to the user
      const { data: ownerRole } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'owner')
        .single();

      if (ownerRole) {
        await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role_id: ownerRole.id
          });
      }

      toast({
        title: "Company created!",
        description: `Welcome to ${companyName}. Your workspace is ready.`
      });

      // Redirect to dashboard
      navigate('/');
      window.location.reload(); // Force reload to refresh shop context
    } catch (error: any) {
      console.error('Error creating company:', error);
      toast({
        title: "Error creating company",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Building2 className="h-12 w-12 text-primary mx-auto mb-2" />
          <CardTitle>Welcome! Let's set up your company</CardTitle>
          <CardDescription>
            Create your company workspace to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Enter your company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Company'
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleLogout}
              disabled={isLoading}
            >
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
