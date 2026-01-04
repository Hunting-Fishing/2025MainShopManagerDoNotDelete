import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBusinessModules, useShopEnabledModules, useToggleModule } from '@/hooks/useEnabledModules';
import { useModuleAccess, useSubscribeToModule } from '@/hooks/useModuleSubscriptions';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { MODULE_CONFIGS } from '@/config/moduleSubscriptions';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Car, Target, Droplets, Anchor, Wind, Zap, Pipette,
  Truck, Wrench, ShieldCheck, Megaphone, Heart, Package, Users,
  Lock, Sparkles, CreditCard, Clock, CheckCircle, AlertCircle
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Car, Target, Droplets, Anchor, Wind, Zap, Pipette,
  Truck, Wrench, ShieldCheck, Megaphone, Heart, Package, Users,
};

function getIcon(iconName: string | null) {
  if (!iconName) return Package;
  return iconMap[iconName] || Package;
}

export default function BusinessModulesSettings() {
  const { toast } = useToast();
  const { data: userRoles = [] } = useUserRoles();
  const { data: modules = [], isLoading: modulesLoading } = useBusinessModules();
  const { data: enabledModules = [], isLoading: enabledLoading } = useShopEnabledModules();
  const toggleModule = useToggleModule();
  const { hasModuleAccess, getSubscriptionForModule, trialActive, trialEndsAt, isLoading: subLoading } = useModuleAccess();
  const subscribeToModule = useSubscribeToModule();

  const isOwner = userRoles.includes('owner');
  const isLoading = modulesLoading || enabledLoading || subLoading;

  const enabledModuleIds = new Set(enabledModules.map(em => em.module_id));

  // Determine if a module is enabled (explicitly or by default when no records exist)
  const isModuleEnabled = (moduleId: string, defaultEnabled: boolean): boolean => {
    if (enabledModules.length === 0) return defaultEnabled;
    return enabledModuleIds.has(moduleId);
  };

  const handleToggle = async (moduleId: string, moduleName: string, currentlyEnabled: boolean) => {
    if (!isOwner) {
      toast({
        title: "Permission Denied",
        description: "Only owners can manage business modules.",
        variant: "destructive",
      });
      return;
    }

    try {
      await toggleModule.mutateAsync({ moduleId, enabled: !currentlyEnabled });
      toast({
        title: currentlyEnabled ? "Module Disabled" : "Module Enabled",
        description: `${moduleName} has been ${currentlyEnabled ? 'disabled' : 'enabled'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update module. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = async (moduleSlug: string) => {
    await subscribeToModule.mutateAsync(moduleSlug);
  };

  const industryModules = modules.filter(m => m.category === 'industry');
  const operationsModules = modules.filter(m => m.category === 'operations');

  // Check if a module has a subscription product
  const isPurchasableModule = (slug: string) => !!MODULE_CONFIGS[slug];

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Business Modules
        </h1>
        <p className="text-muted-foreground mt-2">
          Subscribe to modules relevant to your business. Each module is billed separately.
        </p>
        
        {/* Trial Status Banner */}
        {trialActive && trialEndsAt && (
          <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-primary">Free Trial Active</p>
              <p className="text-sm text-muted-foreground">
                Trial ends {formatDistanceToNow(new Date(trialEndsAt), { addSuffix: true })} ({format(new Date(trialEndsAt), 'MMM d, yyyy')})
              </p>
            </div>
          </div>
        )}
        
        {!isOwner && (
          <div className="mt-4 p-3 bg-muted rounded-lg flex items-center gap-2 text-sm">
            <Lock className="h-4 w-4" />
            <span>Only owners can manage business modules. Contact your administrator for changes.</span>
          </div>
        )}
      </div>

      {/* Industry Modules - Purchasable */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Industry Modules
            <Badge variant="secondary">Subscription Required</Badge>
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose the industries and service types your business offers. Each module requires a separate subscription.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {industryModules.map(module => {
            const Icon = getIcon(module.icon);
            const enabled = isModuleEnabled(module.id, module.default_enabled);
            const hasAccess = hasModuleAccess(module.slug);
            const subscription = getSubscriptionForModule(module.slug);
            const config = MODULE_CONFIGS[module.slug];
            const isPurchasable = isPurchasableModule(module.slug);
            
            return (
              <Card 
                key={module.id} 
                className={`transition-all ${hasAccess ? 'border-primary/50 bg-primary/5' : 'border-dashed'}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${hasAccess ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Icon className={`h-5 w-5 ${hasAccess ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {module.name}
                          {config && (
                            <Badge variant="outline" className="text-xs font-normal">
                              ${config.price}/mo
                            </Badge>
                          )}
                        </CardTitle>
                      </div>
                    </div>
                    {hasAccess && !trialActive && subscription && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </Badge>
                    )}
                    {hasAccess && trialActive && (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Trial
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <CardDescription className="text-sm">
                    {module.description}
                  </CardDescription>
                  
                  {isPurchasable && !hasAccess && !trialActive && (
                    <Button 
                      onClick={() => handleSubscribe(module.slug)}
                      disabled={!isOwner || subscribeToModule.isPending}
                      className="w-full gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      Subscribe for ${config?.price}/mo
                    </Button>
                  )}
                  
                  {isPurchasable && trialActive && !subscription && (
                    <Button 
                      variant="outline"
                      onClick={() => handleSubscribe(module.slug)}
                      disabled={!isOwner || subscribeToModule.isPending}
                      className="w-full gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      Subscribe Now (${config?.price}/mo)
                    </Button>
                  )}
                  
                  {subscription && (
                    <p className="text-xs text-muted-foreground">
                      Renews {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
                    </p>
                  )}
                  
                  {hasAccess && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Enabled in navigation</span>
                      <Switch
                        checked={enabled}
                        onCheckedChange={() => handleToggle(module.id, module.name, enabled)}
                        disabled={!isOwner || toggleModule.isPending}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Operations Modules - Free with any subscription */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Operations Modules</h2>
          <p className="text-sm text-muted-foreground">
            Additional tools and features included with any subscription
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {operationsModules.map(module => {
            const Icon = getIcon(module.icon);
            const enabled = isModuleEnabled(module.id, module.default_enabled);
            
            return (
              <Card 
                key={module.id} 
                className={`transition-all ${enabled ? 'border-primary/50 bg-primary/5' : 'opacity-75'}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Icon className={`h-5 w-5 ${enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {module.name}
                          <Badge variant="secondary" className="text-xs">Included</Badge>
                        </CardTitle>
                      </div>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={() => handleToggle(module.id, module.name, enabled)}
                      disabled={!isOwner || toggleModule.isPending}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm">
                    {module.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
