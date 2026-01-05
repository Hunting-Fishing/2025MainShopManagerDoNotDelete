import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { ModuleSelectionStep } from '@/components/onboarding/ModuleSelectionStep';
import { CompanySetupStep } from '@/components/onboarding/CompanySetupStep';
import { MODULE_CONFIGS } from '@/config/moduleSubscriptions';

const STEPS = ['Select Modules', 'Company Setup'];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleModuleToggle = (slug: string) => {
    setSelectedModules(prev => 
      prev.includes(slug) 
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    );
  };

  const handleCreateCompany = async (companyName: string) => {
    setIsLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Not authenticated');

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: companyName })
        .select()
        .single();
      if (orgError) throw orgError;

      // Create shop with trial info
      const { data: shop, error: shopError } = await supabase
        .from('shops')
        .insert({
          name: companyName,
          organization_id: org.id,
          trial_started_at: new Date().toISOString(),
          trial_days: 14
        })
        .select()
        .single();
      if (shopError) throw shopError;

      // Update user profile with shop_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ shop_id: shop.id })
        .or(`id.eq.${user.id},user_id.eq.${user.id}`);
      if (profileError) throw profileError;

      // Assign owner role
      const { data: ownerRole } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'owner')
        .single();

      if (ownerRole) {
        await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role_id: ownerRole.id });
      }

      // Enable selected modules for the shop
      if (selectedModules.length > 0) {
        const moduleInserts = selectedModules.map(slug => ({
          shop_id: shop.id,
          module_slug: slug,
          is_enabled: true
        }));
        
        await supabase
          .from('shop_enabled_modules')
          .insert(moduleInserts);
      }

      toast({
        title: "Welcome to your workspace!",
        description: `${companyName} is ready. Your 14-day trial has started.`
      });

      navigate('/module-hub');
      window.location.reload();
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4">
      <OnboardingProgress 
        currentStep={currentStep} 
        totalSteps={STEPS.length} 
        steps={STEPS} 
      />
      
      <Card className="w-full max-w-lg backdrop-blur-sm bg-card/95 border-border/50 shadow-lg">
        <CardContent className="p-6">
          {currentStep === 1 && (
            <ModuleSelectionStep
              selectedModules={selectedModules}
              onModuleToggle={handleModuleToggle}
              onContinue={() => setCurrentStep(2)}
            />
          )}
          
          {currentStep === 2 && (
            <CompanySetupStep
              onSubmit={handleCreateCompany}
              onBack={() => setCurrentStep(1)}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
      
      <Button 
        variant="ghost" 
        className="mt-6 text-muted-foreground hover:text-foreground" 
        onClick={handleLogout}
        disabled={isLoading}
      >
        Sign Out
      </Button>
    </div>
  );
}
